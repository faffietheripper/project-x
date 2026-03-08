"use server";

import { database } from "@/db/database";
import { incidents, carrierAssignments, wasteListings } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

/* =========================================================
   GET INCIDENTS
========================================================= */

export async function getCarrierIncidents() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorised");
  }

  return await database
    .select({
      id: incidents.id,
      type: incidents.type,
      summary: incidents.summary,
      status: incidents.status,
      createdAt: incidents.createdAt,

      listingName: wasteListings.name,
      listingId: wasteListings.id,

      assignmentId: carrierAssignments.id,
    })
    .from(incidents)
    .innerJoin(
      carrierAssignments,
      eq(incidents.assignmentId, carrierAssignments.id),
    )
    .innerJoin(
      wasteListings,
      eq(carrierAssignments.listingId, wasteListings.id),
    )
    .where(eq(incidents.reportedByOrganisationId, session.user.organisationId))
    .orderBy(desc(incidents.createdAt));
}

/* =========================================================
   GET ACTIVE ASSIGNMENTS
========================================================= */

export async function getCarrierActiveAssignments() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorised");
  }

  return await database
    .select({
      assignmentId: carrierAssignments.id,
      listingId: wasteListings.id,
      listingName: wasteListings.name,
      assignedAt: carrierAssignments.assignedAt,
    })
    .from(carrierAssignments)
    .innerJoin(
      wasteListings,
      eq(carrierAssignments.listingId, wasteListings.id),
    )
    .where(
      and(
        eq(
          carrierAssignments.carrierOrganisationId,
          session.user.organisationId,
        ),
        eq(carrierAssignments.status, "collected"),
      ),
    );
}

/* =========================================================
   CREATE INCIDENT
========================================================= */

export async function createIncident(data: {
  assignmentId: string;
  type: string;
  summary: string;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.organisationId) {
    throw new Error("Unauthorised");
  }

  const assignment = await database.query.carrierAssignments.findFirst({
    where: and(
      eq(carrierAssignments.id, data.assignmentId),
      eq(carrierAssignments.carrierOrganisationId, session.user.organisationId),
      eq(carrierAssignments.status, "collected"),
    ),
  });

  if (!assignment) {
    throw new Error("Invalid assignment");
  }

  await database.transaction(async (tx) => {
    await tx.insert(incidents).values({
      organisationId: session.user.organisationId, // ✅ REQUIRED
      assignmentId: assignment.id,
      listingId: assignment.listingId,
      type: data.type,
      summary: data.summary,
      reportedByUserId: session.user.id,
      reportedByOrganisationId: session.user.organisationId,
    });
  });

  revalidatePath("/home/carrier-hub/waste-carriers/incidents-&-reports");
}
