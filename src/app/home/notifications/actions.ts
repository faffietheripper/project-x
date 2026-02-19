"use server";

import { eq, and } from "drizzle-orm";
import { database } from "@/db/database";
import { notifications, users, userProfiles } from "@/db/schema";

/** ✅ Create a notification */
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

  await database.insert(notifications).values({
    recipientId,
    title,
    message,
    type,
    listingId: listingId ?? null,
    isRead: false,
  });
}

/** ✅ Get user notifications */
export async function getUserNotifications(userId: string) {
  return await database
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(notifications.createdAt);
}

/** ✅ Mark notification as read */
export async function markAsRead(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;

  if (!notificationId) {
    throw new Error("Notification ID is required");
  }

  await database
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

/** ✅ Get unread count */
export async function getUnreadNotificationsCount(userId: string) {
  const unread = await database
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false),
      ),
    );

  return unread.length;
}

/** ✅ System notification check */
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
