import React from "react";
import { auth } from "@/auth";
import TeamNav from "@/components/app/TeamNav";
import { getOrganisationServer } from "@/data-access/organisations";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Fetch organisation details
  const org = await getOrganisationServer(session.user.organisationId);
  const chainOfCustody = org?.chainOfCustody ?? null;
  const userRole = session?.user?.role ?? null;

  console.log("ORG FROM DB:", org);
  console.log("CHAIN OF CUSTODY:", chainOfCustody);
  console.log("USER ROLE:", userRole);

  return (
    <div className="relative">
      <TeamNav userRole={userRole} chainOfCustody={chainOfCustody} />
      <div className="pl-[24vw] p-10 pt-56">{children}</div>
    </div>
  );
}
