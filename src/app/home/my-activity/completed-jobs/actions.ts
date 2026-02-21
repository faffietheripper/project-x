"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews, wasteListings, organisations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../../notifications/actions";

export async function createReviewAction({
  listingId,
  rating,
  reviewText,
}: {
  listingId: number;
  rating: number;
  reviewText: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const userOrganisationId = session?.user?.organisationId;

  if (!userId || !userOrganisationId) {
    return { error: "You must be logged in to leave a review." };
  }

  if (!listingId || !rating || !reviewText) {
    return { error: "All fields are required." };
  }

  // Fetch listing
  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),
  });

  if (!listing) {
    return { error: "Listing not found." };
  }

  // Reviewer must belong to one of involved orgs
  const isAuthorized =
    listing.organisationId === userOrganisationId ||
    listing.winningOrganisationId === userOrganisationId;

  if (!isAuthorized) {
    return { error: "You are not authorized to review this listing." };
  }

  // Determine target org
  let targetOrganisationId: string | null = null;

  if (userOrganisationId === listing.organisationId) {
    targetOrganisationId = listing.winningOrganisationId;
  } else if (userOrganisationId === listing.winningOrganisationId) {
    targetOrganisationId = listing.organisationId;
  }

  if (!targetOrganisationId) {
    return { error: "Unable to determine organisation to review." };
  }

  if (targetOrganisationId === userOrganisationId) {
    return { error: "You cannot review your own organisation." };
  }

  // Ensure org exists
  const targetOrg = await database.query.organisations.findFirst({
    where: eq(organisations.id, targetOrganisationId),
  });

  if (!targetOrg) {
    return { error: "Organisation not found." };
  }

  try {
    await database.insert(reviews).values({
      reviewerId: userId,
      reviewedOrganisationId: targetOrganisationId,
      listingId,
      rating,
      comment: reviewText,
    });

    // Notify all users in that organisation
    const orgMembers = await database.query.users.findMany({
      where: eq(users.organisationId, targetOrganisationId),
      columns: { id: true },
    });

    await Promise.all(
      orgMembers.map((member) =>
        createNotification(
          member.id,
          "New Review Received!",
          `Your organisation received a ${rating}-star review.`,
          `/home/organisations/${targetOrganisationId}`,
        ),
      ),
    );

    return { success: true, message: "Review submitted successfully." };
  } catch (error) {
    console.error("Error creating review:", error);
    return { error: "Failed to create review." };
  }
}
