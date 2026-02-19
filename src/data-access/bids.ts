import { database } from "@/db/database";
import { bids } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getBidsForListing(listingId: number) {
  const allBids = await database.query.bids.findMany({
    where: eq(bids.listingId, listingId),
    orderBy: desc(bids.id),
    with: {
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
      organisation: {
        columns: {
          id: true,
          teamName: true,
        },
      },
    },
  });

  return allBids;
}
