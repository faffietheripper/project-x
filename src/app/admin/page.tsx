import { requirePlatformAdmin } from "@/lib/adminGuard";

export default async function AdminDashboard() {
  await requirePlatformAdmin();

  return <div>Admin Dashboard</div>;
}
