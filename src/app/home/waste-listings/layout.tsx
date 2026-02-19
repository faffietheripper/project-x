import React from "react";
import { auth } from "@/auth";
import ListingsFilter from "@/components/app/ListingsFilter";
import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const allListings = await database.query.wasteListings.findMany();

  return (
    <div className="relative">
      <div className="w-full shadow-md pl-[24vw] pt-[13vh] pb-8 fixed bg-gray-50">
        <ListingsFilter items={allListings} />
      </div>

      <div className="pl-[24vw] min-h-screen overflow-y-scroll py-64 px-12">
        {children}
      </div>
    </div>
  );
}
