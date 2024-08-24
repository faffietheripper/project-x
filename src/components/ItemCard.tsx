import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import { Item } from "@/db/schema";
import Link from "next/link";
import { format } from "date-fns";
import { isBidOver } from "@/util/bids";
import { auth } from "@/auth";

export default async function ItemCard({ item }: { item: Item }) {
  const session = await auth();
  const canPlaceBid =
    session && item.userId !== session.user.id && !isBidOver(item);

  console.log(item, "item");
  const fileKeys = item.fileKey.split(",");
  // Log to debug
  console.log("File Keys Array:", fileKeys);
  console.log("First Image URL:", getImageUrl(fileKeys[0]));
  return (
    <div
      key={item.id}
      className="border p-6 rounded-lg w-full flex flex-col gap-6 justify-between"
    >
      <div className="flex flex-col">
        <Image
          src={getImageUrl(fileKeys[0])}
          width={200}
          height={200}
          alt={item.name}
          className="rounded-lg h-48 w-full object-cover"
        />
        <h1 className="text-lg font-semibold my-3">{item.name}</h1>
        <h1 className="text-md mb-2 ">
          <span className=" font-semibold">Starting Price : </span> $
          {item.startingPrice}
        </h1>
        {isBidOver(item) ? (
          <p className="text-red-600 text-md font-semibold">Bidding is Over.</p>
        ) : (
          <p>
            <span className="font-semibold text-md">Bid Ends On: </span>
            {format(item.endDate, " M/dd/yy")}
          </p>
        )}
      </div>
      <button
        className={`py-2 px-4 rounded-md ${
          canPlaceBid ? "bg-blue-600" : "bg-gray-600 cursor-not-allowed"
        } text-white`}
        disabled={!canPlaceBid}
      >
        <Link href={`/home/items/${item.id}`}>
          {isBidOver(item)
            ? "View Bid"
            : canPlaceBid
            ? "Place Bid"
            : "Cannot Bid"}
        </Link>
      </button>
    </div>
  );
}
