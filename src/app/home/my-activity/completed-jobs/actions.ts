"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews, items, organisations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../../notifications/actions";

export async function createReviewAction({
  itemId,
  organisationId, // from client
  rating,
  reviewText,
}) {
  console.log("Received input for review action:", {
    itemId,
    organisationId,
    rating,
    reviewText,
  });

  const session = await auth();
  const userId = session?.user?.id;
  const userOrganisationId = session?.user?.organisationId;

  if (!userId) {
    return { error: "You must be logged in to leave a review." };
  }

  if (!itemId || !organisationId || !rating || !reviewText) {
    console.error("Missing required fields:", {
      itemId,
      organisationId,
      rating,
      reviewText,
    });
    throw new Error(
      "All fields (itemId, organisationId, rating, reviewText) must be provided."
    );
  }

  // Fetch the item with both org relations
  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      organisation: true, // Owner org
      winningOrganisation: true, // Waste handler org
    },
  });

  if (!item) {
    return { error: "Item not found." };
  }

  console.log("Item details:", {
    ownerOrgId: item.organisationId,
    winningOrgId: item.winningOrganisationId,
    currentUserOrgId: userOrganisationId,
  });

  // ✅ Authorisation: reviewer must belong to one of the involved orgs
  const isAuthorizedReviewer =
    item.organisationId === userOrganisationId ||
    item.winningOrganisationId === userOrganisationId;

  if (!isAuthorizedReviewer) {
    return { error: "You are not authorized to review this item." };
  }

  // ✅ Determine the ACTUAL target organisation from item data
  let actualTargetOrgId: string | null = null;

  if (userOrganisationId === item.organisationId) {
    // Reviewer is owner → review winning org
    actualTargetOrgId = item.winningOrganisationId;
  } else if (userOrganisationId === item.winningOrganisationId) {
    // Reviewer is winning org → review owner org
    actualTargetOrgId = item.organisationId;
  }

  // Fallback to passed organisationId if above logic fails
  if (!actualTargetOrgId) {
    actualTargetOrgId = organisationId;
  }

  // ✅ Prevent self-review only if it’s literally the same org
  if (actualTargetOrgId === userOrganisationId) {
    return { error: "You cannot review your own organisation." };
  }

  // Check the target org exists
  const targetOrganisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, actualTargetOrgId),
  });

  if (!targetOrganisation) {
    return { error: "Organisation not found." };
  }

  try {
    const reviewData = {
      reviewerId: userId,
      organisationId: actualTargetOrgId,
      rating,
      reviewText,
      timestamp: new Date(),
    };

    console.log("Review data to insert:", reviewData);

    await database.insert(reviews).values(reviewData);

    // Notify the reviewed org
    const title = "New Review Received!";
    const message = `Your organisation received a review: "${reviewText}" with a rating of ${rating} stars.`;
    const reviewUrl = `/organisation/${actualTargetOrgId}/reviews`;

    await createNotification(actualTargetOrgId, title, message, reviewUrl);

    return { success: true, message: "Review submitted successfully." };
  } catch (error) {
    console.error("Error inserting review or sending notification:", error);
    throw new Error("Failed to create review.");
  }
}
