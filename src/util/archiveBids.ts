"use server";

import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function archiveBids(formData: FormData) {
  const itemId = Number(formData.get("itemId"));

  if (!itemId) {
    throw new Error("Invalid item ID");
  }

  await database
    .update(items)
    .set({ archived: true })
    .where(eq(items.id, itemId));

  redirect("/home/my-activity/archived-listings");
}
