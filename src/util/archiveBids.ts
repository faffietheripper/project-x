"use server";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { items, bids } from "@/db/schema";
import { createNotification } from "@/app/home/notifications/actions";
import { redirect } from "next/navigation";

export async function archiveBids(formData: FormData) {
  const itemId = Number(formData.get("itemId"));

  if (!itemId) {
    throw new Error("Invalid item ID");
  }

  try {
    // Step 1: Archive the item
    await database
      .update(items)
      .set({ archived: true })
      .where(eq(items.id, itemId));

    // Step 2: Fetch all users who placed a bid on this item
    const bidUsers = await database.query.bids.findMany({
      where: eq(bids.itemId, itemId),
      columns: { userId: true },
    });

    // Step 3: Fetch item details (for notification context)
    const item = await database.query.items.findFirst({
      where: eq(items.id, itemId),
      columns: { name: true },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    // Step 4: Notify all users who placed a bid
    await Promise.all(
      bidUsers.map(async (bidUser) => {
        const receiverId = bidUser.userId;
        const title = "Item Archived 📦";
        const message = `The item "${item.name}" you bid on has been archived. You can no longer bid on it.`;
        const itemUrl = `/home/my-activity/my-bids`;

        return createNotification(receiverId, title, message, itemUrl);
      })
    );

    console.log("Item archived and notifications sent successfully.");
  } catch (error) {
    console.error("Error archiving item:", error);
    throw new Error("Failed to archive item.");
  }

  // Move `redirect()` outside of the try-catch block to avoid catching it as an error
  redirect("/home/my-activity/archived-listings");
}
