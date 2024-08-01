import React from "react";
import { database } from "@/db/database";
import { auth } from "@/auth";
import ItemCard from "@/components/ItemCard";

export default async function HomePage() {
  const session = await auth();

  const allItems = await database.query.items.findMany();

  if (!session) return null;
  const user = session.user;
  if (!user) return null;

  return (
    <main className="py-36 px-12">
      <h1 className="font-bold text-2xl mt-6 "> Items for Sale </h1>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {allItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
