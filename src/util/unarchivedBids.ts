"use server";

import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function unarchivedBids(formData: FormData) {
  const listingId = Number(formData.get("listingId"));

  if (!listingId) {
    throw new Error("Invalid listing ID");
  }

  // Add 14 days from now
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + 14);

  await database
    .update(wasteListings)
    .set({
      archived: false,
      endDate: newEndDate,
    })
    .where(eq(wasteListings.id, listingId));

  redirect("/home/my-activity/my-listings");
}
