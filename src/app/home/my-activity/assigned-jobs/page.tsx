import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, isNotNull, ne } from "drizzle-orm";
import { items, carrierAssignments } from "@/db/schema";
import Link from "next/link";
import { acceptOfferAction, declineOfferAction } from "./actions";

export default async function MyWinningBids() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Fetch items with winning bids
  const itemsWithWinningBids = await database.query.items.findMany({
    where: isNotNull(items.winningBidId),
    with: {
      winningBid: true,
      carrierAssignments: {
        orderBy: (ca, { desc }) => [desc(ca.assignedAt)],
        limit: 1, // latest assignment only
      },
    },
  });

  // 2. Filter to this user + not completed
  const myWinningBids = itemsWithWinningBids.filter((item) => {
    if (item.winningBid?.userId !== session.user.id) return false;

    const assignment = item.carrierAssignments[0];
    if (!assignment) return true;

    return assignment.status !== "completed";
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Winning Bids</h1>

      {myWinningBids.length > 0 ? (
        myWinningBids.map((item) => {
          const assignment = item.carrierAssignments[0];

          return (
            <div
              key={item.id}
              className="p-6 border flex justify-between rounded-lg shadow-sm mb-4"
            >
              <section>
                <div>
                  <strong>Item:</strong> {item.name}
                </div>

                <div>
                  <strong>Winning Bid:</strong> £{item.winningBid.amount}
                </div>

                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(item.winningBid.timestamp).toLocaleString()}
                </div>

                <div className="mt-2 font-semibold">
                  {!assignment && "Offer accepted – awaiting assignment"}
                  {assignment?.status === "pending" &&
                    "Awaiting carrier response"}
                  {assignment?.status === "accepted" && "Job assigned"}
                  {assignment?.status === "collected" &&
                    "Collected – awaiting completion"}
                </div>
              </section>

              <div className="flex gap-3 items-start">
                <Link href={`/home/items/${item.id}`}>
                  <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
                    View Item
                  </button>
                </Link>

                {!assignment && (
                  <>
                    <form action={acceptOfferAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Accept Offer
                      </button>
                    </form>

                    <form action={declineOfferAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input
                        type="hidden"
                        name="bidId"
                        value={item.winningBid.id}
                      />
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                        Decline Offer
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-600">
          You have no active winning bids at the moment.
        </p>
      )}
    </div>
  );
}
