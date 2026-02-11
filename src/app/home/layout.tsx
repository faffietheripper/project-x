import Header from "@/components/app/Header";
import Header2 from "@/components/app/Header2";
import SetupAlert from "@/components/app/SetupAlert";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const profileCompleted = !!(
    profile?.fullName &&
    profile?.telephone &&
    profile?.emailAddress &&
    profile?.country &&
    profile?.streetAddress &&
    profile?.city &&
    profile?.region &&
    profile?.postCode
  );

  console.log("🧩 session.user.role:", session.user.role);
  console.log("🧩 profileCompleted:", profileCompleted);

  return (
    <div>
      <Header />
      <Toaster />
      <Header2 />

      <div className="">
        <SetupAlert
          user={{
            role: session.user.role,
            profileCompleted,
          }}
        />
      </div>

      <div className="">{children}</div>
    </div>
  );
}
