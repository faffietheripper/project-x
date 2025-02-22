import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, and, isNull } from "drizzle-orm";
import { notifications, users, profiles } from "@/db/schema";
import { markAsRead } from "./actions";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  try {
    // Fetch user details (role & profile status)
    const user = await database.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    const userProfile = await database.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
      columns: { id: true },
    });

    // Fetch stored notifications
    const userNotifications = await database.query.notifications.findMany({
      where: eq(notifications.receiverId, userId),
    });

    // Generate missing role notification
    const needsRoleSetup = !user?.role;
    const needsProfileSetup = !userProfile;

    const systemNotifications = [];

    if (needsRoleSetup) {
      systemNotifications.push({
        id: "role-setup",
        title: "Complete Your Profile",
        message: "You haven't selected a role yet. Please update your profile.",
        url: "/home/me",
        isRead: false, // Always unread until they fix it
      });
    }

    if (needsProfileSetup) {
      systemNotifications.push({
        id: "profile-setup",
        title: "Profile Setup Needed",
        message: "You need to set up your profile. Complete it now.",
        url: "/home/me",
        isRead: false, // Always unread until they fix it
      });
    }

    // Combine stored notifications with system-generated ones
    const allNotifications = [...systemNotifications, ...userNotifications];

    return (
      <div className="p-36">
        <h1 className="text-2xl font-bold mb-8">Your Notifications</h1>

        {allNotifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {allNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border rounded-lg shadow-sm flex justify-between ${
                  notification.isRead ? "bg-gray-100" : "bg-white"
                }`}
              >
                <div>
                  <h3 className="font-bold">{notification.title}</h3>
                  <p>{notification.message}</p>
                </div>

                {notification.url && (
                  <form action={markAsRead} method="post">
                    <input
                      type="hidden"
                      name="notificationId"
                      value={notification.id}
                    />
                    <div className="space-x-3">
                      {!notification.isRead && (
                        <button
                          type="submit"
                          className="text-white hover:underline bg-blue-500 p-2 rounded-lg"
                        >
                          Mark as Read
                        </button>
                      )}
                      <a
                        href={notification.url}
                        className="text-white hover:underline bg-blue-500 p-2 rounded-lg"
                      >
                        View Details
                      </a>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return (
      <div className="p-36">
        <h1 className="text-2xl font-bold mb-4">Your Notifications</h1>
        <p className="text-red-500">Failed to load notifications.</p>
      </div>
    );
  }
}
