import WMProfile from "@/components/app/WMProfile";
import WGProfile from "@/components/app/WGProfile";
import { auth } from "@/auth";
import Link from "next/link";
import React from "react";

export default async function MyActivity() {
  const session = await auth();

  if (!session || !session.user) {
    return <div>Unauthorized</div>;
  }

  const userRole = session.user.role;

  return (
    <main className="mb-10">
      {userRole === "wasteManager" && (
        <>
          <WMProfile />
          <Link href="/home/me">
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">
              Edit Profile
            </button>
          </Link>
        </>
      )}

      {userRole === "wasteGenerator" && (
        <>
          <WGProfile />
          <Link href="/home/me">
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">
              Edit Profile
            </button>
          </Link>
        </>
      )}

      {userRole !== "wasteManager" && userRole !== "wasteGenerator" && (
        <div>Role not recognized.</div>
      )}
    </main>
  );
}
