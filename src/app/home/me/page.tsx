import ProfileForm from "@/components/app/ProfileForm";
import { auth } from "@/auth";
import React from "react";

export default async function Me() {
  return (
    <main className="mb-10">
      <ProfileForm />
    </main>
  );
}
