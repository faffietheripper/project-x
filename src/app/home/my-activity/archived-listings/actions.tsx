"use server";

import { database } from "@/db/database";
import { items } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Delete an item by ID
export async function deleteItemAction(formData: FormData) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Get the itemId from the form data
  const itemId = formData.get("itemId");

  // Ensure itemId is a string (from FormData) and convert it to an integer
  if (typeof itemId !== "string" || isNaN(parseInt(itemId))) {
    throw new Error("Invalid item ID");
  }

  // Delete the item only if it belongs to the authenticated user
  await database
    .delete(items)
    .where(
      and(eq(items.id, parseInt(itemId)), eq(items.userId, session.user.id!))
    );

  // Revalidate the path to reflect changes immediately
  revalidatePath("/home/my-activity/archived-listings");
}
