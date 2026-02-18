import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getPlatformDashboardStats } from "./actions";

export default async function AdminDashboard() {
  await requirePlatformAdmin();

  const stats = await getPlatformDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-gray-500">
          High-level system activity and risk monitoring
        </p>
      </div>

      <section className="grid grid-cols-4 gap-6">
        <KpiCard title="Organisations" value={stats.totals.organisations} />
        <KpiCard title="Users" value={stats.totals.users} />
        <KpiCard title="Active Listings" value={stats.totals.activeListings} />
        <KpiCard title="Open Incidents" value={stats.totals.openIncidents} />
      </section>

      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Marketplace Activity</h2>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <Stat
              label="Listings This Month"
              value={stats.marketplace.listingsThisMonth}
            />
            <Stat
              label="Bids This Month"
              value={stats.marketplace.bidsThisMonth}
            />
            <Stat
              label="Avg Bids / Listing"
              value={stats.marketplace.avgBidsPerListing.toFixed(2)}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Assignments</h2>
          <div className="space-y-2 text-sm">
            <StatusRow
              label="Pending"
              value={stats.marketplace.assignments.pending}
            />
            <StatusRow
              label="Accepted"
              value={stats.marketplace.assignments.accepted}
            />
            <StatusRow
              label="Completed"
              value={stats.marketplace.assignments.completed}
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">Risk & Compliance</h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <Stat label="Under Review" value={stats.risk.underReview} />
          <Stat label="Suspended Users" value={stats.risk.suspendedUsers} />
          <Stat label="Archived Listings" value={stats.risk.archivedListings} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">Reputation & Reviews</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <Stat
            label="Avg Rating"
            value={Number(stats.reviews.averageRating).toFixed(2)}
          />
          <Stat
            label="Reviews This Week"
            value={stats.reviews.reviewsThisWeek}
          />
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
