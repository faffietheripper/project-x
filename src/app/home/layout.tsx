import Header from "@/components/app/Header";
import ActivityFeed from "@/components/app/ActivityFeed";
import React from "react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { redirect } from "next/navigation";
import Header2 from "@/components/app/Header2";
import SetupAlert from "@/components/app/SetupAlert";
import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  // ✅ Redirect unauthenticated users
  if (!session || !session.user) {
    redirect("/login");
  }

  // ✅ Fetch user profile from DB
  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const profileCompleted = !!(
    profile?.firstName &&
    profile?.lastName &&
    profile?.email
  );

  return (
    <div>
      <Header />
      <Toaster />
      <Header2 />

      {/* ⚠️ Setup alert shown when profile or role is missing */}
      <div className="p-6">
        <SetupAlert
          user={{
            role: session.user.role,
            profileCompleted,
          }}
        />
      </div>

      <div>{children}</div>
    </div>
  );
}
