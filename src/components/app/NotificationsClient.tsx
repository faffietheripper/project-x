"use client";

import { markAsRead } from "@/app/home/notifications/actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsClient({
  notifications,
  userId,
}: {
  notifications: {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
  }[];
  userId: string;
}) {
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="container mx-auto pt-36">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {!userId ? (
        <p className="text-red-500 font-semibold">User ID is missing!</p>
      ) : (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-2">Unread</h2>
            <div className="space-y-4">
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((n) => (
                  <div key={n.id} className="border p-4 rounded shadow">
                    <h3 className="font-bold">{n.title}</h3>
                    <p>{n.message}</p>
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                      disabled={isPending}
                    >
                      Mark as Read
                    </button>
                  </div>
                ))
              ) : (
                <p>No unread notifications.</p>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Read</h2>
            <div className="space-y-4">
              {readNotifications.length > 0 ? (
                readNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="border p-4 rounded shadow bg-gray-100"
                  >
                    <h3 className="font-bold">{n.title}</h3>
                    <p>{n.message}</p>
                  </div>
                ))
              ) : (
                <p>No read notifications.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
