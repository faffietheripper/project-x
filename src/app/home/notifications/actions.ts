"use server";

import { eq, and } from "drizzle-orm";
import { database } from "@/db/database";
import { notifications, users, profiles } from "@/db/schema";

/** ✅ Create a notification */
export async function createNotification(
  receiverId: string,
  title: string,
  message: string,
  url: string, // 🔒 REQUIRED by schema
) {
  if (!receiverId) {
    throw new Error("Receiver ID is required for notification");
  }

  await database.insert(notifications).values({
    receiverId,
    title,
    message,
    url,
    isRead: false,
  });
}

/** ✅ Get user notifications */
export async function getUserNotifications(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return await database
    .select()
    .from(notifications)
    .where(eq(notifications.receiverId, userId))
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

/** ✅ Get unread count (DB-level filter) */
export async function getUnreadNotificationsCount(userId: string) {
  if (!userId) return 0;

  const unread = await database
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.receiverId, userId),
        eq(notifications.isRead, false),
      ),
    );

  return unread.length;
}

/** ✅ System notification check (unchanged logic, fixed safety) */
export async function checkForSystemNotifications(
  userId: string,
): Promise<boolean> {
  if (!userId) return false;

  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });

  return !user?.role || !profile;
}
