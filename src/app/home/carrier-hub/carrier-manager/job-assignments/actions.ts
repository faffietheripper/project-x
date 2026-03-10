"use server";

import { database } from "@/db/database";
import { wasteListings, carrierAssignments, incidents } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, or, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markCompletedByManagerAction(
  _prevState: any,
  formData: FormData,
) {
  const listingId = Number(formData.get("listingId"));
  const verificationCode = formData.get("verificationCode")?.toString();

  if (!listingId) {
    return { success: false, message: "Invalid listing reference." };
  }

  if (!verificationCode) {
    return { success: false, message: "Verification code is required." };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You are not authorised.",
    };
  }

  /* ===============================
     FIND ASSIGNMENT
  ============================== */

  const assignment = await database.query.carrierAssignments.findFirst({
    where: and(
      eq(carrierAssignments.listingId, listingId),
      eq(carrierAssignments.verificationCode, verificationCode),
      isNotNull(carrierAssignments.collectedAt),
    ),
  });

  if (!assignment) {
    return {
      success: false,
      message: "❌ Invalid code or waste not yet collected.",
    };
  }

  /* ===============================
     CHECK INCIDENT BLOCK
  ============================== */

  const openIncident = await database.query.incidents.findFirst({
    where: and(
      eq(incidents.assignmentId, assignment.id),
      or(eq(incidents.status, "open"), eq(incidents.status, "under_review")),
    ),
  });

  if (openIncident) {
    return {
      success: false,
      message:
        "⚠️ This job has an open incident and cannot be completed until it is resolved.",
    };
  }

  /* ===============================
     COMPLETE ASSIGNMENT
  ============================== */

  await database
    .update(carrierAssignments)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignment.id));

  /* ===============================
     COMPLETE LISTING
  ============================== */

  await database
    .update(wasteListings)
    .set({
      status: "completed",
      assigned: true,
      offerAccepted: true,
    })
    .where(eq(wasteListings.id, listingId));

  /* ===============================
     REVALIDATE PAGE
  ============================== */

  revalidatePath("/home/carrier-hub/carrier-manager/job-assignments");

  return {
    success: true,
    message: "✅ Waste transfer successfully completed.",
  };
}
