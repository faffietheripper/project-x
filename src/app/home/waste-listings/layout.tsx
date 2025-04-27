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
    <div className="relative">
      <div className=" h-15vw w-[100vw] shadow-md pl-[24vw] pt-[13vh] shadow-gray-400 pb-8 fixed bg-gray-50">
        <ListingsFilter items={allItems} />
      </div>
      <div className="pl-[24vw] h-screen overflow-y-scroll py-64 px-12">
        {children}
      </div>
    </div>
  );
}
