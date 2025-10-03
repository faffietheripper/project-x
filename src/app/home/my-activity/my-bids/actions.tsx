"use server";

import { database } from "@/db/database";
import { bids } from "@/db/schema";
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

//not using this for now because you can always decline the offer or make another bid but they need to be told !!
