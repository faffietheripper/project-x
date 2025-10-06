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

  // If user not linked to an organisation, redirect to /home/me
  if (!session?.user?.organisationId) {
    // Option 1: simple redirect
    redirect("/home/me");

    // Option 2: redirect with a query param if you want to show a message there:
    // redirect("/home/me?setupRequired=true");
  }

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
