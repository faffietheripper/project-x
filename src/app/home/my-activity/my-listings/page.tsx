import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import ItemCard from "@/components/ItemCard";
import { EmptyState } from "./emptyState";
import { and, eq } from "drizzle-orm";

//this is where you will be able to manage selected listings : Renew or Delete Listings or End Bid

export default async function MyLisitngs() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const allItems = await database.query.items.findMany({
    where: and(eq(items.userId, session.user.id!), eq(items.archived, false)),
  });

  const hasItems = allItems.length > 0;

  return (
    <main className="">
      <h1 className="font-bold pb-10">Manage Active Listings</h1>

      {hasItems ? (
        <div className="grid grid-cols-4 gap-8">
          {allItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
