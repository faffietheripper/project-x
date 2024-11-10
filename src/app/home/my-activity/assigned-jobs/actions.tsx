"use server";

import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function acceptOfferAction(formData: FormData) {
  const itemId = formData.get("itemId");

  if (!itemId) {
    throw new Error("Item ID is required to accept the offer.");
  }

  try {
    // Update the item to set offerAccepted to true
    await database
      .update(items)
      .set({ offerAccepted: true })
      .where(eq(items.id, Number(itemId)));

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

export async function cancelJobAction(formData: FormData) {
  const itemId = formData.get("itemId");

  if (!itemId) {
    throw new Error("Item ID is required to accept the offer.");
  }
  try {
    const currentTimestamp = new Date().toLocaleString(); // Record the time of cancellation

    // Update the item to mark it as canceled and record the reason
    await database
      .update(items)
      .set({
        assigned: false,
        offerAccepted: false, // Reset offerAccepted to false
        winningBidId: null,
        canceled: true,
        cancellationReason: reason || null, // Set reason if provided
      })
      .where(eq(items.id, itemId));

    console.log("Job canceled successfully.");
    return { success: true, message: "Job canceled successfully." };
  } catch (error) {
    console.error("Error canceling job:", error);
    return { success: false, message: "Failed to cancel job." };
  }
}
