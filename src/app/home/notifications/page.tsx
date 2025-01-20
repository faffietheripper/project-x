import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { notifications } from "@/db/schema";
import { markAsRead } from "./actions";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  try {
    console.log("Session User ID:", session.user.id);

    const userNotifications = await database.query.notifications.findMany({
      where: eq(notifications.receiverId, session.user.id),
    });

    console.log("Fetched Notifications:", userNotifications);

    return (
      <div className="p-36">
        <h1 className="text-2xl font-bold mb-4">Your Notifications</h1>

        {userNotifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {userNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border rounded-lg shadow-sm ${
                  notification.isRead ? "bg-gray-100" : "bg-white"
                }`}
              >
                <h3 className="font-bold">{notification.title}</h3>
                <p>{notification.message}</p>
                {notification.url && (
                  <form action={markAsRead} method="post">
                    <input
                      type="hidden"
                      name="notificationId"
                      value={notification.id || ""}
                    />
                    <button
                      type="submit"
                      className="text-white hover:underline bg-blue-500 p-1 rounded-lg"
                    >
                      <a href={notification.url}> View Details</a>
                    </button>
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
