import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import ItemCard from "@/components/ListingCard";
import { EmptyState } from "./emptyState";
import { and, eq } from "drizzle-orm";

export default async function AssignedListings() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Fetch only assigned items where userId matches the logged-in user
  const assignedItems = await database.query.items.findMany({
    where: and(eq(items.userId, session.user.id!), eq(items.assigned, true)),
  });

  const hasAssignedItems = assignedItems.length > 0;

  return (
    <main className="">
      <h1 className="font-bold pb-10">Manage Assigned Listings</h1>

      {hasAssignedItems ? (
        <div className="grid grid-cols-3 gap-8">
          {assignedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
