"use server";

import { database } from "@/db/database";
import { organisations, wasteListings, incidents, users } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/access/require-platform-admin";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/* =========================================================
   SUSPEND ORGANISATION
========================================================= */

export async function suspendOrganisation(formData: FormData) {
  await requirePlatformAdmin();

  const organisationId = String(formData.get("organisationId"));

  await database
    .update(organisations)
    .set({ isSuspended: true })
    .where(eq(organisations.id, organisationId));

  revalidatePath("/admin");
}

/* =========================================================
   CANCEL LISTING
========================================================= */

export async function cancelListing(formData: FormData) {
  await requirePlatformAdmin();

  const listingId = Number(formData.get("listingId"));

  await database
    .update(wasteListings)
    .set({ status: "cancelled" })
    .where(eq(wasteListings.id, listingId));

  revalidatePath("/admin");
}

/* =========================================================
   RESOLVE INCIDENT
========================================================= */

export async function resolveIncident(formData: FormData) {
  await requirePlatformAdmin();

  const incidentId = String(formData.get("incidentId"));

  await database
    .update(incidents)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
    })
    .where(eq(incidents.id, incidentId));

  revalidatePath("/admin");
}

/* =========================================================
   RESET USER ACCOUNT
========================================================= */

export async function resetUserAccount(formData: FormData) {
  await requirePlatformAdmin();

  const userId = String(formData.get("userId"));

  await database
    .update(users)
    .set({
      isSuspended: false,
      passwordHash: null,
    })
    .where(eq(users.id, userId));

  revalidatePath("/admin");
}
