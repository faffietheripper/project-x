import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { notifications, users, userProfiles } from "@/db/schema";
import { markAsRead } from "./actions";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  const userProfile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { id: true },
  });

  const userNotifications = await database.query.notifications.findMany({
    where: eq(notifications.recipientId, userId),
  });

  const needsRoleSetup = !user?.role;
  const needsProfileSetup = !userProfile;

  const systemNotifications: any[] = [];

  if (needsRoleSetup) {
    systemNotifications.push({
      id: "role-setup",
      title: "Complete Your Profile",
      message: "You haven't selected a role yet.",
      isRead: false,
      createdAt: new Date(),
    });
  }

  if (needsProfileSetup) {
    systemNotifications.push({
      id: "profile-setup",
      title: "Profile Setup Needed",
      message: "You need to set up your profile.",
      isRead: false,
      createdAt: new Date(),
    });
  }

  const allNotifications = [...systemNotifications, ...userNotifications];

  const sortedNotifications = allNotifications.sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return dateB - dateA;
  });

  return (
    <div className="pt-[18vh] pr-10 pl-[24vw]">
      <h1 className="text-2xl font-bold mb-8">Your Notifications</h1>

      {sortedNotifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 border rounded-lg shadow-sm ${
                notification.isRead ? "bg-gray-100" : "bg-white"
              }`}
            >
              <h3 className="font-bold">{notification.title}</h3>
              <p>{notification.message}</p>

              {!notification.isRead && typeof notification.id === "string" && (
                <form action={markAsRead}>
                  <input
                    type="hidden"
                    name="notificationId"
                    value={notification.id}
                  />
                  <button
                    type="submit"
                    className="mt-3 text-white bg-blue-500 px-4 py-2 rounded"
                  >
                    Mark as Read
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
