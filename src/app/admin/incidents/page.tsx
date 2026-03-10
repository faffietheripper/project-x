import { getFilteredIncidents, getIncidentKpis } from "./actions";
import Filters from "./filters";

interface Props {
  searchParams?: {
    status?: string | string[];
    from?: string | string[];
    to?: string | string[];
    q?: string | string[];
  };
}

export default async function AdminIncidentsPage({ searchParams }: Props) {
  const filters = {
    status: Array.isArray(searchParams?.status)
      ? searchParams?.status[0]
      : searchParams?.status,
    from: Array.isArray(searchParams?.from)
      ? searchParams?.from[0]
      : searchParams?.from,
    to: Array.isArray(searchParams?.to)
      ? searchParams?.to[0]
      : searchParams?.to,
    q: Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q,
  };

  const incidents = await getFilteredIncidents(filters);
  const kpis = await getIncidentKpis();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Incident Monitoring</h1>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6">
        <KpiCard title="Open" value={kpis.open} color="bg-red-500" />
        <KpiCard
          title="Under Review"
          value={kpis.underReview}
          color="bg-yellow-500"
        />
        <KpiCard title="Resolved" value={kpis.resolved} color="bg-green-500" />
        <KpiCard title="Rejected" value={kpis.rejected} color="bg-gray-500" />
      </div>

      <Filters />

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Organisation</th>
              <th className="p-3">Listing</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-t">
                <td className="p-3">
                  {incident.createdAt
                    ? new Date(incident.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  {incident.reportedByOrganisation?.teamName ?? "-"}
                </td>

                <td className="p-3">#{incident.listingId}</td>

                <td className="p-3">{incident.type}</td>

                <td className="p-3">
                  <StatusBadge status={incident.status} />
                </td>

                <td className="p-3 text-gray-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <p className="text-sm text-gray-500">{title}</p>

      <p
        className={`text-2xl font-bold mt-2 ${
          color ? `${color} text-white px-2 py-1 rounded inline-block` : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-red-100 text-red-600",
    under_review: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-600",
    rejected: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
