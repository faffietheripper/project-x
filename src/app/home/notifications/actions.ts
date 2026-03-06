"use server";

import { eq, and } from "drizzle-orm";
import { database } from "@/db/database";
import { notifications, users, userProfiles } from "@/db/schema";

/* =========================================================
   HELPER — Get user's organisation
========================================================= */

async function getUserOrganisationId(userId: string) {
  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      organisationId: true,
    },
  });

  if (!user?.organisationId) {
    throw new Error("User organisation not found");
  }

  return user.organisationId;
}

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export async function createNotification(
  recipientId: string,
  title: string,
  message: string,
  type: string,
  listingId?: number,
) {
  if (!recipientId) {
    throw new Error("Recipient ID is required");
  }

  const organisationId = await getUserOrganisationId(recipientId);

  await database.insert(notifications).values({
    organisationId,
    recipientId,
    title,
    message,
    type,
    listingId: listingId ?? null,
    isRead: false,
  });
}

/* =========================================================
   GET USER NOTIFICATIONS
========================================================= */

export async function getUserNotifications(userId: string) {
  const organisationId = await getUserOrganisationId(userId);

  return await database
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.organisationId, organisationId),
      ),
    )
    .orderBy(notifications.createdAt);
}

/* =========================================================
   MARK AS READ
========================================================= */

export async function markAsRead(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;
  const userId = formData.get("userId") as string;

  if (!notificationId || !userId) {
    throw new Error("Missing required fields");
  }

  const organisationId = await getUserOrganisationId(userId);

  await database
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.organisationId, organisationId),
      ),
    );
}

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export async function getUnreadNotificationsCount(userId: string) {
  const organisationId = await getUserOrganisationId(userId);

  const unread = await database
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.organisationId, organisationId),
        eq(notifications.isRead, false),
      ),
    );

  return unread.length;
}

/* =========================================================
   SYSTEM PROFILE CHECK
========================================================= */

export async function checkForSystemNotifications(
  userId: string,
): Promise<boolean> {
  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  const profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { id: true },
  });

  return !user?.role || !profile;
}
