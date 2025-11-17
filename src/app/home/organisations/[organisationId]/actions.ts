"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function assignCarrierAction(
  itemId: number,
  carrierOrgId: string
) {
  const session = await auth();
  const userOrgId = session?.user?.organisationId;

  if (!userOrgId) {
    throw new Error("Not authenticated");
  }

  const [job] = await database.select().from(items).where(eq(items.id, itemId));

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.winningOrganisationId !== userOrgId) {
    throw new Error("You can only assign jobs your organisation has won.");
  }

  await database
    .update(items)
    .set({
      assignedCarrierOrganisationId: carrierOrgId,
      assignedByOrganisationId: userOrgId,
      assignedAt: new Date(),
      assigned: true,
      carrierStatus: "pending",
    })
    .where(eq(items.id, itemId));

  return { success: true };
}

export async function getWinningJobsAction() {
  const session = await auth();
  const userOrgId = session?.user?.organisationId;

  if (!userOrgId) return [];

  const jobs = await database
    .select()
    .from(items)
    .where(
      and(
        eq(items.winningOrganisationId, userOrgId), // Your org won the job
        isNull(items.assignedCarrierOrganisationId), // Not yet assigned to a carrier
        eq(items.archived, false), // Not archived
        eq(items.completed, false) // Not completed
      )
    );

  return jobs;
}
