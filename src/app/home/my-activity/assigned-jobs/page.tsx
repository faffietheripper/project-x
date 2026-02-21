import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, isNotNull } from "drizzle-orm";
import { wasteListings } from "@/db/schema";
import Link from "next/link";
import { acceptOfferAction, declineOfferAction } from "./actions";
import CancelJob from "@/components/app/CancelJob";

export default async function MyWinningBids() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const listingsWithWinningBids = await database.query.wasteListings.findMany({
    where: isNotNull(wasteListings.winningBidId),
    with: {
      bids: true,
      carrierAssignments: {
        orderBy: (ca, { desc }) => [desc(ca.assignedAt)],
        limit: 1,
      },
    },
  });

  const myWinningBids = listingsWithWinningBids.filter((listing) => {
    const winningBid = listing.bids.find((b) => b.id === listing.winningBidId);

    if (!winningBid || winningBid.userId !== session.user.id) return false;

    const assignment = listing.carrierAssignments[0];
    return assignment?.status !== "completed";
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Winning Bids</h1>

      {myWinningBids.map((listing) => {
        const winningBid = listing.bids.find(
          (b) => b.id === listing.winningBidId,
        );

        const assignment = listing.carrierAssignments[0];

        const showOfferActions = !listing.offerAccepted && !assignment;

        const canCancel =
          listing.offerAccepted &&
          !listing.assignedCarrierOrganisationId &&
          !assignment;

        return (
          <div
            key={listing.id}
            className="p-6 border flex justify-between rounded-lg shadow-sm mb-4"
          >
            <section>
              <div>
                <strong>Listing:</strong> {listing.name}
              </div>

              <div>
                <strong>Winning Bid:</strong> £{winningBid?.amount}
              </div>

              <div>
                <strong>Date:</strong>{" "}
                {winningBid && new Date(winningBid.timestamp).toLocaleString()}
              </div>

              <div className="mt-2 font-semibold">
                {!listing.offerAccepted && "Awaiting your decision"}
                {listing.offerAccepted &&
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
              <Link href={`/home/waste-listings/${listing.id}`}>
                <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
                  View Listing
                </button>
              </Link>

              {showOfferActions && (
                <>
                  <form action={acceptOfferAction}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                      Accept Offer
                    </button>
                  </form>

                  <form action={declineOfferAction}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="bidId" value={winningBid?.id} />
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                      Decline Offer
                    </button>
                  </form>
                </>
              )}

              {canCancel && winningBid && (
                <CancelJob listingId={listing.id} bidId={winningBid.id} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
