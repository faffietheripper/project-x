import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import {
  users,
  organisations,
  items,
  carrierAssignments,
  notifications,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) throw new Error("No organisation found");

  const organisation = await database.query.organisations.findFirst({
    where: eq(organisations.id, dbUser.organisationId),
  });

  // ===== METRICS =====

  const orgItems = await database.query.items.findMany({
    where: eq(items.organisationId, dbUser.organisationId),
  });

  const orgAssignments = await database.query.carrierAssignments.findMany({
    where: eq(
      carrierAssignments.assignedByOrganisationId,
      dbUser.organisationId,
    ),
  });

  const unreadNotifications = await database.query.notifications.findMany({
    where: and(
      eq(notifications.receiverId, session.user.id),
      eq(notifications.isRead, false),
    ),
  });

  const activeJobs = orgItems.filter((i) => !i.archived);
  const collectedJobs = orgAssignments.filter((a) => a.status === "collected");
  const completedJobs = orgAssignments.filter((a) => a.status === "completed");

  return (
    <div className="p-8 space-y-10">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {dbUser.name}</h1>
        <p className="text-sm opacity-90">{organisation?.teamName}</p>
        <p className="text-sm opacity-75">
          {organisation?.city}, {organisation?.country}
        </p>
      </div>

      {/* ===== KPI GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Jobs"
          value={activeJobs.length}
          href="/home/items"
        />
        <DashboardCard
          title="Collected (Awaiting Completion)"
          value={collectedJobs.length}
          href="/home/carrier-hub/job-assignments"
        />
        <DashboardCard
          title="Completed Transfers"
          value={completedJobs.length}
          href="/home/carrier-hub/job-assignments"
        />
        <DashboardCard
          title="Unread Notifications"
          value={unreadNotifications.length}
          href="/home/notifications"
        />
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== LEFT – Recent Job Activity ===== */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-6">
            Recent Assignment Activity
          </h2>

          {orgAssignments.length === 0 && (
            <p className="text-gray-500 text-sm">No assignment activity yet.</p>
          )}

          <div className="space-y-4">
            {orgAssignments
              .sort(
                (a, b) =>
                  new Date(b.assignedAt ?? 0).getTime() -
                  new Date(a.assignedAt ?? 0).getTime(),
              )
              .slice(0, 5)
              .map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <div className="font-medium text-sm">
                      Job #{assignment.itemId}
                    </div>
                    <div className="text-xs text-gray-500">
                      Assigned {assignment.assignedAt?.toLocaleDateString()}
                    </div>
                  </div>

                  <StatusBadge status={assignment.status} />
                </div>
              ))}
          </div>
        </div>

        {/* ===== RIGHT – Quick Actions & Insights ===== */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

            <div className="flex flex-col gap-3 text-sm">
              <Link
                href="/home/items/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-center"
              >
                + Create Waste Listing
              </Link>

              <Link
                href="/home/carrier-hub"
                className="border px-4 py-2 rounded-md text-center"
              >
                Manage Carrier Assignments
              </Link>

              <Link
                href="/home/notifications"
                className="border px-4 py-2 rounded-md text-center"
              >
                View Notifications
              </Link>
            </div>
          </div>

          {/* Industry News (Static but cool) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Industry Updates</h2>

            <ul className="text-sm space-y-3">
              <li>♻️ UK Digital Waste Tracking rollout expanding</li>
              <li>🚛 Transport emissions compliance tightening in 2026</li>
              <li>📦 Circular economy funding increasing across Europe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== FOOTER STATUS ===== */}
      <div className="bg-gray-50 p-4 rounded-xl border text-xs text-gray-500 text-center">
        Secure Chain of Custody Active · All Systems Operational
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition"
    >
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-3 py-1 rounded-full text-xs font-medium capitalize";

  if (status === "pending")
    return (
      <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>
    );

  if (status === "accepted")
    return (
      <span className={`${base} bg-blue-100 text-blue-800`}>Accepted</span>
    );

  if (status === "collected")
    return (
      <span className={`${base} bg-orange-100 text-orange-800`}>Collected</span>
    );

  if (status === "completed")
    return (
      <span className={`${base} bg-green-100 text-green-800`}>Completed</span>
    );

  return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
}
