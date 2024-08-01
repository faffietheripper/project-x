"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    throw new Error("You must be logged in to place a bid");
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  try {
    // Insert the new bid
    await database.insert(bids).values({
      companyName,
      emailAddress,
      amount,
      itemId: item.id,
      userId,
      timestamp: new Date(),
    });

    // Update the item's current bid
    await database
      .update(items)
      .set({
        currentBid: amount,
      })
      .where(eq(items.id, item.id));

    // Get the current bids
    const currentBids = await database.query.bids.findMany({
      where: eq(bids.itemId, item.id),
      with: {
        user: true,
      },
    });

    const recipients: {
      id: string;
      name: string;
      email: string;
    }[] = [];

    for (const bid of currentBids) {
      if (
        bid.userId !== userId &&
        !recipients.find((recipient) => recipient.id === bid.userId)
      ) {
        recipients.push({
          id: bid.userId + "",
          name: bid.user.name ?? "Anonymous",
          email: bid.user.email,
        });
      }
    }

    // Revalidate the item page
    revalidatePath(`/items/${itemId}`);
  } catch (error) {
    console.error("Error creating bid:", error);
    throw new Error("Failed to create bid");
  }
}
