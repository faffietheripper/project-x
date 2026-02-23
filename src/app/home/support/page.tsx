import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    return <div className="p-8">No organisation found.</div>;
  }

  const tickets = await database.query.supportTickets.findMany({
    where: eq(supportTickets.organisationId, dbUser.organisationId),
    orderBy: desc(supportTickets.createdAt),
  });

  return (
    <main className="pl-[22vw] pt-36 p-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Link
          href="/home/support/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + New Ticket
        </Link>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/home/support/${ticket.id}`}
            className="block bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <span className="font-semibold">{ticket.category}</span>
              <span className="text-sm capitalize">{ticket.status}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Created {ticket.createdAt?.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
