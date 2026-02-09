"use server";

import { database } from "@/db/database";
import { items, carrierAssignments, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Assign a carrier to an item
 * Creates ONE pending assignment
 */
export async function assignCarrierAction(
  itemId: number,
  carrierOrgId: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    throw new Error("User has no organisation");
  }

  // ✅ Create assignment (single source of truth)
  await database.insert(carrierAssignments).values({
    itemId,
    carrierOrganisationId: carrierOrgId,
    assignedByOrganisationId: dbUser.organisationId,
    status: "pending",
  });

  // ✅ Update item current state
  await database
    .update(items)
    .set({
      assignedCarrierOrganisationId: carrierOrgId,
      assignedByOrganisationId: dbUser.organisationId,
      assignedAt: new Date(),
      carrierStatus: "pending",
    })
    .where(eq(items.id, itemId));

  revalidatePath("/home/my-activity/assigned-jobs");
}

/**
 * Carrier accepts the job
 * Only updates a PENDING assignment
 */
export async function acceptCarrierJobAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  if (!itemId) throw new Error("Item ID required");

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item || !item.assignedCarrierOrganisationId) {
    throw new Error("Item not found or not assigned");
  }

  // ✅ Update ONLY the pending assignment
  await database
    .update(carrierAssignments)
    .set({
      status: "accepted",
      respondedAt: new Date(),
    })
    .where(
      and(
        eq(carrierAssignments.itemId, itemId),
        eq(
          carrierAssignments.carrierOrganisationId,
          item.assignedCarrierOrganisationId,
        ),
        eq(carrierAssignments.status, "pending"),
      ),
    );

  // ✅ Update item state
  await database
    .update(items)
    .set({ carrierStatus: "accepted" })
    .where(eq(items.id, itemId));

  revalidatePath("/home/my-activity/assigned-jobs");
}

/**
 * Carrier rejects the job
 * HARD DELETE assignment to avoid duplicates
 */
export async function rejectCarrierJobAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  if (!itemId) throw new Error("Item ID required");

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item || !item.assignedCarrierOrganisationId) {
    throw new Error("Item not found or not assigned");
  }

  // 🗑️ DELETE assignment instead of marking rejected
  await database
    .delete(carrierAssignments)
    .where(
      and(
        eq(carrierAssignments.itemId, itemId),
        eq(
          carrierAssignments.carrierOrganisationId,
          item.assignedCarrierOrganisationId,
        ),
      ),
    );

  // 🧹 Reset item so it can be reassigned
  await database
    .update(items)
    .set({
      assignedCarrierOrganisationId: null,
      assignedAt: null,
      carrierStatus: "pending",
    })
    .where(eq(items.id, itemId));

  revalidatePath("/home/my-activity/assigned-jobs");
}

/**
 * Carrier marks waste as collected using 6-digit code
 */
export async function markCollectedAction(_prevState: any, formData: FormData) {
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

  // 🔍 Find the ONE accepted assignment
  const assignment = await database.query.carrierAssignments.findFirst({
    where: and(
      eq(carrierAssignments.itemId, itemId),
      eq(carrierAssignments.verificationCode, verificationCode),
      eq(carrierAssignments.status, "accepted"),
    ),
  });

  if (!assignment) {
    return {
      success: false,
      message: "❌ Incorrect verification code. Please check and try again.",
    };
  }

  // ✅ Mark as collected
  await database
    .update(carrierAssignments)
    .set({
      status: "collected",
      collectedAt: new Date(),
      codeUsedAt: new Date(),
    })
    .where(eq(carrierAssignments.id, assignment.id));

  // ✅ Update item state
  await database
    .update(items)
    .set({ carrierStatus: "collected" })
    .where(eq(items.id, itemId));

  revalidatePath("/home/carrier-hub/assigned-jobs");

  return {
    success: true,
    message: "✅ Waste successfully marked as collected.",
  };
}
