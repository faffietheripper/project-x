"use server";

import { database } from "@/db/database";
import { incidents, carrierAssignments, items } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

export async function getCarrierIncidents() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorised");
  }

  return await database
    .select({
      id: incidents.id,
      type: incidents.type,
      description: incidents.description,
      status: incidents.status,
      createdAt: incidents.createdAt,

      // Item info
      itemName: items.name,
      location: items.location,
      itemId: items.id,

      // Assignment info
      assignmentId: carrierAssignments.id,
    })
    .from(incidents)
    .innerJoin(
      carrierAssignments,
      eq(incidents.assignmentId, carrierAssignments.id),
    )
    .innerJoin(items, eq(carrierAssignments.itemId, items.id))
    .where(eq(incidents.reportedByOrganisationId, session.user.organisationId))
    .orderBy(desc(incidents.createdAt));
}

export async function getCarrierActiveAssignments() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorised");
  }

  return await database
    .select({
      assignmentId: carrierAssignments.id,
      itemId: items.id,
      itemName: items.name,
      location: items.location,
      assignedAt: carrierAssignments.assignedAt,
    })
    .from(carrierAssignments)
    .innerJoin(items, eq(carrierAssignments.itemId, items.id))
    .where(
      and(
        eq(
          carrierAssignments.carrierOrganisationId,
          session.user.organisationId,
        ),
        eq(carrierAssignments.status, "collected"), // ✅ FIXED
      ),
    );
}

export async function createIncident(data: {
  assignmentId: string;
  type: string;
  description: string;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.organisationId) {
    throw new Error("Unauthorised");
  }

  const assignment = await database
    .select()
    .from(carrierAssignments)
    .where(
      and(
        eq(carrierAssignments.id, data.assignmentId),
        eq(
          carrierAssignments.carrierOrganisationId,
          session.user.organisationId,
        ),
        eq(carrierAssignments.status, "collected"),
      ),
    )
    .then((res) => res[0]);

  if (!assignment) {
    throw new Error("Invalid assignment");
  }

  await database.insert(incidents).values({
    assignmentId: assignment.id,
    itemId: assignment.itemId,
    type: data.type,
    description: data.description,
    reportedByUserId: session.user.id,
    reportedByOrganisationId: session.user.organisationId,
  });

  revalidatePath("/home/carrier-hub/waste-carriers/incidents-&-reports");
}
