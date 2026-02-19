import { database } from "@/db/database";
import { wasteListings, bids } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWinningBid(listingId: number) {
  try {
    const listing = await database.query.wasteListings.findFirst({
      where: and(
        eq(wasteListings.id, listingId),
        eq(wasteListings.offerAccepted, true),
      ),
    });

    // If no listing or no winning bid assigned
    if (!listing || !listing.winningBidId) {
      return { listing: null, winningBid: null };
    }

    const winningBid = await database.query.bids.findFirst({
      where: eq(bids.id, listing.winningBidId),
      with: {
        organisation: {
          columns: {
            id: true,
            teamName: true,
          },
        },
        user: {
          columns: {
            name: true,
          },
        },
      },
    });

    return { listing, winningBid };
  } catch (error) {
    console.error("Error fetching listing with winning bid:", error);
    return { listing: null, winningBid: null };
  }
}
