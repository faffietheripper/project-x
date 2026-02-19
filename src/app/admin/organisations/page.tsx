import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getAllOrganisations } from "./actions";
import Link from "next/link";

export default async function AdminOrganisationsPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requirePlatformAdmin();

  const search = searchParams?.search;
  const organisations = await getAllOrganisations(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organisations</h1>
        <p className="text-sm text-gray-500">
          Platform-wide organisation management
        </p>
      </div>

      {/* SEARCH */}
      <form className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="border px-4 py-2 rounded w-80 text-sm"
        />
        <button className="px-4 py-2 bg-black text-white rounded text-sm">
          Search
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <Th>Name</Th>
              <Th>Industry</Th>
              <Th>Email</Th>
              <Th>Members</Th>
              <Th>Listings</Th>
              <Th>Carrier Jobs</Th>
              <Th>Avg Rating</Th>
              <Th>Joined</Th>
            </tr>
          </thead>

          <tbody>
            {organisations.map((org) => (
              <tr key={org.id} className="border-t hover:bg-gray-50">
                <Td className="font-medium">
                  <Link
                    href={`/admin/organisations/${org.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {org.teamName}
                  </Link>
                </Td>
                <Td>{org.industry ?? "—"}</Td>
                <Td>{org.email}</Td>
                <Td>{org.memberCount}</Td>
                <Td>{org.listingsCount}</Td>
                <Td>{org.carrierJobsCount}</Td>
                <Td>
                  {org.avgRating ? Number(org.avgRating).toFixed(2) : "—"}
                </Td>
                <Td>{formatDate(org.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}
