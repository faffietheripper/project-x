"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBidAction({
  name,
  amount,
  emailAddress,
}: {
  name: string;
  amount: number;
  emailAddress: string;
}) {
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

  //from form

  await database.insert(bids).values({
    name,
    emailAddress,
    amount: amount,
    itemId: item.id,
    userId,
  });

  await database
    .update(items)
    .set({
      currentBid: amount,
    })
    .where(eq(items.id, itemId));

  const currentBids = await database.query.bids.findMany({
    where: eq(bids.itemId, itemId),
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

  revalidatePath(`/items/${itemId}`);
}
