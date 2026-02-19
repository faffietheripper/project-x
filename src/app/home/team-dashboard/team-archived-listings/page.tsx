import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import ItemCard from "@/components/ListingCard";
import { EmptyState } from "./emptyState";
import { and, eq } from "drizzle-orm";

export default async function TeamArchivedListings() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  // Fetch only archived items where organisationId matches the logged-in user's organisationId
  const archivedOrgItems = await database.query.items.findMany({
    where: and(
      eq(items.organisationId, session.user.organisationId),
      eq(items.archived, true),
    ),
  });

  const hasArchivedItems = archivedOrgItems.length > 0;

  return (
    <main className="">
      <h1 className="font-bold pb-10">Manage Archived Listings</h1>

      {hasArchivedItems ? (
        <div className="grid grid-cols-3 gap-8">
          {archivedOrgItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
