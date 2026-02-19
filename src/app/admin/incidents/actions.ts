"use server";

import { database } from "@/db/database";
import { incidents } from "@/db/schema";
import { and, eq, gte, lte, ilike, desc } from "drizzle-orm";

/* =========================================================
   GET INCIDENTS WITH FILTERING
========================================================= */

export async function getFilteredIncidents(filters: {
  status?: string;
  from?: string;
  to?: string;
  q?: string;
}) {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(incidents.status, filters.status as any));
  }

  if (filters.from) {
    conditions.push(gte(incidents.createdAt, new Date(filters.from)));
  }

  if (filters.to) {
    conditions.push(lte(incidents.createdAt, new Date(filters.to)));
  }

  if (filters.q) {
    conditions.push(ilike(incidents.summary, `%${filters.q}%`));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const data = await database.query.incidents.findMany({
    where: whereClause,
    with: {
      listing: true,
      reportedByOrganisation: true,
      reportedByUser: true,
    },
    orderBy: (i) => [desc(i.createdAt)],
  });

  return data;
}

/* =========================================================
   INCIDENT KPIs
========================================================= */

export async function getIncidentKpis() {
  const all = await database.query.incidents.findMany();

  return {
    open: all.filter((i) => i.status === "open").length,
    underReview: all.filter((i) => i.status === "under_review").length,
    resolved: all.filter((i) => i.status === "resolved").length,
    rejected: all.filter((i) => i.status === "rejected").length,
    total: all.length,
  };
}

/* =========================================================
   UPDATE STATUS
========================================================= */

export async function updateIncidentStatus(
  incidentId: string,
  status: "open" | "under_review" | "resolved" | "rejected",
) {
  await database
    .update(incidents)
    .set({
      status,
      resolvedAt: status === "resolved" ? new Date() : null,
    })
    .where(eq(incidents.id, incidentId));
}
