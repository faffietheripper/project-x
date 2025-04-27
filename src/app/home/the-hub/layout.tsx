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
    <div className="pl-[24vw] pt-[13vh] relative">
      <div className="w-full pt-10 fixed ">
        <ProfileFilter profiles={allProfiles} />
      </div>
      <div className=" h-screen pt-56 overflow-y-scroll">{children}</div>
    </div>
  );
}
