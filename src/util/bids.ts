import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Item } from "@/db/schema";

// Function to check if a bid is over and optionally archive the item
export async function isBidOver(item: Item) {
  // Ensure that item.endDate is properly parsed as a Date object (if it's not already)
  const bidEndDate = new Date(item.endDate);
  const currentDate = new Date();

  console.log("Bid End Date:", bidEndDate);
  console.log("Current Date:", currentDate);
  // Check if the bid end date is in the past
  const isOver = bidEndDate < currentDate;

  // If the bid is over and the item is not archived, archive it
  if (isOver && !item.archived) {
    await database
      .update(items)
      .set({ archived: true })
      .where(eq(items.id, item.id));
  }

  // Return whether the bid is over
  return isOver;
}
