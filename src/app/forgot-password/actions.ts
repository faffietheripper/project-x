"use server";

import { database } from "@/db/database";
import { users, passwordResetTokens } from "@/db/schema";
import { sendResetEmail } from "@/util/password-mail";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { eq } from "drizzle-orm";

export async function submitForgotPassword(email: string) {
  if (!email) return { message: "Email is required" };

  // Find user by email
  const user = await database
    .select()
    .from(users)
    .where(users.email.eq(email))
    .limit(1);

  if (!user.length) {
    return { message: "If the email exists, a reset link will be sent" }; // Don't reveal user existence
  }

  const token = randomUUID();
  const expires = add(new Date(), { hours: 1 });

  // Save token in database
  await database.insert(passwordResetTokens).values({
    userId: user[0].id,
    token,
    expires,
  });

  // Send reset email
  try {
    await sendResetEmail(email, token);
    return { message: "A reset link has been sent to your email" };
  } catch (error) {
    console.error(error);
    return { message: "Error sending email, please try again" };
  }
}
