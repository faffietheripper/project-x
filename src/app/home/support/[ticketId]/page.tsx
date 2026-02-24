import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, supportTicketMessages, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReplyToTicketForm from "@/components/app/Support/ReplyToTicketForm";

export default async function TicketThreadPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get user
  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) throw new Error("No organisation");

  // Get ticket
  const ticket = await database.query.supportTickets.findFirst({
    where: eq(supportTickets.id, params.ticketId),
    with: {
      createdBy: true,
      assignedTo: true,
    },
  });

  if (!ticket) return notFound();

  // ORG-SCOPED PROTECTION
  if (ticket.organisationId !== dbUser.organisationId) {
    throw new Error("Access denied.");
  }

  // Get messages
  const messages = await database.query.supportTicketMessages.findMany({
    where: eq(supportTicketMessages.ticketId, ticket.id),
    with: {
      sender: true,
    },
    orderBy: asc(supportTicketMessages.createdAt),
  });

  const isPlatformAdmin = dbUser.role === "platform_admin";

  return (
    <div className="pl-[22vw] h-[calc(100vh-13vh)] pt-[13vh] flex flex-col bg-gray-50">
      {/* ===============================
        STICKY HEADER
    ================================ */}
      <div className="bg-white border-b shadow-sm px-10 py-6">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold capitalize">
              {ticket.category.replace("_", " ")} Ticket
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Created {ticket.createdAt?.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {/* ===============================
        SCROLLABLE MESSAGE AREA
    ================================ */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => {
            if (msg.isInternalNote && !isPlatformAdmin) return null;

            const isOwn = msg.senderUserId === dbUser.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm max-w-[70%] ${
                    msg.isInternalNote
                      ? "bg-yellow-50 border border-yellow-300 text-yellow-900"
                      : isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-white border shadow-sm"
                  }`}
                >
                  <div className="text-[11px] mb-1 opacity-70">
                    {msg.isInternalNote
                      ? "Internal Note (Admin)"
                      : msg.sender?.name}
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>

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
        <div className="border-t bg-white px-10 py-6">
          <div className="max-w-3xl mx-auto">
            <ReplyToTicketForm
              ticketId={ticket.id}
              isPlatformAdmin={isPlatformAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================
   BADGES
================================= */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    waiting_on_user: "bg-yellow-100 text-yellow-700",
    resolved: "bg-purple-100 text-purple-700",
    closed: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[priority] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {priority}
    </span>
  );
}
