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
    <main className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      {/* ===============================
        STICKY HEADER
    ================================ */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm p-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold capitalize">
              {ticket.category.replace("_", " ")} Ticket
            </h1>
            <div className="text-xs text-gray-500">
              {ticket.organisation?.teamName} · Created by{" "}
              {ticket.createdBy?.name}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Assigned to: {ticket.assignedTo?.name ?? "Unassigned"}
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-4">
          <AdminTicketControls ticket={ticket} />
        </div>
      </div>

      {/* ===============================
        MESSAGE THREAD (SCROLLABLE)
    ================================ */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderUserId === dbUser.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[75%] ${
                    msg.isInternalNote
                      ? "bg-yellow-50 border border-yellow-300 text-yellow-900"
                      : isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                  }`}
                >
                  <div className="text-[11px] mb-1 opacity-70">
                    {msg.isInternalNote ? "Internal Note" : msg.sender?.name}
                  </div>

                  <div className="whitespace-pre-wrap">{msg.message}</div>

                  <div className="text-[10px] mt-2 opacity-60 text-right">
                    {msg.createdAt?.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===============================
        STICKY REPLY BOX
    ================================ */}
      {ticket.status !== "closed" && (
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="max-w-3xl mx-auto">
            <ReplyToTicketForm ticketId={ticket.id} isPlatformAdmin={true} />
          </div>
        </div>
      )}
    </main>
  );
}
