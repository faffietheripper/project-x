"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CarriersFilter({ organisations }) {
  const router = useRouter();
  const [locationFilter, setLocationFilter] = useState("");

  // Unique regions from organisations
  const uniqueRegions = useMemo(() => {
    const regions = organisations.map((org) => org.region);
    return [...new Set(regions)];
  }, [organisations]);

  const handleFilterSubmit = () => {
    const params = new URLSearchParams();
    if (locationFilter) params.set("region", locationFilter);
    router.push(`/home/the-hub?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setLocationFilter("");
    router.push(`/home/the-hub`);
  };

  return (
    <main className="h-[13vh] flex justify-between items-center px-10">
      <h1 className="font-bold text-center text-xl my-auto">
        Filter Waste Carriers
      </h1>

      {/* Filter Form */}
      <div className="p-6 flex justify-between gap-x-6">
        <div>
          <h1 className="mb-2 text-sm font-medium">Region:</h1>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="p-2 w-full rounded-md border"
          >
            <option value="">All Regions</option>
            {uniqueRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFilterSubmit}
          className="bg-blue-600 text-white p-2 h-fit rounded-md"
        >
          Apply Filters
        </button>

        <button
          onClick={handleClearFilters}
          className="bg-gray-600 text-white p-2 h-fit rounded-md"
        >
          Clear Filters
        </button>
      </div>
    </main>
  );
}
