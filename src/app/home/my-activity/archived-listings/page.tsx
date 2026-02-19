import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import ItemCard from "@/components/ListingCard";
import { EmptyState } from "./emptyState";
import { and, eq } from "drizzle-orm";

// This is where you will be able to manage selected listings: Renew or Delete Listings or End Bid

export default async function ArchivedListings() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Fetch only archived items where userId matches the logged-in user
  const archivedItems = await database.query.items.findMany({
    where: and(eq(items.userId, session.user.id!), eq(items.archived, true)),
  });

  const hasArchivedItems = archivedItems.length > 0;

  return (
    <main className="">
      <h1 className="font-bold pb-10">Manage Archived Listings</h1>

      {hasArchivedItems ? (
        <div className="grid grid-cols-3 gap-8">
          {archivedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
