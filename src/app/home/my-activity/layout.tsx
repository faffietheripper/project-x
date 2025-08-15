import React from "react";
import { auth } from "@/auth";
import ActivityNav from "@/components/app/ActivityNav";
import { getOrganisationServer } from "@/data-access/organisations";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  // Fetch organisation server-side using organisationId
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
