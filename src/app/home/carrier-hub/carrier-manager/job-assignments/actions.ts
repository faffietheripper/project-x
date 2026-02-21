"use server";

import { database } from "@/db/database";
import { wasteListings, carrierAssignments, incidents } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markCompletedByManagerAction(
  _prevState: any,
  formData: FormData,
) {
  const listingId = Number(formData.get("itemId"));
  const verificationCode = formData.get("verificationCode")?.toString();

  if (!listingId || !verificationCode) {
    return {
      success: false,
      message: "Verification code is required.",
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "You are not authorised.",
    };
  }

  // 🔍 Find collected assignment
  const assignment = await database.query.carrierAssignments.findFirst({
    where: and(
      eq(carrierAssignments.listingId, listingId),
      eq(carrierAssignments.verificationCode, verificationCode),
      eq(carrierAssignments.status, "collected"),
    ),
  });

  if (!assignment) {
    return {
      success: false,
      message: "❌ Invalid code or waste not yet collected.",
    };
  }

  // 🚨 BLOCK COMPLETION IF OPEN INCIDENT EXISTS
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

  // ✅ Mark assignment completed
  await database
    .update(carrierAssignments)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignment.id));

  // ✅ Mark listing as assigned + completed
  await database
    .update(wasteListings)
    .set({
      assigned: true,
      offerAccepted: true,
    })
    .where(eq(wasteListings.id, listingId));

  revalidatePath("/home/carrier-hub/carrier-manager/job-assignments");

  return {
    success: true,
    message: "✅ Waste transfer successfully completed.",
  };
}
