"use server";

import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Delete a bid by ID
export async function deleteBidAction(formData: FormData) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Get the bidId from the form data
  const bidId = formData.get("bidId");

  // Ensure bidId is a string (from FormData) and convert it to an integer
  if (typeof bidId !== "string" || isNaN(parseInt(bidId))) {
    throw new Error("Invalid bid ID");
  }

  // Delete the bid only if it belongs to the authenticated user
  await database
    .delete(bids)
    .where(
      and(eq(bids.id, parseInt(bidId)), eq(bids.userId, session.user.id!))
    );

  // Optionally, revalidate the path to reflect changes immediately
  revalidatePath("/home/my-activity/my-bids");
}

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
    return { success: true };
  } catch (error) {
    console.error("Error accepting offer:", error);
    return { success: false, error: "Failed to accept the offer." };
  }
}

export async function declineOfferAction(formData: FormData) {
  const itemId = formData.get("itemId");

  if (!itemId) {
    throw new Error("Item ID is required to accept the offer.");
  }

  try {
    const currentTimestamp = new Date().toISOString();

    // Step 1: Update the item to mark it as declined, reset `winningBidId`, and set `assigned` to false
    await database
      .update(items)
      .set({
        assigned: false,
        winningBidId: null,
        declined: true,
        declinedAt: currentTimestamp,
      })
      .where(eq(items.id, itemId));

    // Step 2: Delete the bid from the bids table
    await database.delete(bids).where(eq(bids.id, bidId));

    console.log("Offer declined and bid deleted successfully.");
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
    const currentTimestamp = new Date().toISOString(); // Record the time of cancellation

    // Update the item to mark it as canceled and record the reason
    await database
      .update(items)
      .set({
        assigned: false,
        offerAccepted: false, // Reset offerAccepted to false
        winningBidId: null,
        canceled: true,
        canceledAt: currentTimestamp,
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
