import React from "react";
import { auth } from "@/auth";
import TeamNav from "@/components/app/TeamNav";

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
      <TeamNav userRole={userRole} />
      <div className="">{children}</div>
    </div>
  );
}
