"use server";

import { database } from "@/db/database";
import { items, carrierAssignments } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  // 1️⃣ Create assignment history record
  await database.insert(carrierAssignments).values({
    itemId,
    carrierOrganisationId: carrierOrgId,
    assignedByOrganisationId: dbUser.organisationId,
    status: "pending",
  });

  // 2️⃣ Update item (current state)
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

  // Update latest assignment
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
      ),
    );

  // Update item current state
  await database
    .update(items)
    .set({ carrierStatus: "accepted" })
    .where(eq(items.id, itemId));

  revalidatePath("/home/my-activity/assigned-jobs");
}

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

  // Update assignment history
  await database
    .update(carrierAssignments)
    .set({
      status: "rejected",
      respondedAt: new Date(),
    })
    .where(
      and(
        eq(carrierAssignments.itemId, itemId),
        eq(
          carrierAssignments.carrierOrganisationId,
          item.assignedCarrierOrganisationId,
        ),
      ),
    );

  // Clear item so it can be reassigned
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
