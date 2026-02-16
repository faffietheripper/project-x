"use server";

import { database } from "@/db/database";
import { items, carrierAssignments, users, incidents } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markCompletedByManagerAction(
  _prevState: any,
  formData: FormData,
) {
  const itemId = Number(formData.get("itemId"));
  const verificationCode = formData.get("verificationCode")?.toString();

  if (!itemId || !verificationCode) {
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
      eq(carrierAssignments.itemId, itemId),
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

  // ✅ Update item status
  await database
    .update(items)
    .set({ carrierStatus: "completed" })
    .where(eq(items.id, itemId));

  revalidatePath("/home/manager-hub/active-jobs");

  return {
    success: true,
    message: "✅ Waste transfer successfully completed.",
  };
}
