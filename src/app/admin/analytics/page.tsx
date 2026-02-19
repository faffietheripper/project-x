import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getPlatformAnalytics } from "./actions";
import Link from "next/link";

export default async function AdminAnalyticsPage() {
  await requirePlatformAdmin();

  const data = await getPlatformAnalytics();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-sm text-gray-500">
          Business intelligence & performance metrics
        </p>
      </div>

      {/* GROWTH */}
      <Section title="Growth">
        <Kpi label="Organisations" value={data.growth.organisations} />
        <Kpi label="Users" value={data.growth.users} />
        <LinkCard href="/admin/organisations" label="View Organisations" />
        <LinkCard href="/admin/users" label="View Users" />
      </Section>

      {/* MARKETPLACE */}
      <Section title="Marketplace">
        <Kpi label="Total Listings" value={data.marketplace.listings} />
        <Kpi label="Total Bids" value={data.marketplace.bids} />
        <Kpi
          label="Total Marketplace Value"
          value={`£${data.marketplace.totalValue}`}
        />
        <LinkCard href="/admin/listings" label="Listing Insights" />
      </Section>

      {/* LOGISTICS */}
      <Section title="Logistics">
        <Kpi label="Total Assignments" value={data.logistics.assignments} />
        <Kpi label="Completed Jobs" value={data.logistics.completed} />
        <LinkCard href="/admin/incidents" label="Operational Risk" />
      </Section>

      {/* TRUST */}
      <Section title="Trust & Reputation">
        <Kpi
          label="Average Rating"
          value={Number(data.trust.avgRating).toFixed(2)}
        />
        <LinkCard href="/admin/reviews" label="Review Monitoring" />
      </Section>

      {/* RISK */}
      <Section title="Risk">
        <Kpi label="Open Incidents" value={data.risk.openIncidents} />
        <LinkCard href="/admin/incidents" label="Incident Management" />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid grid-cols-4 gap-6">{children}</div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function LinkCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block p-4 border rounded hover:bg-gray-50 text-sm"
    >
      {label}
    </Link>
  );
}
