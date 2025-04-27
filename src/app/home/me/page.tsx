import ProfileForm from "@/components/app/ProfileForm";
import RoleAssignmentForm from "@/components/app/RoleAssignmentForm";
import { auth } from "@/auth";
import React from "react";

export default async function Me() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const userRole = session.user.role ?? ""; // Fallback to empty string
  const knownRoles = ["administrator", "seniorMember", "teamMember"];

  return (
    <main className="mb-10">
      <h1 className="text-3xl font-bold mb-10">Profile Settings</h1>

      {knownRoles.includes(userRole) ? <ProfileForm /> : <RoleAssignmentForm />}
    </main>
  );
}
