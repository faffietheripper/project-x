import { auth } from "@/auth";
import PlaceBid from "@/components/app/PlaceBid";
import { Button } from "@/components/ui/button";
import { getBidsForItem } from "@/data-access/bids";
import { getItem } from "@/data-access/items";
import { getImageUrl } from "@/util/files";
import { formatDistance } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { isBidOver } from "@/util/bids";
import { handleAssignWinningBid } from "./actions";
import BidWinner from "@/components/app/BidWinner";
import { getWinningBid } from "@/data-access/getWinningBid";

function formatTimestamp(timestamp: Date) {
  return formatDistance(timestamp, new Date(), { addSuffix: true });
}

export default async function ItemPage({
  params: { itemId, bidId },
}: {
  params: { itemId: string; bidId: string };
}) {
  const session = await auth();

  const item = await getItem(parseInt(itemId));

  const { winningBid } = await getWinningBid(Number(itemId));

  if (!item) {
    return (
      <div className="space-y-8 py-36 px-12 flex flex-col items-center mt-12">
        <Image src="/package.svg" width="200" height="200" alt="Package" />

        <h1 className="">Item not found</h1>
        <p className="text-center">
          The item you&apos;re trying to view is invalid.
          <br />
          Please go back and search for a different auction item.
        </p>

        <Button asChild>
          <Link href={`/`}>View Auctions</Link>
        </Button>
      </div>
    );
  }

  const allBids = await getBidsForItem(item.id);

  const hasBids = allBids.length > 0;

  const canPlaceBid =
    session &&
    session.user.role !== "wasteGenerator" && // Prevent wasteGenerator from bidding
    item.userId !== session.user.id &&
    !(await isBidOver(item)) &&
    item.archived == false;

  const canAssignBid = session && item.userId == session?.user.id;

  const fileKeys = item.fileKey.split(",");

  return (
    <main className="space-y-8 py-36 px-12">
      <div className="grid grid-cols-6 gap-6">
        <div className=" col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between ">
            <h1 className="font-semibold text-2xl">Auction for {item.name}</h1>
            <div>
              Current Bid/ Latest Bid Value{" "}
              <span className="font-bold">${item.currentBid}</span>
            </div>
          </div>
          {(await isBidOver(item)) && (
            <Badge className="w-fit bg-red-400" variant="destructive">
              Bidding Over
            </Badge>
          )}
          <div className="grid grid-cols-3 gap-6">
            {fileKeys.map((key, index) => (
              <Image
                key={index}
                className="rounded-xl w-full h-64"
                src={getImageUrl(key.trim())} // Trim any extra spaces
                alt={`${item.name} - Image ${index + 1}`}
                width={400}
                height={400}
              />
            ))}
          </div>
          <h2 className="font-semibold text-lg">
            Located in{" "}
            <span className="font-normal text-gray-500">{item.location}</span>
          </h2>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Detailed Description :
            </span>{" "}
            {item.detailedDescription}
          </p>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Compliance Details :
            </span>{" "}
            {item.complianceDetails}
          </p>{" "}
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Transportation Details :
            </span>{" "}
            {item.transportationDetails}
          </p>{" "}
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Transaction Conditions :
            </span>{" "}
            {item.transactionConditions}
          </p>
        </div>
        <section className="col-span-2 fixed right-10">
          <div className=" space-y-4 p-6 rounded-lg bg-gray-200 h-[60vh] overflow-y-scroll">
            <div className="flex flex-col justify-between ">
              <h2 className="text-2xl font-semibold mb-6">Current Bids</h2>

              {canPlaceBid && (
                <PlaceBid itemId={itemId} currentBid={item.currentBid} />
              )}
            </div>

            {hasBids ? (
              <ul className="space-y-4">
                {allBids.map((bid) => (
                  <li key={bid.id} className="bg-gray-300 rounded-xl p-8">
                    <div className="flex flex-col">
                      <div>
                        <span className="font-bold">${bid.amount}</span> by{" "}
                        <span className="font-bold">{bid.companyName}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-6">
                        {formatTimestamp(bid.timestamp)}
                      </div>
                      {canAssignBid && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4  rounded-md"
                          >
                            <Link href={`/home/profiles/${bid.profileId}`}>
                              View Profile
                            </Link>
                          </button>
                          <form action={handleAssignWinningBid}>
                            <input
                              type="hidden"
                              name="itemId"
                              value={item.id}
                            />
                            <input type="hidden" name="bidId" value={bidId} />
                            <button
                              type="submit"
                              className="bg-blue-600 text-white py-2 px-4 rounded-md"
                            >
                              Assign Listing
                            </button>
                          </form>
                        </div>
                      )}{" "}
                      {!canAssignBid && (
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-2 px-4  rounded-md"
                        >
                          <Link href={`/home/profiles/${bid.profileId}`}>
                            View Profile
                          </Link>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-8 bg-gray-100 rounded-xl p-12">
                <Image
                  src="/package.svg"
                  width="200"
                  height="200"
                  alt="Package"
                />
                <h2 className="text-2xl font-bold">No bids yet</h2>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-gray-200 h-[18vh] mt-4 p-6">
            <h1 className="font-bold text-xl "> Bid Winner :</h1>
            <BidWinner winningBid={winningBid} />
          </div>
        </section>
      </div>
    </main>
  );
}
