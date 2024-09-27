"use server";

import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function unarchivedBids(formData: FormData) {
  const itemId = Number(formData.get("itemId"));

  if (!itemId) {
    throw new Error("Invalid item ID");
  }

  // Calculate new endDate (add 14 days from the current date)
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + 14);

  await database
    .update(items)
    .set({
      archived: false,
      endDate: newEndDate,
    })
    .where(eq(items.id, itemId));

  redirect("/home/my-activity/my-listings");
}
