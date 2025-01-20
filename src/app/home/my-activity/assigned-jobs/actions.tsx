"use server";

import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "../../notifications/actions";

export async function acceptOfferAction(formData: FormData) {
  const itemId = formData.get("itemId");

  if (!itemId) {
    throw new Error("Item ID is required to accept the offer.");
  }

  try {
    // Fetch the item details to ensure it exists and retrieve the necessary data
    const item = await database.query.items.findFirst({
      where: eq(items.id, Number(itemId)),
    });

    if (!item) {
      throw new Error("Item not found.");
    }

    // Update the item to set offerAccepted to true
    await database
      .update(items)
      .set({ offerAccepted: true })
      .where(eq(items.id, Number(itemId)));

    // Trigger a notification for the item owner
    const receiverId = item.userId; // The user who created the item
    console.log("Receiver ID:", receiverId);

    if (receiverId) {
      const title = "Job Accepted 🎉";
      const message = `Work on "${item.name}" is now in progress.`;
      const itemUrl = `/home/my-activity/jobs-in-progress`;

      await createNotification(receiverId, title, message, itemUrl);
    } else {
      console.warn("No receiver ID found for the item owner.");
    }

    // Notify the user of success
    alert("Offer accepted!");
    revalidatePath("/home/my-activity/assigned-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error accepting offer:", error);
    return { success: false, error: "Failed to accept the offer." };
  }
}

export async function declineOfferAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const bidId = Number(formData.get("bidId"));

  if (!itemId || !bidId) {
    throw new Error("Item ID and Bid ID are required to decline the offer.");
  }

  try {
    // Step 1: Update the item to mark it as declined, reset `winningBidId`, and set `assigned` to false
    await database
      .update(items)
      .set({
        assigned: false,
        winningBidId: null,
      })
      .where(eq(items.id, itemId));

    // Step 2: Update the bid to set `declinedOffer` to true
    await database
      .update(bids)
      .set({ declinedOffer: true })
      .where(eq(bids.id, bidId));

    console.log("Offer declined and bid marked as declined successfully.");
    revalidatePath("/home/my-activity/my-bids");

    return { success: true, message: "Offer declined successfully." };
  } catch (error) {
    console.error("Error declining offer:", error);
    return { success: false, message: "Failed to decline offer." };
  }
}

export async function cancelJobAction({ itemId, bidId, cancellationReason }) {
  if (!itemId || !bidId) {
    throw new Error("Item ID and Bid ID are required to cancel the job.");
  }

  try {
    const currentTimestamp = new Date();

    // Step 1: Update the specific bid to mark it as canceled and provide a reason
    await database
      .update(bids)
      .set({
        cancelledJob: true, // Mark job as canceled
        cancellationReason, // Set provided cancellation reason
        timestamp: currentTimestamp, // Record time of cancellation
      })
      .where(eq(bids.id, bidId));

    // Step 2: Update the related item to reset certain fields
    await database
      .update(items)
      .set({
        assigned: false, // Reset assignment
        offerAccepted: false, // Reset offer acceptance
        winningBidId: null, // Clear winning bid ID
      })
      .where(eq(items.id, itemId));

    console.log("Job canceled successfully with reason:", cancellationReason);
    return { success: true, message: "Job canceled successfully." };
  } catch (error) {
    console.error("Error canceling job:", error);
    return { success: false, message: "Failed to cancel job." };
  }
}

export async function completeJobAction(formData: FormData) {
  const itemId = formData.get("itemId");

  if (!itemId) {
    throw new Error("Item ID is missing");
  }

  // Update item status to completed in the database
  await database
    .update(items)
    .set({ completed: true })
    .where(eq(items.id, Number(itemId)));

  revalidatePath("/home/my-activity/completed-jobs");

  // Return a response if needed (e.g., redirect, toast message, etc.)
  return { success: true, message: "Item marked as completed." };
}
