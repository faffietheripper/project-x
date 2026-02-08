"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { items, carrierAssignments, users, organisations } from "@/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "../../notifications/actions";

/** 🔐 6-digit token generator */
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function assignCarrierAction(
  itemId: number,
  carrierOrganisationId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  /** 🔑 Fetch assigning user (waste manager) */
  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.organisationId) {
    throw new Error("User has no organisation");
  }

  /** 📦 Fetch item */
  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  /** 🏢 Fetch carrier organisation */
  const carrierOrg = await database.query.organisations.findFirst({
    where: eq(organisations.id, carrierOrganisationId),
  });

  if (!carrierOrg) {
    throw new Error("Carrier organisation not found");
  }

  /** 🔐 Generate verification token */
  const verificationCode = generateSixDigitCode();

  /** 1️⃣ Update item (current state) */
  await database
    .update(items)
    .set({
      assignedCarrierOrganisationId: carrierOrganisationId,
      assignedByOrganisationId: user.organisationId,
      carrierStatus: "pending",
      assignedAt: new Date(),
    })
    .where(eq(items.id, itemId));

  /** 2️⃣ Insert carrier assignment (history + token) */
  await database.insert(carrierAssignments).values({
    itemId,
    carrierOrganisationId,
    assignedByOrganisationId: user.organisationId,
    status: "pending",
    assignedAt: new Date(),
    verificationCode, // 👈 stored here
  });

  /** 3️⃣ Notify waste generator */
  if (item.userId) {
    await createNotification(
      item.userId,
      "Waste Carrier Assigned 🚛",
      `
A waste carrier has been assigned to your job "${item.name}".

Carrier:
${carrierOrg.teamName}
📧 ${carrierOrg.emailAddress}
📞 ${carrierOrg.telephone}

Verification Code:
🔐 ${verificationCode}

Please keep this code safe — it will be required at collection and completion.
      `.trim(),
      "/home/my-activity/jobs-in-progress",
    );
  }

  /** 🔁 Refresh UI */
  revalidatePath("/home/carrier-hub/waste-carriers/assigned-carrier-jobs");
  revalidatePath("/home/my-activity/jobs-in-progress");

  return { success: true };
}

export async function getWinningJobsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // 🔑 Resolve organisation from DB
  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      organisationId: true,
    },
  });

  if (!user?.organisationId) return [];

  const jobs = await database
    .select()
    .from(items)
    .where(
      and(
        // 🏆 You won the job
        eq(items.winningOrganisationId, user.organisationId),

        // ✅ You accepted the offer
        eq(items.offerAccepted, true),

        // 📦 Still active
        eq(items.archived, false),

        // 🚚 Carrier logic
        or(
          isNull(items.assignedCarrierOrganisationId), // never assigned
          eq(items.carrierStatus, "rejected"), // rejected → comes back
        ),
      ),
    );

  return jobs;
}
