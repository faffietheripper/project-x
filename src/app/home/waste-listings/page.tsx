import React from "react";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { wasteListings } from "@/db/schema";
import ListingCard from "@/components/ListingCard";
import ListingsFilter from "@/components/app/ListingsFilter";

export default async function FilteredListingsPage({
  searchParams,
}: {
  searchParams: {
    endDate?: string;
    minBid?: string;
    location?: string;
  };
}) {
  const { endDate, minBid, location } = searchParams;

  // ✅ Fetch non-archived listings
  const allListings = await database.query.wasteListings.findMany({
    where: eq(wasteListings.archived, false),
  });

  // ✅ Filter client-side (we’ll optimise later)
  const filteredListings = allListings
    .filter((listing) => {
      if (endDate) {
        return new Date(listing.endDate) <= new Date(endDate);
      }
      return true;
    })
    .filter((listing) => {
      if (minBid) {
        return listing.startingPrice >= parseFloat(minBid);
      }
      return true;
    })
    .filter((listing) => {
      if (location) {
        return listing.location === location;
      }
      return true;
    });

  return (
    <main>
      <div className="w-full shadow-md pl-[24vw] pt-[13vh] pb-8 fixed bg-gray-50">
        <ListingsFilter listings={allListings} />
      </div>
      <section className="pl-[24vw] min-h-screen overflow-y-scroll py-64 px-12">
        <h1 className="font-bold text-3xl text-center mt-8 mb-14">
          Waste Listings
        </h1>

        <div className="grid grid-cols-3 gap-6 mt-6">
          {filteredListings.length > 0 ? (
            filteredListings
              .slice()
              .reverse()
              .map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
          ) : (
            <p>No listings match your criteria.</p>
          )}
        </div>
      </section>
    </main>
  );
}
