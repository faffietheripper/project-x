"use server";
"use server";

import { database } from "@/db/database";
import { incidents, carrierAssignments, wasteListings } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get incidents reported by this carrier organisation
 */
export async function getCarrierIncidents() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorised");
  }

  return await database
    .select({
      id: incidents.id,
      type: incidents.type,
      summary: incidents.summary, // ✅ correct field
      status: incidents.status,
      createdAt: incidents.createdAt,

      // Listing info
      listingName: wasteListings.name,
      location: wasteListings.location,
      listingId: wasteListings.id,

      // Assignment info
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

/**
 * Get active collected assignments for carrier
 */
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
      location: wasteListings.location,
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

/**
 * Create a new incident (carrier side)
 */
export async function createIncident(data: {
  assignmentId: string;
  type: string;
  summary: string;
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
    listingId: assignment.listingId, // ✅ correct FK
    type: data.type,
    summary: data.summary, // ✅ correct field
    reportedByUserId: session.user.id,
    reportedByOrganisationId: session.user.organisationId,
  });

  revalidatePath("/home/carrier-hub/waste-carriers/incidents-&-reports");
}
