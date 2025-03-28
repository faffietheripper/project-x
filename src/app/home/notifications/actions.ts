"use server";

import { eq } from "drizzle-orm";
import { database } from "@/db/database";
import { notifications, users, profiles } from "@/db/schema";

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
export async function markAsRead(formData: FormData) {
  const notificationId = formData.get("notificationId");

  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  try {
    await database
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read.");
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    // Fetch all notifications with `isRead` as false
    const allUnreadNotifications = await database.query.notifications.findMany({
      where: (notifications, { eq }) => eq(notifications.isRead, false),
    });

    if (!allUnreadNotifications) {
      console.error("No unread notifications found in the database.");
      return 0;
    }

    // Filter notifications belonging to the specific user
    const userUnreadNotifications = allUnreadNotifications.filter(
      (notification) => notification.receiverId === userId
    );

    // Return the count of unread notifications for the user
    return userUnreadNotifications.length;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0; // Fallback to 0 in case of an error
  }
}

export async function checkForSystemNotifications(
  userId: string
): Promise<boolean> {
  try {
    const user = await database.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    const userProfile = await database.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
      columns: { id: true },
    });

    return !user?.role || !userProfile;
  } catch (error) {
    console.error("Error checking for system notifications:", error);
    return false;
  }
}
