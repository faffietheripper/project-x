"use server";

import { eq } from "drizzle-orm";
import { database } from "@/db/database";
import { notifications } from "@/db/schema";

// Create a notification
export async function createNotification(
  receiverId: string,
  title: string,
  message: string,
  url?: string // Optional parameter for the notification link
) {
  await database
    .insert(notifications)
    .values({ receiverId, title, message, url });
}

// Get user notifications
export async function getUserNotifications(userId: string) {
  if (!userId) {
    throw new Error("User ID is undefined or invalid.");
  }

  return await database
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId));
}

// Mark a notification as read
export async function markAsRead(notificationId: string) {
  if (!notificationId) {
    throw new Error("Notification ID is undefined or invalid.");
  }

  await database
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
