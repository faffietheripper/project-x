import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getAllPlatformUsers, suspendUser, reactivateUser } from "./actions";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requirePlatformAdmin();

  const search = searchParams?.search;
  const users = await getAllPlatformUsers(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Users</h1>
        <p className="text-sm text-gray-500">
          Manage all users across organisations
        </p>
      </div>

      {/* SEARCH BAR */}
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

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Organisation</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Listings</Th>
              <Th>Bids</Th>
              <Th>Last Login</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <Td className="font-medium">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.name}
                  </Link>
                </Td>

                <Td>{user.email}</Td>
                <Td>{user.organisationName ?? "—"}</Td>
                <Td>{user.role}</Td>
                <Td>{renderStatus(user)}</Td>
                <Td>{user.listingsCount}</Td>
                <Td>{user.bidsCount}</Td>
                <Td>{formatDate(user.lastLoginAt)}</Td>

                <Td>
                  {user.isSuspended ? (
                    <form action={reactivateUser.bind(null, user.id)}>
                      <button className="text-green-600 hover:underline">
                        Reactivate
                      </button>
                    </form>
                  ) : (
                    <form action={suspendUser.bind(null, user.id)}>
                      <button className="text-red-600 hover:underline">
                        Suspend
                      </button>
                    </form>
                  )}
                </Td>
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

function renderStatus(user: { isActive: boolean; isSuspended: boolean }) {
  if (user.isSuspended) {
    return (
      <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
        Suspended
      </span>
    );
  }

  if (!user.isActive) {
    return (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
        Inactive
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
      Active
    </span>
  );
}
