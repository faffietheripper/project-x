"use server";

import { database } from "@/db/database";
import { organisations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrganisationByUserId(organisationId: string) {
  if (!organisationId) return null;

  const organisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, organisationId),
  });

  return organisation;
}

export async function getOrganisationById(id: string) {
  if (!id) return null;

  const organisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, id),
  });

  return organisation;
}

export async function getOrganisationServer(organisationId: string) {
  return await database.query.organisations.findFirst({
    where: eq(organisations.id, organisationId),
  });
}
