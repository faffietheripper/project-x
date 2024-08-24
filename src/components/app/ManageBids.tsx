"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { database } from "@/db/database";
import { bids } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function ManageBids({ allBids }) {
  const router = useRouter();

  return (
    <div>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">My Bids</h1>
        {hasBids ? (
          <ul className="space-y-4">
            {allBids.map((bid) => (
              <li key={bid.id} className="p-4 border rounded-lg shadow-sm">
                <div>
                  <strong>Bid Amount:</strong> ${bid.amount}
                </div>
                <div>
                  <strong>Item ID:</strong> {bid.itemId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(bid.createdAt).toLocaleString()}
                </div>
                <div className="mt-4 flex space-x-4">
                  <Link href={`/home/items/${bid.itemId}`}>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                      View Item
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteBid(bid.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Delete Bid
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You have not placed any bids yet.</p>
        )}
      </div>
    </div>
  );
}
