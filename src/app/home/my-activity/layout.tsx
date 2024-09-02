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
    <div>
      <ActivityNav userRole={userRole} />
      <div className="p-10">{children}</div>
    </div>
  );
}
