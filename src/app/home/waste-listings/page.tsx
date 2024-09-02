import React from "react";
import { database } from "@/db/database";
import ItemCard from "@/components/ItemCard";

// Ensure you're in the `/app/filtered-items/` directory
export default async function FilteredItemsPage({ searchParams }) {
  const { endDate, minBid, location } = searchParams;

  const allItems = await database.query.items.findMany();

  // Filter items based on query parameters
  const filteredItems = allItems
    .filter((item) => {
      if (endDate) {
        return new Date(item.endDate) <= new Date(endDate);
      }
      return true;
    })
    .filter((item) => {
      if (minBid) {
        return item.startingPrice >= parseFloat(minBid);
      }
      return true;
    })
    .filter((item) => {
      if (location) {
        return item.location === location;
      }
      return true;
    });

  return (
    <main className="">
      <h1 className="font-bold text-3xl text-center mt-8 mb-14">
        Waste Listings
      </h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {filteredItems.length > 0 ? (
          filteredItems
            .slice()
            .reverse()
            .map((item) => <ItemCard key={item.id} item={item} />)
        ) : (
          <p>No items match your criteria.</p>
        )}
      </div>
    </main>
  );
}
