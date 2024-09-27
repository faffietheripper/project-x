"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Knock } from "@knocklabs/node";
import { env } from "@/env";
import { isBidOver } from "@/util/bids";

const knock = new Knock(env.KNOCK_SECRET_KEY);

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
  // **Await** the isBidOver function, since it is async
  const bidOver = await isBidOver(item); // Ensure we await this function

  if (bidOver) {
    return { error: "This auction is already over." };
  }

  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    return {
      error: "Please update your profile before placing a bid.",
    };
  }

  try {
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

    await database
      .update(items)
      .set({
        currentBid: amount,
      })
      .where(eq(items.id, item.id));

    revalidatePath(`/items/${itemId}`);

    return { success: true };
  } catch (error) {
    console.error("Error creating bid:", error);
    return { error: "Failed to create bid." };
  }
}

// function to assign a winning bid

export async function handleAssignWinningBid(formData: FormData) {
  const itemId = formData.get("itemId");
  const bidId = formData.get("bidId");

  if (!itemId || !bidId) {
    console.error("Missing itemId or bidId");
    throw new Error("itemId or bidId is missing");
  }

  try {
    // Retrieve the bid and validate it belongs to the item
    const bid = await database.query.bids.findFirst({
      where: eq(bids.id, Number(bidId)),
    });

    if (!bid || bid.itemId !== Number(itemId)) {
      throw new Error("Invalid bid or bid does not belong to the item.");
    }

    // Update the item with the winning bid and set assigned to true
    await database
      .update(items)
      .set({
        winningBid: bid.id,
        assigned: true,
      })
      .where(eq(items.id, Number(itemId)));

    console.log("Bid assigned successfully");

    return { success: true };
  } catch (error) {
    console.error("Error assigning winning bid:", error);
    throw new Error("Failed to assign winning bid.");
  }
}
