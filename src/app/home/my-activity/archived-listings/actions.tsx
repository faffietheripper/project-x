"use server";

import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteListingAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const listingIdRaw = formData.get("listingId");

  if (typeof listingIdRaw !== "string" || isNaN(parseInt(listingIdRaw))) {
    throw new Error("Invalid listing ID");
  }

  const listingId = parseInt(listingIdRaw);

  // Delete only if it belongs to authenticated user
  await database
    .delete(wasteListings)
    .where(
      and(
        eq(wasteListings.id, listingId),
        eq(wasteListings.userId, session.user.id),
      ),
    );

  revalidatePath("/home/my-activity/archived-listings");
}
