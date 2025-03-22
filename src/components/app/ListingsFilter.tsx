"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage({ items }) {
  const router = useRouter();

  // State for the filters
  const [endDateFilter, setEndDateFilter] = useState("");
  const [minBidFilter, setMinBidFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Get unique locations for the select input
  const uniqueLocations = useMemo(() => {
    const locations = items.map((item) => item.location);
    return [...new Set(locations)];
  }, [items]);

  // Clear filters on initial render
  useEffect(() => {
    setEndDateFilter("");
    setMinBidFilter("");
    setLocationFilter("");
    router.replace(`/home/waste-listings`); // Replace history entry without query params
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleFilterSubmit = () => {
    const query = new URLSearchParams({
      endDate: endDateFilter,
      minBid: minBidFilter,
      location: locationFilter,
    }).toString();

    // Navigate to the results page with the filter query parameters
    router.push(`/home/waste-listings?${query}`);
  };

  const handleClearFilters = () => {
    setEndDateFilter("");
    setMinBidFilter("");
    setLocationFilter("");
    router.push(`/home/waste-listings`); // Navigate to the filtered-items page without any query params
  };

  return (
    <main className="mx-6 flex justify-between">
      <h1 className="font-bold text-center text-xl my-auto">
        Filter Your Search
      </h1>

      {/* Filter Form */}
      <div className="p-6 flex justify-between gap-x-6">
        <div>
          <h1 className="mb-2">End Date:</h1>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="p-2 w-full border rounded-md"
          />
        </div>

        <div className="">
          <h1 className="mb-2">Minimum Bid:</h1>
          <input
            type="number"
            value={minBidFilter}
            onChange={(e) => setMinBidFilter(e.target.value)}
            placeholder="Enter a value"
            className=" p-2 w-full rounded-md border"
          />
        </div>

        <div className="">
          <h1 className="mb-2">Location:</h1>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className=" p-2 w-full rounded-md border"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFilterSubmit}
          className="bg-blue-600 text-white p-2 rounded-md"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="bg-gray-600 text-white p-2 rounded-md"
        >
          Clear Filters
        </button>
      </div>
    </main>
  );
}
