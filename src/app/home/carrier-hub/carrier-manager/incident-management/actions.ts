"use server";

import { database } from "@/db/database";
import { incidents, carrierAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function resolveIncidentAction(
  incidentId: string,
  assignmentId: string,
  notes: string,
) {
  if (!notes || notes.trim().length < 10) {
    throw new Error("Resolution notes must be at least 10 characters.");
  }

  await database
    .update(incidents)
    .set({
      status: "resolved",
      resolutionNotes: notes,
      resolvedAt: new Date(),
    })
    .where(eq(incidents.id, incidentId));

  await database
    .update(carrierAssignments)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignmentId));

  revalidatePath("/home/carrier-hub/incident-management");
}
