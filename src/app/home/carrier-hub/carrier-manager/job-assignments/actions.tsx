"use server";

import { database } from "@/db/database";
import { items, carrierAssignments, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
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

  // 🔍 Find assignment that is already collected
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

  // ✅ Mark completed
  await database
    .update(carrierAssignments)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignment.id));

  // ✅ Update item state
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
