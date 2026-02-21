import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { organisations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import CarrierHubNav from "@/components/app/CarrierHub/CarrierHubNav";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    redirect("/home/team-dashboard/team-profile?reason=no-organisation");
  }

  const organisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, dbUser.organisationId),
  });

  const chainOfCustody = organisation?.chainOfCustody ?? null;

  return (
    <div className="relative">
      <CarrierHubNav chainOfCustody={chainOfCustody} />
      <div className="pl-[24vw] pt-56 p-10">{children}</div>
    </div>
  );
}
