"use server";

import { database } from "@/db/database";
import {
  organisations,
  users,
  wasteListings,
  carrierAssignments,
  reviews,
} from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

/* =========================================
   GET ALL ORGANISATIONS (WITH SEARCH)
========================================= */

export async function getAllOrganisations(search?: string) {
  const query = database
    .select({
      id: organisations.id,
      teamName: organisations.teamName,
      industry: organisations.industry,
      email: organisations.emailAddress,
      telephone: organisations.telephone,
      country: organisations.country,
      createdAt: organisations.createdAt,

      memberCount: sql<number>`count(distinct ${users.id})`,
      listingsCount: sql<number>`count(distinct ${wasteListings.id})`,
      carrierJobsCount: sql<number>`count(distinct ${carrierAssignments.id})`,
      avgRating: sql<number>`avg(${reviews.rating})`,
    })
    .from(organisations)
    .leftJoin(users, eq(users.organisationId, organisations.id))
    .leftJoin(wasteListings, eq(wasteListings.organisationId, organisations.id))
    .leftJoin(
      carrierAssignments,
      eq(carrierAssignments.carrierOrganisationId, organisations.id),
    )
    .leftJoin(reviews, eq(reviews.reviewedOrganisationId, organisations.id))
    .groupBy(organisations.id);

  if (search) {
    query.where(
      or(
        ilike(organisations.teamName, `%${search}%`),
        ilike(organisations.emailAddress, `%${search}%`),
      ),
    );
  }

  return query.orderBy(desc(organisations.createdAt));
}
/* =========================================
   GET SINGLE ORGANISATION
========================================= */

export async function getOrganisationById(orgId: string) {
  const [org] = await database
    .select({
      id: organisations.id,
      teamName: organisations.teamName,
      industry: organisations.industry,
      email: organisations.emailAddress,
      telephone: organisations.telephone,
      country: organisations.country,
      city: organisations.city,
      region: organisations.region,
      postCode: organisations.postCode,
      streetAddress: organisations.streetAddress,
      createdAt: organisations.createdAt,

      memberCount: sql<number>`count(distinct ${users.id})`,
      listingsCount: sql<number>`count(distinct ${wasteListings.id})`,
      carrierJobsCount: sql<number>`count(distinct ${carrierAssignments.id})`,
      avgRating: sql<number>`avg(${reviews.rating})`,
    })
    .from(organisations)
    .leftJoin(users, eq(users.organisationId, organisations.id))
    .leftJoin(wasteListings, eq(wasteListings.organisationId, organisations.id))
    .leftJoin(
      carrierAssignments,
      eq(carrierAssignments.carrierOrganisationId, organisations.id),
    )
    .leftJoin(reviews, eq(reviews.reviewedOrganisationId, organisations.id))
    .where(eq(organisations.id, orgId))
    .groupBy(organisations.id);

  return org;
}
