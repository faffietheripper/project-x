import { database } from "@/db/database";
import { items, bids } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWinningBid(itemId: number) {
  try {
    // Fetch the item along with the related winning bid
    const item = await database.query.items.findFirst({
      where: eq(items.id, itemId),
      with: {
        winningBid: true, // This retrieves the related winning bid in one go
      },
    });

    // If no item or no winning bid is assigned, return nulls
    if (!item || !item.winningBid) {
      return { item: null, winningBid: null };
    }

    // Return both item and winning bid directly from the retrieved data
    return { item, winningBid: item.winningBid };
  } catch (error) {
    console.error("Error fetching item with winning bid:", error);
    return { item: null, winningBid: null };
  }
}
