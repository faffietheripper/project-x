"use server";

import { database } from "@/db/database";
import { organisations, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOrganisationByUserId(userId: string) {
  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organisation: true,
    },
  });

  return user?.organisation ?? null;
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
