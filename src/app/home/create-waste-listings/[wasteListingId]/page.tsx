import { auth } from "@/auth";
import PlaceBid from "@/components/app/PlaceBid";
import { getBidsForListing } from "@/data-access/bids";
import { getWasteListing } from "@/data-access/wasteListings";
import { getOrganisationById } from "@/data-access/organisations";
import { getImageUrl } from "@/util/files";
import { formatDistance } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { isBidOver } from "@/util/bids";
import BidWinner from "@/components/app/BidWinner";
import { getWinningBid } from "@/data-access/getWinningBid";
import AssignListingButton from "@/components/app/AssignListingButton";
import { handleAssignWinningBid } from "./actions";

function formatTimestamp(timestamp: Date) {
  return formatDistance(timestamp, new Date(), { addSuffix: true });
}

export default async function ListingPage({
  params,
}: {
  params: { wasteListingId: string };
}) {
  const listingId = Number(params.wasteListingId);

  if (isNaN(listingId)) {
    throw new Error("Invalid listing ID");
  }

  const listing = await getWasteListing(listingId);
  const session = await auth();
  const { winningBid } = await getWinningBid(listingId);

  if (!listing) {
    return <div className="py-36 text-center">Listing not found</div>;
  }

  const organisation = await getOrganisationById(listing.organisationId);

  const allBids = await getBidsForListing(listing.id);
  // must include user + organisation in query

  const hasBids = allBids.length > 0;

  const canPlaceBid =
    session &&
    listing.userId !== session.user.id &&
    !(await isBidOver(listing)) &&
    !listing.archived &&
    !listing.offerAccepted;

  // 🔥 Enterprise-level permission
  const canAssignBid =
    session &&
    listing.organisationId === session.user.organisationId &&
    !listing.assigned;

  const fileKeys = listing.fileKey?.split(",") ?? [];

  console.log("Listing owner:", listing.userId);
  console.log("Session user:", session?.user?.id);
  console.log("Listing org:", listing.organisationId);
  console.log("Session org:", session?.user?.organisationId);

  return (
    <main className="space-y-8 py-36 px-12 pl-[22vw]">
      <div className="grid grid-cols-6 gap-6">
        {/* LEFT SIDE */}
        <div className="col-span-4 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Auction for {listing.name}</h1>

          <div>
            Current Bid:{" "}
            <span className="font-bold">£{listing.currentBid}</span>
          </div>

          {(await isBidOver(listing)) && (
            <Badge className="bg-red-400">Bidding Over</Badge>
          )}

          <div className="grid grid-cols-3 gap-6">
            {fileKeys.map((key, index) => (
              <Image
                key={index}
                src={getImageUrl(key.trim())}
                alt={listing.name}
                width={400}
                height={400}
                className="rounded-xl h-56 object-cover"
              />
            ))}
          </div>

          {organisation && (
            <div className="text-sm">
              Listed by{" "}
              <Link
                href={`/home/organisations/${organisation.id}`}
                className="text-blue-600 underline"
              >
                {organisation.teamName}
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <strong>Description:</strong>
              <p>{listing.detailedDescription}</p>
            </div>

            <div>
              <strong>Compliance:</strong>
              <p>{listing.complianceDetails}</p>
            </div>

            <div>
              <strong>Transport:</strong>
              <p>{listing.transportationDetails}</p>
            </div>

            <div>
              <strong>Conditions:</strong>
              <p>{listing.transactionConditions}</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <section className="w-[330px] fixed right-8">
          <div className="space-y-4 p-6 bg-gray-200 rounded-lg h-[60vh] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Current Bids</h2>

            {canPlaceBid && (
              <PlaceBid listingId={listingId} currentBid={listing.currentBid} />
            )}

            {hasBids ? (
              allBids.map((bid, index) => (
                <div
                  key={bid.id}
                  className="bg-gray-300 p-4 rounded-lg space-y-2"
                >
                  {index === 0 && (
                    <Badge className="bg-green-500">Highest Bid</Badge>
                  )}

                  <div className="text-lg font-semibold">£{bid.amount}</div>

                  <div className="text-sm text-gray-700">
                    Bid by {bid.user.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    Organisation: {bid.organisation.teamName}
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatTimestamp(bid.timestamp)}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/home/organisations/${bid.organisation.id}`}
                      className="inline-block bg-gray-800 hover:bg-gray-900 text-white text-sm px-3 py-2 rounded-md transition"
                    >
                      View Organisation →
                    </Link>
                  </div>

                  {canAssignBid && (
                    <AssignListingButton
                      listingId={listing.id}
                      bidId={bid.id}
                      offerAccepted={listing.offerAccepted}
                      assignedCarrierOrganisationId={
                        listing.assignedCarrierOrganisationId
                      }
                      declinedOffer={bid.declinedOffer}
                      cancelledJob={bid.cancelledJob}
                      handleAssignWinningBid={handleAssignWinningBid}
                    />
                  )}
                </div>
              ))
            ) : (
              <div>No bids yet</div>
            )}
          </div>

          <div className="mt-4 bg-blue-200 p-4 rounded-lg">
            <h1 className="font-bold">Bid Winner:</h1>
            <BidWinner winningBid={winningBid} />
          </div>
        </section>
      </div>
    </main>
  );
}
