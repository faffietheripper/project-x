"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function WasteListingsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
  const [minBid, setMinBid] = useState(searchParams.get("minBid") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (endDate) params.set("endDate", endDate);
    if (minBid) params.set("minBid", minBid);
    if (location) params.set("location", location);

    router.push(`/home/waste-listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setEndDate("");
    setMinBid("");
    setLocation("");
    router.push(`/home/waste-listings`);
  };

  return (
    <div className="flex items-end gap-6 px-6 py-4 border-b">
      <div>
        <label className="block text-sm font-medium mb-2">End Before</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Minimum Bid (£)
        </label>
        <input
          type="number"
          value={minBid}
          onChange={(e) => setMinBid(e.target.value)}
          className="border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. London"
          className="border rounded-md p-2"
        />
      </div>

      <button
        onClick={applyFilters}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Apply
      </button>

      <button
        onClick={clearFilters}
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
      >
        Clear
      </button>
    </div>
  );
}
