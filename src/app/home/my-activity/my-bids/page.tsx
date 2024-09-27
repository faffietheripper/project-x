import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { bids } from "@/db/schema";
import Link from "next/link";
import { deleteBidAction } from "@/app/home/my-activity/my-bids/actions";

export default async function MyBids() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const allBids = await database.query.bids.findMany({
    where: eq(bids.userId, session.user.id!),
  });

  const hasBids = allBids.length > 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Bids</h1>
      {hasBids ? (
        <ul className="space-y-4">
          {allBids.map((bid) => (
            <li
              key={bid.id}
              className="p-6 border flex justify-between rounded-lg shadow-sm"
            >
              <section>
                <div>
                  <strong>Bid for:</strong> {bid.itemName}
                </div>
                <div>
                  <strong>Bid Amount:</strong> ${bid.amount}
                </div>

                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(bid.timestamp).toLocaleString()}
                </div>
              </section>
              <div className="mt-4 flex space-x-4">
                <Link href={`/home/items/${bid.itemId}`}>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    View Item
                  </button>
                </Link>
                <form action={deleteBidAction} method="post">
                  <input type="hidden" name="bidId" value={bid.id} />
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Delete Bid
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">You have not placed any bids yet.</p>
      )}
    </div>
  );
}
