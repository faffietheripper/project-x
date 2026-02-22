import { database } from "@/db/database";
import { wasteListings, bids } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWinningBid(listingId: number) {
  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),
    with: {
      bids: {
        with: {
          organisation: true,
        },
      },
    },
  });

  if (!listing?.winningBidId) {
    return { winningBid: null };
  }

  const winning = listing.bids.find((b) => b.id === listing.winningBidId);

  if (!winning) {
    return { winningBid: null };
  }

  return {
    winningBid: {
      amount: winning.amount,
      companyName: winning.organisation?.teamName ?? "Unknown",
      emailAddress: winning.organisation?.emailAddress ?? "N/A",
    },
  };
}
