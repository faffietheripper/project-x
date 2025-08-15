"use server";

import { database } from "@/db/database";
import { organisations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrganisationByUserId(userId: string) {
  const organisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, userId),
  });
  return organisation;
}

export async function getOrganisationServer(organisationId: string) {
  return await database.query.organisations.findFirst({
    where: eq(organisations.id, organisationId),
  });
}
