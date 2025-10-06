import React from "react";
import { auth } from "@/auth";
import ActivityNav from "@/components/app/ActivityNav";
import { getOrganisationServer } from "@/data-access/organisations";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if user doesn't have an organisation yet
  if (!session?.user?.organisationId) {
    // Option 1: simple redirect
    redirect("/home/me");

    // Option 2 (optional): redirect with query param for a message
    // redirect("/home/me?setupRequired=true");
  }

  // Fetch organisation details
  const org = await getOrganisationServer(session.user.organisationId);
  const chainOfCustody = org?.chainOfCustody ?? null;

  console.log("ORG FROM DB:", org);
  console.log("CHAIN OF CUSTODY:", chainOfCustody);

  return (
    <div className="relative">
      <ActivityNav chainOfCustody={chainOfCustody} />
      <div className="pl-[24vw] p-10 pt-56">{children}</div>
    </div>
  );
}
