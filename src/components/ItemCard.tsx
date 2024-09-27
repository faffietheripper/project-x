import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import { Item } from "@/db/schema";
import Link from "next/link";
import { format } from "date-fns";
import { isBidOver } from "@/util/bids";
import { auth } from "@/auth";
import { archiveBids } from "@/util/archiveBids";
import { unarchivedBids } from "@/util/unarchivedBids";
import { deleteItemAction } from "@/app/home/my-activity/archived-listings/actions";

export default async function ItemCard({ item }: { item: Item }) {
  const session = await auth();
  const userRole = session?.user?.role;

  const canPlaceBid =
    userRole !== "wasteGenerator" &&
    item.userId !== session?.user?.id &&
    !(await isBidOver(item));

  const fileKeys = item.fileKey.split(",");
  const firstImageUrl = getImageUrl(fileKeys[0]);

  return (
    <div
      key={item.id}
      className="border p-6 rounded-lg w-full flex flex-col gap-6 justify-between"
    >
      <div className="flex flex-col">
        <Image
          src={firstImageUrl}
          width={200}
          height={200}
          alt={item.name}
          className="rounded-lg h-48 w-full object-cover"
        />
        <h1 className="text-lg font-semibold my-3">{item.name}</h1>
        <h1 className="text-md mb-2 ">
          <span className=" font-semibold">Starting Price: </span> $
          {item.startingPrice}
        </h1>
        {(await isBidOver(item)) ? (
          <p className="text-red-600 text-md font-semibold">Bidding is Over.</p>
        ) : (
          <p>
            <span className="font-semibold text-md">Bid Ends On: </span>
            {format(item.endDate, "M/dd/yy")}
          </p>
        )}
      </div>
      {!item.archived ? (
        <section>
          {item.userId == session?.user?.id ? (
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/home/items/${item.id}`}>
                <button className="bg-blue-600 py-2 px-4 rounded-md w-full text-white">
                  View Bid
                </button>
              </Link>
              <form action={archiveBids}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  className="bg-gray-600 py-2 px-4 rounded-md w-full text-white"
                >
                  Archive
                </button>
              </form>
            </div>
          ) : (
            <Link href={`/home/items/${item.id}`}>
              <button className="bg-blue-600 py-2 px-4 rounded-md w-full text-white">
                View Bid
              </button>
            </Link>
          )}
        </section>
      ) : (
        <section>
          <Link href={`/home/items/${item.id}`}>
            <button className="bg-blue-600 py-2 px-4 mb-2 rounded-md w-full text-white">
              {userRole === "wasteGenerator"
                ? "View Bid"
                : canPlaceBid
                ? "Place Bid"
                : "Cannot Bid"}
            </button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <form action={deleteItemAction} method="post">
              <input type="hidden" name="itemId" value={item.id} />
              <button className="bg-red-600 py-2 px-4 rounded-md w-full text-white">
                Delete
              </button>
            </form>
            <form action={unarchivedBids}>
              <input type="hidden" name="itemId" value={item.id} />
              <button
                type="submit"
                className="bg-gray-600 py-2 px-4 rounded-md w-full text-white"
              >
                Unarchive
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
