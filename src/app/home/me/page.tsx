import WGProfileForm from "@/components/app/WGProfileForm";
import WMProfileForm from "@/components/app/WMProfileForm";
import { auth } from "@/auth";
import React from "react";

export default async function Me() {
  const session = await auth();

  if (!session || !session.user) {
    return <div>Unauthorized</div>;
  }

  const userRole = session.user.role;

  return (
    <main className="mb-10">
      <h1 className="text-3xl font-bold mb-10">Profile Settings</h1>
      {userRole === "wasteManager" && <WMProfileForm />}
      {userRole === "wasteGenerator" && <WGProfileForm />}
      {userRole !== "wasteManager" && userRole !== "wasteGenerator" && (
        <div>Role not recognized.</div>
      )}
    </main>
  );
}
