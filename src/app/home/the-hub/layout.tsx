import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import ProfileFilter from "@/components/app/ProfileFilter";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const allProfiles = await database.query.profiles.findMany();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return (
    <div>
      <div className="fixed w-full shadow-md shadow-gray-300 pt-32 bg-gray-200">
        <ProfileFilter profiles={allProfiles} />
      </div>
      <div className=" h-screen overflow-y-scroll py-64 px-12">{children}</div>
    </div>
  );
}
