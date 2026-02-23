import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, organisations } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminSupportDashboard() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Only platform admin
  if (session.user.role !== "platform_admin") {
    throw new Error("Access denied.");
  }

  const tickets = await database.query.supportTickets.findMany({
    with: {
      organisation: true,
      assignedTo: true,
    },
    orderBy: desc(supportTickets.updatedAt),
  });

  return (
    <main className="p-12 space-y-8">
      <h1 className="text-3xl font-bold">Support Management</h1>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/admin/support/${ticket.id}`}
            className="block bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold capitalize">
                  {ticket.category.replace("_", " ")}
                </div>
                <div className="text-sm text-gray-500">
                  {ticket.organisation?.teamName}
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-2">
              Updated {ticket.updatedAt?.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

/* ===============================
   BADGES
================================= */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    waiting_on_user: "bg-yellow-100 text-yellow-700",
    resolved: "bg-purple-100 text-purple-700",
    closed: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[priority]}`}>
      {priority}
    </span>
  );
}
