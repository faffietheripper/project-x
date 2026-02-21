"use server";

import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { wasteListings, bids } from "@/db/schema";
import { createNotification } from "@/app/home/notifications/actions";
import { redirect } from "next/navigation";

export async function archiveBids(formData: FormData) {
  const listingId = Number(formData.get("listingId"));

  if (!listingId) {
    throw new Error("Invalid listing ID");
  }

  try {
    // 1️⃣ Archive the listing
    await database
      .update(wasteListings)
      .set({ archived: true })
      .where(eq(wasteListings.id, listingId));

    // 2️⃣ Fetch all users who placed a bid on this listing
    const bidUsers = await database.query.bids.findMany({
      where: eq(bids.listingId, listingId),
      columns: { userId: true },
    });

    // 3️⃣ Fetch listing details for notification context
    const listing = await database.query.wasteListings.findFirst({
      where: eq(wasteListings.id, listingId),
      columns: { name: true },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    // 4️⃣ Notify all users who placed a bid
    await Promise.all(
      bidUsers.map(async (bidUser) => {
        const receiverId = bidUser.userId;
        const title = "Listing Archived 📦";
        const message = `The listing "${listing.name}" you bid on has been archived. You can no longer bid on it.`;
        const itemUrl = `/home/my-activity/my-bids`;

        return createNotification(receiverId, title, message, itemUrl);
      }),
    );

    console.log("Listing archived and notifications sent successfully.");
  } catch (error) {
    console.error("Error archiving listing:", error);
    throw new Error("Failed to archive listing.");
  }

  redirect("/home/my-activity/archived-listings");
}
