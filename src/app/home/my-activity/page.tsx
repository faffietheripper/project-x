import UserOverview from "@/components/app/MyActivity/UserOverview";
import { auth } from "@/auth";
import React from "react";

export default async function MyActivity() {
  const session = await auth();

  if (!session || !session.user) {
    return <div>Unauthorized</div>;
  }

  const userRole = session.user.role;

  return (
    <main className="mb-10">
      <>
        <UserOverview />
      </>
    </main>
  );
}
