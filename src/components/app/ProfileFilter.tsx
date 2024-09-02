"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileFilter({ profiles }) {
  const router = useRouter();

  // State for the filters
  const [locationFilter, setLocationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Get unique locations for the select input
  const uniqueLocations = useMemo(() => {
    const locations = profiles.map((profile) => profile.region);
    return [...new Set(locations)];
  }, [profiles]);

  // Clear filters on initial render
  useEffect(() => {
    setLocationFilter("");
    setRoleFilter("");
    router.replace(`/home/the-hub`); // Replace history entry without query params
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleFilterSubmit = () => {
    const query = new URLSearchParams({
      location: locationFilter,
      role: roleFilter,
    }).toString();

    // Navigate to the results page with the filter query parameters
    router.push(`/home/the-hub?${query}`);
  };

  const handleClearFilters = () => {
    setLocationFilter("");
    setRoleFilter("");
    router.push(`/home/the-hub`); // Navigate to the filtered-profiles page without any query params
  };

  return (
    <main className="mx-6 my-5">
      {/* Filter Form */}
      <div className="flex justify-between">
        <div className="flex gap-x-8">
          <div className="flex gap-x-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className=" p-2 w-48 rounded-md border"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-x-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className=" p-2 w-48 rounded-md border"
            >
              <option value="">All Roles</option>
              <option value="wasteManager">Waste Manager</option>
              <option value="wasteGenerator">Waste Generator</option>
            </select>
          </div>
        </div>

        <div className="flex gap-x-3">
          <button
            onClick={handleFilterSubmit}
            className="bg-blue-600 h-fit text-white p-2 rounded-md"
          >
            Apply Filters
          </button>

          <button
            onClick={handleClearFilters}
            className="bg-gray-600 h-fit text-white p-2 rounded-md"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </main>
  );
}
