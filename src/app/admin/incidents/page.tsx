import { getFilteredIncidents, getIncidentKpis } from "./actions";
import Filters from "./filters";

interface Props {
  searchParams: {
    status?: string;
    from?: string;
    to?: string;
    q?: string;
  };
}

export default async function AdminIncidentsPage({ searchParams }: Props) {
  const incidents = await getFilteredIncidents(searchParams);
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
                  {incident.createdAt?.toLocaleDateString()}
                </td>
                <td className="p-3">
                  {incident.reportedByOrganisation?.teamName}
                </td>
                <td className="p-3">#{incident.listingId}</td>
                <td className="p-3">{incident.type}</td>
                <td className="p-3">
                  <StatusBadge status={incident.status} />
                </td>
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
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="text-sm text-gray-500">{title}</div>
      <div
        className={`text-3xl font-bold mt-2 ${color} text-white px-3 py-1 inline-block rounded`}
      >
        {value}
      </div>
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
