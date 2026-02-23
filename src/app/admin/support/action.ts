"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, supportTicketMessages, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function assignTicketAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (dbUser?.role !== "platform_admin") return;

  const ticketId = formData.get("ticketId")?.toString();
  if (!ticketId) return;

  await database
    .update(supportTickets)
    .set({
      assignedToUserId: dbUser.id,
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidatePath(`/home/admin/support/${ticketId}`);
}

export async function updateTicketStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (dbUser?.role !== "platform_admin") return;

  const ticketId = formData.get("ticketId")?.toString();
  const status = formData.get("status")?.toString();

  if (!ticketId || !status) return;

  await database
    .update(supportTickets)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidatePath(`/home/admin/support/${ticketId}`);
}

export async function replyToTicketAction(_prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser) {
    return { success: false, message: "User not found." };
  }

  const ticketId = formData.get("ticketId")?.toString();
  const message = formData.get("message")?.toString();
  const isInternalNote = formData.get("isInternalNote") === "true";

  if (!ticketId || !message) {
    return { success: false, message: "Missing required fields." };
  }

  const ticket = await database.query.supportTickets.findFirst({
    where: eq(supportTickets.id, ticketId),
  });

  if (!ticket) {
    return { success: false, message: "Ticket not found." };
  }

  const isPlatformAdmin = dbUser.role === "platform_admin";

  // 🔥 FIXED ORG PROTECTION
  if (!isPlatformAdmin && ticket.organisationId !== dbUser.organisationId) {
    return { success: false, message: "Access denied." };
  }

  // Prevent non-admin from internal notes
  if (isInternalNote && !isPlatformAdmin) {
    return { success: false, message: "Not allowed." };
  }

  await database.insert(supportTicketMessages).values({
    ticketId,
    senderUserId: dbUser.id,
    message,
    isInternalNote,
  });

  if (!isInternalNote) {
    await database
      .update(supportTickets)
      .set({
        status: isPlatformAdmin ? "waiting_on_user" : "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, ticketId));
  }

  // Revalidate both paths to be safe
  revalidatePath(`/home/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);

  return { success: true, message: "Reply sent." };
}
