"use server";

import { database } from "@/db/database";
import { items } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "../../notifications/actions";

export async function acceptOfferAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const itemId = Number(formData.get("itemId"));
  if (!itemId) throw new Error("Item ID required");

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) throw new Error("Item not found");

  await database
    .update(items)
    .set({ offerAccepted: true })
    .where(eq(items.id, itemId));

  if (item.userId) {
    await createNotification(
      item.userId,
      "Job Accepted 🎉",
      `Your job "${item.name}" has been accepted and will be assigned to a carrier shortly.`,
      "/home/my-activity/jobs-in-progress",
    );
  }

  // 🔁 Refresh UI
  revalidatePath("/home/my-activity/my-bids");
  revalidatePath("/home/my-activity/jobs-in-progress");
}

export async function declineOfferAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const itemId = Number(formData.get("itemId"));
  const bidId = Number(formData.get("bidId"));

  if (!itemId || !bidId) throw new Error("Missing IDs");

  await database
    .update(items)
    .set({
      assigned: false,
      winningBidId: null,
      offerAccepted: false,
    })
    .where(eq(items.id, itemId));

  await database
    .update(bids)
    .set({ declinedOffer: true })
    .where(eq(bids.id, bidId));

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (item?.userId) {
    await createNotification(
      item.userId,
      "Offer Declined ❌",
      `The offer for "${item.name}" was declined.`,
      "/home/my-activity/my-listings",
    );
  }

  // 🔁 Refresh UI
  revalidatePath("/home/my-activity/my-bids");
}
