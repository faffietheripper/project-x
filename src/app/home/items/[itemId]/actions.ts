"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items, profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isBidOver } from "@/util/bids";
import { createNotification } from "../../notifications/actions";

interface CreateBidActionParams {
  companyName: string;
  amount: number;
  emailAddress: string;
  itemId: string;
}

export async function createBidAction({
  companyName,
  amount,
  emailAddress,
  itemId,
}: CreateBidActionParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You must be logged in to place a bid." };
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    return { error: "Item not found." };
  }

  const bidOver = await isBidOver(item);

  if (bidOver) {
    return { error: "This auction is already over." };
  }

  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    return { error: "Please update your profile before placing a bid." };
  }

  const userRecord = await database.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userRecord || !userRecord.organisationId) {
    return { error: "User must belong to an organisation to place a bid." };
  }

  try {
    // Insert the new bid
    await database.insert(bids).values({
      companyName,
      emailAddress,
      amount,
      itemId: item.id,
      itemName: item.name,
      userId,
      profileId: profile.id,
      organisationId: userRecord.organisationId, // ✅ New field
      timestamp: new Date(),
    });

    // Update the item's current bid
    await database
      .update(items)
      .set({ currentBid: amount })
      .where(eq(items.id, item.id));

    // Trigger a notification for the item owner
    const receiverId = item.userId;

    if (receiverId) {
      const title = "New bid placed";
      const message = `Someone has placed a bid on your item "${item.name}".`;
      const itemUrl = `/home/items/${item.id}`;

      await createNotification(receiverId, title, message, itemUrl);
    }

    revalidatePath(`/items/${itemId}`);

    return { success: true };
  } catch (error) {
    console.error("Error creating bid:", error);
    return { error: "Failed to create bid." };
  }
}
export async function handleAssignWinningBid(formData: FormData) {
  const itemId = formData.get("itemId");
  const bidId = formData.get("bidId");

  if (!itemId || !bidId) {
    return { success: false, message: "ID is missing" };
  }

  try {
    // Fetch the item with its winningBid relationship
    const item = await database.query.items.findFirst({
      where: eq(items.id, Number(itemId)),
      with: {
        winningBid: true,
      },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    if (item.winningBidId) {
      return { success: false, message: "Winning bid already assigned" };
    }

    // Fetch the bid including organisationId
    const bid = await database.query.bids.findFirst({
      where: eq(bids.id, Number(bidId)),
    });

    if (!bid || bid.itemId !== Number(itemId)) {
      return { success: false, message: "Invalid bid" };
    }

    // ✅ Update both winningBidId and winningOrganisationId
    await database
      .update(items)
      .set({
        winningBidId: bid.id,
        winningOrganisationId: bid.organisationId, // ✅ Add this line
        assigned: true,
      })
      .where(eq(items.id, Number(itemId)));

    const receiverId = bid.userId;

    if (receiverId) {
      const title = "New Job Assigned 🎉";
      const message = `You have won the auction for your bid on "${item.name}".`;
      const itemUrl = `/home/my-activity/assigned-jobs`;

      await createNotification(receiverId, title, message, itemUrl);
    }

    return { success: true, message: "Bid assigned successfully" };
  } catch (error) {
    console.error("Error assigning winning bid:", error);
    return { success: false, message: "Failed to assign winning bid" };
  }
}
