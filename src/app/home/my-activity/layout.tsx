import React from "react";
import { auth } from "@/auth";
import ActivityNav from "@/components/app/ActivityNav";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userRole = session?.user?.role; // Assuming role is available in the session data

  return (
    <div className="relative">
      <ActivityNav userRole={userRole} />
      <div className="pl-[24vw] p-10 pt-56">{children}</div>
    </div>
  );
}
