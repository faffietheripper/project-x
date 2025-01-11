import { getUserNotifications } from "./actions";
import NotificationsClient from "@/components/app/NotificationsClient";
import { auth } from "@/auth";

export default async function NotificationsPage() {
  // Get the current user's session
  const session = await auth();
  const userId = session?.user?.id; // Adjust based on your session structure

  // If `userId` exists, fetch notifications; otherwise, provide an empty list
  const notifications = userId ? await getUserNotifications(userId) : [];

  return (
    <main>
      {userId ? (
        <NotificationsClient notifications={notifications} userId={userId} />
      ) : (
        <p className="text-red-500 font-semibold">
          Please log in to view your notifications.
        </p>
      )}
    </main>
  );
}
