"use server";

import { database } from "@/db/database";
import { reviews, organisations, users, wasteListings } from "@/db/schema";
import { desc, eq, gte, sql, ilike, or } from "drizzle-orm";

/* =========================================
   GET REVIEW DASHBOARD DATA
========================================= */

export async function getReviewDashboard(search?: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const baseQuery = database
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,

      reviewerName: users.name,
      reviewerEmail: users.email,

      organisationName: organisations.teamName,
      organisationId: organisations.id,

      listingId: wasteListings.id,
      listingName: wasteListings.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.reviewerId, users.id))
    .leftJoin(
      organisations,
      eq(reviews.reviewedOrganisationId, organisations.id),
    )
    .leftJoin(wasteListings, eq(reviews.listingId, wasteListings.id));

  if (search) {
    baseQuery.where(
      or(
        ilike(users.name, `%${search}%`),
        ilike(organisations.teamName, `%${search}%`),
        ilike(reviews.comment, `%${search}%`),
      ),
    );
  }

  const reviewList = await baseQuery.orderBy(desc(reviews.createdAt));

  // Summary stats
  const [totalReviews, avgRating, thisWeek, ratingBreakdown] =
    await Promise.all([
      database.select({ value: sql<number>`count(*)` }).from(reviews),

      database
        .select({ value: sql<number>`avg(${reviews.rating})` })
        .from(reviews),

      database
        .select({ value: sql<number>`count(*)` })
        .from(reviews)
        .where(gte(reviews.createdAt, sevenDaysAgo)),

      database
        .select({
          rating: reviews.rating,
          count: sql<number>`count(*)`,
        })
        .from(reviews)
        .groupBy(reviews.rating),
    ]);

  return {
    reviews: reviewList,
    stats: {
      total: totalReviews[0].value,
      average: avgRating[0].value ?? 0,
      thisWeek: thisWeek[0].value,
      breakdown: ratingBreakdown,
    },
  };
}
