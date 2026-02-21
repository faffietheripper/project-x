import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { wasteListings as wasteListingsTable } from "@/db/schema";

type WasteListing = InferSelectModel<typeof wasteListingsTable>;

// Function to check if bidding is over and auto-archive the listing
export async function isBidOver(listing: WasteListing) {
  const bidEndDate = new Date(listing.endDate);
  const currentDate = new Date();

  const isOver = bidEndDate < currentDate;

  // Auto-archive if bidding ended and not already archived
  if (isOver && !listing.archived) {
    await database
      .update(wasteListings)
      .set({ archived: true })
      .where(eq(wasteListings.id, listing.id));
  }

  return isOver;
}
