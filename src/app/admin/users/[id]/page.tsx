import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getPlatformUserById } from "../actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePlatformAdmin();

  const user = await getPlatformUserById(params.id);

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4 text-sm">
        <DetailRow label="Organisation" value={user.organisationName ?? "—"} />
        <DetailRow label="Role" value={user.role} />
        <DetailRow
          label="Status"
          value={user.isSuspended ? "Suspended" : "Active"}
        />
        <DetailRow label="Listings Created" value={user.listingsCount} />
        <DetailRow label="Bids Placed" value={user.bidsCount} />
        <DetailRow label="Last Login" value={formatDate(user.lastLoginAt)} />
        <DetailRow label="Joined" value={formatDate(user.createdAt)} />
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
