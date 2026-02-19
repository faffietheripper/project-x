import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getOrganisationById } from "../actions";

export default async function AdminOrganisationDetail({
  params,
}: {
  params: { id: string };
}) {
  await requirePlatformAdmin();

  const org = await getOrganisationById(params.id);

  if (!org) return <div>Organisation not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{org.teamName}</h1>
        <p className="text-sm text-gray-500">{org.industry}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4 text-sm">
        <DetailRow label="Email" value={org.email} />
        <DetailRow label="Telephone" value={org.telephone} />
        <DetailRow
          label="Address"
          value={`${org.streetAddress}, ${org.city}, ${org.region}, ${org.postCode}`}
        />
        <DetailRow label="Country" value={org.country} />
        <DetailRow label="Members" value={org.memberCount} />
        <DetailRow label="Listings" value={org.listingsCount} />
        <DetailRow label="Carrier Jobs" value={org.carrierJobsCount} />
        <DetailRow
          label="Average Rating"
          value={org.avgRating ? Number(org.avgRating).toFixed(2) : "—"}
        />
        <DetailRow label="Joined" value={formatDate(org.createdAt)} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}
