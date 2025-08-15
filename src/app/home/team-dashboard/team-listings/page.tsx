import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import ItemCard from "@/components/ItemCard";
import { EmptyState } from "./emptyState";
import { eq } from "drizzle-orm";

export default async function TeamListings() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  // Fetch all items where organisationId matches the logged-in user's organisationId
  const orgItems = await database.query.items.findMany({
    where: eq(items.organisationId, session.user.organisationId),
  });

  const hasItems = orgItems.length > 0;

  return (
    <main className="">
      <h1 className="font-bold pb-10 pt-4">Manage Active Listings</h1>

      {hasItems ? (
        <div className="grid grid-cols-3 gap-8">
          {orgItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
