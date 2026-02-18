import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">
          Waste X Admin
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/users">Users</AdminLink>
          <AdminLink href="/admin/organisations">Organisations</AdminLink>
          <AdminLink href="/admin/incidents">Incidents</AdminLink>
          <AdminLink href="/admin/reviews">Reviews</AdminLink>
          <AdminLink href="/admin/analytics">Analytics</AdminLink>
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
          Waste Platform v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
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
