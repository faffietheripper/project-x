import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, isNotNull } from "drizzle-orm";
import { items } from "@/db/schema";
import Link from "next/link";
import { acceptOfferAction, declineOfferAction } from "./actions";

export default async function MyWinningBids() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const itemsWithWinningBids = await database.query.items.findMany({
    where: isNotNull(items.winningBidId),
    with: {
      winningBid: true,
      carrierAssignments: {
        orderBy: (ca, { desc }) => [desc(ca.assignedAt)],
        limit: 1,
      },
    },
  });

  const myWinningBids = itemsWithWinningBids.filter((item) => {
    if (item.winningBid?.userId !== session.user.id) return false;

    const assignment = item.carrierAssignments[0];
    return assignment?.status !== "completed";
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Winning Bids</h1>

      {myWinningBids.map((item) => {
        const assignment = item.carrierAssignments[0];

        const showOfferActions = !item.offerAccepted && !assignment;

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
                {!item.offerAccepted && "Awaiting your decision"}
                {item.offerAccepted &&
                  !assignment &&
                  "Offer accepted – awaiting carrier"}
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

              {showOfferActions && (
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
      })}
    </div>
  );
}
