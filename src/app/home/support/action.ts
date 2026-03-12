"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, supportTicketMessages, users } from "@/db/schema";
import { eq } from "drizzle-orm";

type TicketCategory =
  | "bug"
  | "billing"
  | "access"
  | "feature_request"
  | "compliance"
  | "other";

type TicketPriority = "low" | "medium" | "high" | "urgent";

export async function createTicketAction(_prevState: any, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser || !dbUser.organisationId) {
    return { success: false, message: "User organisation not found." };
  }

  const organisationId = dbUser.organisationId;

  const rawCategory = formData.get("category");
  const rawPriority = formData.get("priority");
  const rawMessage = formData.get("message");

  if (!rawCategory || !rawPriority || !rawMessage) {
    return { success: false, message: "Missing fields." };
  }

  const category = rawCategory.toString() as TicketCategory;
  const priority = rawPriority.toString() as TicketPriority;
  const message = rawMessage.toString();

  try {
    const ticket = await database.transaction(async (tx) => {
      const [newTicket] = await tx
        .insert(supportTickets)
        .values({
          organisationId,
          createdByUserId: dbUser.id,
          category,
          priority,
          status: "open",
        })
        .returning();

      await tx.insert(supportTicketMessages).values({
        organisationId,
        ticketId: newTicket.id,
        senderUserId: dbUser.id,
        message,
      });

      return newTicket;
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Ticket creation failed:", error);

    return {
      success: false,
      message: "Failed to create support ticket.",
    };
  }
}
