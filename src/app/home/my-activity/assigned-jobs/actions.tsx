"use server";

import { database } from "@/db/database";
import { items, bids, notifications } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
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

export async function cancelJobAction({
  itemId,
  bidId,
  cancellationReason,
}: {
  itemId: number;
  bidId: number;
  cancellationReason: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  if (!cancellationReason.trim()) {
    return { success: false, message: "Cancellation reason required." };
  }

  try {
    // 🔍 Ensure this bid belongs to this user
    const bid = await database.query.bids.findFirst({
      where: and(eq(bids.id, bidId), eq(bids.userId, session.user.id)),
    });

    if (!bid) {
      return { success: false, message: "Bid not found." };
    }

    // 1️⃣ Mark bid as cancelled
    await database
      .update(bids)
      .set({
        cancelledJob: true,
        cancellationReason,
      })
      .where(eq(bids.id, bidId));

    // 2️⃣ Reset item so it goes back to marketplace
    await database
      .update(items)
      .set({
        winningBidId: null,
        winningOrganisationId: null,
        offerAccepted: false,
        assigned: false,
        assignedCarrierOrganisationId: null,
        assignedByOrganisationId: null,
        carrierStatus: "pending",
      })
      .where(eq(items.id, itemId));

    // 3️⃣ Notify item owner (waste generator)
    await database.insert(notifications).values({
      receiverId: bid.userId,
      title: "Job Cancelled",
      message: `The winning bid for "${bid.itemName}" has been cancelled. The item is now relisted.`,
      url: `/home/items/${itemId}`,
    });

    revalidatePath("/home/items");
    revalidatePath("/home/my-activity");

    return {
      success: true,
      message: "Job successfully cancelled and relisted.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong." };
  }
}
