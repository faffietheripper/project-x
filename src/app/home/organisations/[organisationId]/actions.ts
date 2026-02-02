"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { items, carrierAssignments, users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function assignCarrierAction(
  itemId: number,
  carrierOrganisationId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch assigning user's organisation
  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.organisationId) {
    throw new Error("User has no organisation");
  }

  // 1️⃣ Update item (current assignment state)
  await database
    .update(items)
    .set({
      assignedCarrierOrganisationId: carrierOrganisationId,
      assignedByOrganisationId: user.organisationId,
      carrierStatus: "pending",
      assignedAt: new Date(),
    })
    .where(eq(items.id, itemId));

  // 2️⃣ INSERT carrier assignment (THIS WAS MISSING)
  await database.insert(carrierAssignments).values({
    itemId,
    carrierOrganisationId,
    assignedByOrganisationId: user.organisationId,
    status: "pending",
    assignedAt: new Date(),
  });

  // Revalidate carrier + assigner views
  revalidatePath("/home/carrier-hub/waste-carriers/assigned-carrier-jobs");
  revalidatePath("/home/my-activity/jobs-in-progress");

  return { success: true };
}

export async function getWinningJobsAction() {
  const session = await auth();
  const userOrgId = session?.user?.organisationId;

  if (!userOrgId) return [];

  const jobs = await database
    .select()
    .from(items)
    .where(
      and(
        eq(items.winningOrganisationId, userOrgId), // Your org won the job
        isNull(items.assignedCarrierOrganisationId), // Not yet assigned to a carrier
        eq(items.archived, false), // Not archived
        eq(items.completed, false), // Not completed
      ),
    );

  return jobs;
}
