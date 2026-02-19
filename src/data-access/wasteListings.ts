import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWasteListing(listingId: number) {
  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),
  });

  return listing;
}
