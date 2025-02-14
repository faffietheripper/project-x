"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items, profiles } from "@/db/schema";
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
      timestamp: new Date(),
    });

    // Update the item's current bid
    await database
      .update(items)
      .set({ currentBid: amount })
      .where(eq(items.id, item.id));

    // Trigger a notification for the item owner
    const receiverId = item.userId;
    console.log("receiver", receiverId);
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

// function to assign a winning bid
/*
export async function handleAssignWinningBid(formData: FormData) {
  const itemId = formData.get("itemId");
  const bidId = formData.get("bidId");

  if (!itemId || !bidId) {
    return { success: false, message: "id is missing" };
  }

  try {
    // Check if the item already has a winning bid
    const item = await database.query.items.findFirst({
      where: eq(items.id, Number(itemId)),
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    if (item.assigned) {
      return { success: false, message: "winning bid already assigned" };
    }

    // Retrieve the bid and validate it belongs to the item
    const bid = await database.query.bids.findFirst({
      where: eq(bids.id, Number(bidId)),
    });

    if (!bid || bid.itemId !== Number(itemId)) {
      return { success: false, message: "invalid bid" };
    }

    // Update the item with the winning bid and set assigned to true
    await database
      .update(items)
      .set({
        winningBid: bid.id,
        assigned: true,
      })
      .where(eq(items.id, Number(itemId)));

    return { success: false, message: "Bid placed successfully" }; // Return success if everything is fine
  } catch (error) {
    console.error("Error assigning winning bid:", error);
    return { success: false, message: "failed to assign winning bid " };
  }
}
*/

//function to assign a winning bid

export async function handleAssignWinningBid(formData: FormData) {
  const itemId = formData.get("itemId");
  const bidId = formData.get("bidId");

  if (!itemId || !bidId) {
    return { success: false, message: "ID is missing" };
  }

  try {
    // Fetch the item along with the winningBid relationship
    const item = await database.query.items.findFirst({
      where: eq(items.id, Number(itemId)),
      with: {
        winningBid: true, // Include the winning bid relationship
      },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    // Check if a winning bid has already been assigned
    if (item.winningBidId) {
      return { success: false, message: "Winning bid already assigned" };
    }

    // Fetch the bid and validate it belongs to the item
    const bid = await database.query.bids.findFirst({
      where: eq(bids.id, Number(bidId)),
    });

    if (!bid || bid.itemId !== Number(itemId)) {
      return { success: false, message: "Invalid bid" };
    }

    // Assign the winning bid
    await database
      .update(items)
      .set({
        winningBidId: bid.id,
        assigned: true,
      })
      .where(eq(items.id, Number(itemId)));

    // Trigger a notification for the bid owner
    const receiverId = bid.userId; // Fetch directly from the bid
    console.log("Receiver ID:", receiverId);

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
