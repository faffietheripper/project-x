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
    <main className="pl-[22vw] pt-36 p-12 space-y-8">
      {/* ===============================
          HEADER
      ================================ */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold capitalize">
              {ticket.category.replace("_", " ")} Ticket
            </h1>
            <p className="text-sm text-gray-500">
              Created {ticket.createdAt?.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {/* ===============================
          MESSAGE THREAD
      ================================ */}
      <div className="space-y-4">
        {messages.map((msg) => {
          // Hide internal notes from non-admin users
          if (msg.isInternalNote && !isPlatformAdmin) return null;

          const isOwnMessage = msg.senderUserId === dbUser.id;

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-xl max-w-2xl ${
                msg.isInternalNote
                  ? "bg-yellow-50 border border-yellow-200"
                  : isOwnMessage
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100"
              }`}
            >
              <div className="text-xs mb-2 opacity-80">
                {msg.isInternalNote
                  ? "Internal Note (Admin)"
                  : msg.sender?.name}
              </div>

              <div className="text-sm whitespace-pre-wrap">{msg.message}</div>

              <div className="text-[10px] mt-2 opacity-60">
                {msg.createdAt?.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===============================
          REPLY FORM
      ================================ */}
      {ticket.status !== "closed" && (
        <ReplyToTicketForm
          ticketId={ticket.id}
          isPlatformAdmin={isPlatformAdmin}
        />
      )}
    </main>
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
