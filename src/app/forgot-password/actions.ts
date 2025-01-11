"use server";

import { randomUUID } from "crypto";
import { add } from "date-fns";
import { database } from "@/db/database";
import { passwordResetTokens } from "@/db/schema";

export async function submitForgotPassword(formData: FormData) {
  const email = formData.get("email")?.toString();

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  const resetToken = randomUUID();
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  const tokenExpiration = add(new Date(), { hours: 1 });

  try {
    // Store the reset token in the database
    await database.insert(passwordResetTokens).values({
      email,
      token: resetToken,
      expires: tokenExpiration,
      used: false,
    });

    console.log("Token successfully stored in the database.");
    return {
      success: true,
      resetLink, // Pass the reset link back to the client
      message: "If the email exists, a reset link has been generated.",
    };
  } catch (error) {
    console.error("Error storing reset token:", error);

    return {
      success: false,
      message: "An error occurred while processing your request.",
    };
  }
}
