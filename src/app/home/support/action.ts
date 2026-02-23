"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { supportTickets, supportTicketMessages, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTicketAction(_prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    return { success: false, message: "No organisation." };
  }

  const category = formData.get("category")?.toString();
  const priority = formData.get("priority")?.toString();
  const message = formData.get("message")?.toString();

  if (!category || !priority || !message) {
    return { success: false, message: "Missing fields." };
  }

  const [ticket] = await database
    .insert(supportTickets)
    .values({
      organisationId: dbUser.organisationId,
      createdByUserId: dbUser.id,
      category,
      priority,
      status: "open",
    })
    .returning();

  await database.insert(supportTicketMessages).values({
    ticketId: ticket.id,
    senderUserId: dbUser.id,
    message,
  });

  return { success: true, ticketId: ticket.id };
}
