import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import { Item } from "@/db/schema";
import Link from "next/link";
import { Button } from "./ui/button";
import { formatToDollar } from "@/util/currency";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <div>
      <div key={item.id} className="border p-6 rounded-lg">
        <Image
          src={getImageUrl(item.fileKey)}
          width={200}
          height={200}
          alt={item.name}
        />
        {item.name}
        <h1 className="">
          Starting Price : ${formatToDollar(item.startingPrice)}
        </h1>
        <Button asChild>
          <Link href={`/items/${item.id}`}>Place Bid</Link>
        </Button>
      </div>
    </div>
  );
}
