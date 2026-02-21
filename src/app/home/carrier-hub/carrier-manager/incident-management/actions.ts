"use server";

import { database } from "@/db/database";
import { incidents, carrierAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function resolveIncidentAction(
  incidentId: string,
  assignmentId: string,
  notes: string,
) {
  if (!notes || notes.trim().length < 10) {
    throw new Error("Resolution notes must be at least 10 characters.");
  }

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // ✅ Update incident properly according to schema
  await database
    .update(incidents)
    .set({
      status: "resolved",
      correctiveActions: notes, // ✅ matches schema
      resolvedAt: new Date(),
      resolvedByUserId: session.user.id,
      dateClosed: new Date(),
    })
    .where(eq(incidents.id, incidentId));

  // ✅ Complete assignment
  await database
    .update(carrierAssignments)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignmentId));

  revalidatePath("/home/carrier-hub/incident-management");
}
