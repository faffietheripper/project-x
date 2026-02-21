"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import {
  wasteListings,
  carrierAssignments,
  users,
  organisations,
} from "@/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "../../notifications/actions";

/** 🔐 6-digit token generator */
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function assignCarrierAction(
  listingId: number,
  carrierOrganisationId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  /** 🔑 Fetch assigning user */
  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.organisationId) {
    throw new Error("User has no organisation");
  }

  /** 📦 Fetch listing */
  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),
  });

  if (!listing) {
    throw new Error("Listing not found");
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

  /** 1️⃣ Update listing state */
  await database
    .update(wasteListings)
    .set({
      assignedCarrierOrganisationId: carrierOrganisationId,
      assignedByOrganisationId: user.organisationId,
      assignedAt: new Date(),
      assigned: true,
    })
    .where(eq(wasteListings.id, listingId));

  /** 2️⃣ Insert carrier assignment */
  await database.insert(carrierAssignments).values({
    listingId,
    carrierOrganisationId,
    assignedByOrganisationId: user.organisationId,
    status: "pending",
    assignedAt: new Date(),
    verificationCode,
  });

  /** 3️⃣ Notify waste generator */
  if (listing.userId) {
    await createNotification(
      listing.userId,
      "Waste Carrier Assigned 🚛",
      `
A waste carrier has been assigned to your job "${listing.name}".

Carrier:
${carrierOrg.teamName}
📧 ${carrierOrg.emailAddress}
📞 ${carrierOrg.telephone}

Verification Code:
🔐 ${verificationCode}

Please keep this code safe — it will be required at collection.
      `.trim(),
      "/home/my-activity/jobs-in-progress",
    );
  }

  revalidatePath("/home/carrier-hub/waste-carriers/assigned-carrier-jobs");
  revalidatePath("/home/my-activity/jobs-in-progress");

  return { success: true };
}

/**
 * Get jobs that this organisation won
 * and are eligible for carrier assignment
 */
export async function getWinningJobsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { organisationId: true },
  });

  if (!user?.organisationId) return [];

  const jobs = await database
    .select()
    .from(wasteListings)
    .where(
      and(
        eq(wasteListings.winningOrganisationId, user.organisationId),
        eq(wasteListings.offerAccepted, true),
        eq(wasteListings.archived, false),
        or(
          isNull(wasteListings.assignedCarrierOrganisationId),
          eq(wasteListings.assigned, false),
        ),
      ),
    );

  return jobs;
}
