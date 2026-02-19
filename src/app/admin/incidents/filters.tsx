"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (q) params.set("q", q);

    router.push(`/admin/incidents?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <select
        className="border p-2 rounded text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="under_review">Under Review</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>

      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="border p-2 rounded text-sm"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 rounded text-sm"
      />

      <input
        placeholder="Search summary..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="border p-2 rounded text-sm"
      />

      <button
        onClick={applyFilters}
        className="bg-black text-white px-4 py-2 rounded text-sm"
      >
        Apply
      </button>
    </div>
  );
}
