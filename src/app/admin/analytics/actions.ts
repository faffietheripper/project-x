"use server";

import { database } from "@/db/database";
import {
  organisations,
  users,
  wasteListings,
  bids,
  carrierAssignments,
  incidents,
  reviews,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getPlatformAnalytics() {
  const [
    totalOrgs,
    totalUsers,
    totalListings,
    totalBids,
    totalAssignments,
    completedAssignments,
    openIncidents,
    avgRating,
    totalMarketplaceValue,
  ] = await Promise.all([
    database.select({ value: sql<number>`count(*)` }).from(organisations),
    database.select({ value: sql<number>`count(*)` }).from(users),
    database.select({ value: sql<number>`count(*)` }).from(wasteListings),
    database.select({ value: sql<number>`count(*)` }).from(bids),
    database.select({ value: sql<number>`count(*)` }).from(carrierAssignments),
    database
      .select({ value: sql<number>`count(*)` })
      .from(carrierAssignments)
      .where(sql`status = 'completed'`),
    database
      .select({ value: sql<number>`count(*)` })
      .from(incidents)
      .where(sql`status = 'open'`),
    database
      .select({ value: sql<number>`avg(${reviews.rating})` })
      .from(reviews),
    database.select({ value: sql<number>`sum(${bids.amount})` }).from(bids),
  ]);

  return {
    growth: {
      organisations: totalOrgs[0].value,
      users: totalUsers[0].value,
    },
    marketplace: {
      listings: totalListings[0].value,
      bids: totalBids[0].value,
      totalValue: totalMarketplaceValue[0].value ?? 0,
    },
    logistics: {
      assignments: totalAssignments[0].value,
      completed: completedAssignments[0].value,
    },
    trust: {
      avgRating: avgRating[0].value ?? 0,
    },
    risk: {
      openIncidents: openIncidents[0].value,
    },
  };
}
