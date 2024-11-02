import { database } from "@/db/database";
import { items, bids } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWinningBid(itemId: number) {
  try {
    const item = await database.query.items.findFirst({
      where: and(
        eq(items.id, itemId),
        eq(items.offerAccepted, true) // wait for the offer to be accepted
      ),
    });

    // If no item or no winning bid is assigned, return nulls
    if (!item || !item.winningBidId) {
      return { item: null, winningBid: null };
    }

    // Fetch the bid that matches the winningBidId
    const winningBid = await database.query.bids.findFirst({
      where: eq(bids.id, item.winningBidId),
    });

    // Return both the item and the winning bid
    return { item, winningBid };
  } catch (error) {
    console.error("Error fetching item with winning bid:", error);
    return { item: null, winningBid: null };
  }
}
