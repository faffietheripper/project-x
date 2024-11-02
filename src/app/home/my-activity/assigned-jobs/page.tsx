import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, isNotNull } from "drizzle-orm";
import { items } from "@/db/schema";
import Link from "next/link";
import { deleteBidAction } from "@/app/home/my-activity/my-bids/actions";
import { acceptOfferAction } from "./actions";
import { declineOfferAction } from "./actions";

export default async function MyWinningBids() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Fetch all items where the winning bid is not null
  const itemsWithWinningBids = await database.query.items.findMany({
    where: isNotNull(items.winningBidId), // Ensure the item has a winning bid (non-null)
    with: {
      winningBid: true, // Include related winning bid data
    },
  });

  // Filter the items to find the ones where the winning bid matches the logged-in user's ID
  const myWinningBids = itemsWithWinningBids.filter(
    (item) => item.winningBid?.userId === session.user.id
  );

  console.log("My Winning Bids: ", myWinningBids);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Winning Bids</h1>
      {myWinningBids.length > 0 ? (
        myWinningBids.map((myWinningBid) => (
          <div
            key={myWinningBid.id}
            className="p-6 border flex justify-between rounded-lg shadow-sm mb-4"
          >
            <section>
              <div>
                <strong>Item:</strong> {myWinningBid.name}
              </div>
              <div>
                <strong>Winning Bid Amount:</strong> $
                {myWinningBid.winningBid.amount}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(myWinningBid.winningBid.timestamp).toLocaleString()}
              </div>
              {myWinningBid.offerAccepted ? (
                <h1 className="text-green-600 font-bold">Job in Progress</h1>
              ) : (
                <h1>Job Assigned</h1>
              )}
            </section>
            <div className="mt-4 flex space-x-4">
              <Link href={`/home/items/${myWinningBid.id}`}>
                <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
                  View Item
                </button>
              </Link>

              {/* Conditionally render based on offerAccepted status */}
              {myWinningBid.offerAccepted ? (
                <div className="flex space-x-4">
                  <form method="post">
                    <input
                      type="hidden"
                      name="itemId"
                      value={myWinningBid.id}
                    />
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Mark as Completed
                    </button>
                  </form>
                  <form method="post">
                    <input
                      type="hidden"
                      name="itemId"
                      value={myWinningBid.id}
                    />
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel Job
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <form action={acceptOfferAction} method="post">
                    <input
                      type="hidden"
                      name="itemId"
                      value={myWinningBid.id}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Accept Offer
                    </button>
                  </form>
                  <form action={declineOfferAction} method="post">
                    <input
                      type="hidden"
                      name="itemId"
                      value={myWinningBid.id}
                    />
                    <input
                      type="hidden"
                      name="bidId"
                      value={myWinningBid.winningBid.id}
                    />
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Decline Offer
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">
          You have no winning bids assigned to you yet.
        </p>
      )}
    </div>
  );
}
