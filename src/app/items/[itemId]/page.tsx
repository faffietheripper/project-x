import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { items } from "@/db/schema";
import { getImageUrl } from "@/util/files";
import { formatDistance } from "date-fns";
import { formatToDollar } from "@/util/currency";

function formatTimestamp(timestamp: Date) {
  return formatDistance(timestamp, new Date(), { addSuffix: true });
}

export default async function ItemPage({
  params: { itemId },
}: {
  params: { itemId: string };
}) {
  const session = await auth();

  const item = await database?.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    return (
      <div className="space-y-8 flex flex-col items-center mt-12">
        <Image src="/package.svg" width="200" height="200" alt="Package" />

        <h1 className="font-bold">Item not found</h1>
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

  return (
    <main className="space-y-8">
      <div className="flex gap-10">
        <section>
          <h1 className="text-3xl"> Auction for {item.name}</h1>
          <Image
            src={getImageUrl(item.fileKey)}
            width={200}
            height={200}
            alt={item.name}
          />
          <h1 className="">
            Starting Price : ${formatToDollar(item.startingPrice)}
          </h1>
          <h1 className="">
            Bid Interval : ${formatToDollar(item.bidInterval)}
          </h1>
        </section>
        <section>
          <h2> Current Bids</h2>
          <ul></ul>
        </section>
      </div>
    </main>
  );
}
