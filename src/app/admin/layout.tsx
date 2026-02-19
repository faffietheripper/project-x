import Link from "next/link";
import { ReactNode } from "react";
import { signOut } from "@/auth";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-black text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">
          Waste X Admin
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/analytics">Analytics</AdminLink>
          <AdminLink href="/admin/users">Users</AdminLink>
          <AdminLink href="/admin/organisations">Organisations</AdminLink>
          <AdminLink href="/admin/incidents">Incidents</AdminLink>
          <AdminLink href="/admin/reviews">Reviews</AdminLink>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </form>

          <div className="text-xs text-gray-400">Waste Platform v1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded hover:bg-gray-800 transition"
    >
      {children}
    </Link>
  );
}
