import React from "react";
import { auth } from "@/auth";
import ListingsFilter from "@/components/app/ListingsFilter";
import { database } from "@/db/database";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const allItems = await database.query.items.findMany();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return (
    <div>
      <div className=" h-screen w-[300px] border-r pt-32 border-black fixed bg-gray-50">
        <ListingsFilter items={allItems} />
      </div>
      <div className="ml-[300px] h-screen overflow-y-scroll py-36 px-12">
        {children}
      </div>
    </div>
  );
}