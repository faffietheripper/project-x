import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, supportTicketMessages, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReplyToTicketForm from "@/components/app/Support/ReplyToTicketForm";
import AdminTicketControls from "@/components/app/Support/AdminTicketControls";

export default async function AdminTicketThread({
  params,
}: {
  params: { ticketId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (dbUser?.role !== "platform_admin") {
    throw new Error("Access denied.");
  }

  const ticket = await database.query.supportTickets.findFirst({
    where: eq(supportTickets.id, params.ticketId),
    with: {
      organisation: true,
      assignedTo: true,
      createdBy: true,
    },
  });

  if (!ticket) return notFound();

  const messages = await database.query.supportTicketMessages.findMany({
    where: eq(supportTicketMessages.ticketId, ticket.id),
    with: {
      sender: true,
    },
    orderBy: asc(supportTicketMessages.createdAt),
  });

  return (
    <main className="p-12 space-y-8">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow border space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold capitalize">
              {ticket.category.replace("_", " ")} Ticket
            </h1>
            <div className="text-sm text-gray-500">
              Organisation: {ticket.organisation?.teamName}
            </div>
            <div className="text-xs text-gray-400">
              Created by {ticket.createdBy?.name}
            </div>
          </div>

          <div className="text-sm">
            Assigned to: {ticket.assignedTo?.name ?? "Unassigned"}
          </div>
        </div>

        {/* ADMIN CONTROLS */}
        <AdminTicketControls ticket={ticket} />
      </div>

      {/* THREAD */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl max-w-2xl ${
              msg.isInternalNote
                ? "bg-yellow-50 border border-yellow-200"
                : msg.senderUserId === dbUser.id
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-100"
            }`}
          >
            <div className="text-xs mb-2 opacity-80">
              {msg.isInternalNote ? "Internal Note" : msg.sender?.name}
            </div>

            <div className="text-sm whitespace-pre-wrap">{msg.message}</div>

            <div className="text-[10px] mt-2 opacity-60">
              {msg.createdAt?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== "closed" && (
        <ReplyToTicketForm ticketId={ticket.id} isPlatformAdmin={true} />
      )}
    </main>
  );
}
