"use server";

import { randomUUID } from "crypto";
import { add } from "date-fns";
import { database } from "@/db/database";
import { passwordResetTokens } from "@/db/schema";
import { sendResetEmail } from "@/util/password-mail";

export async function submitForgotPassword(formData: FormData) {
  const email = formData.get("email")?.toString();

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  const resetToken = randomUUID();
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  const tokenExpiration = add(new Date(), { hours: 1 });

  console.log("time", tokenExpiration);

  try {
    // Store the reset token in the database
    await database.insert(passwordResetTokens).values({
      email,
      token: resetToken,
      expires: tokenExpiration,
      used: false,
    });

    console.log("Token successfully stored in the database.");

    // Send the reset email
    const emailResult = await sendResetEmail(email, resetLink);

    if (!emailResult.success) {
      console.error("Failed to send email.");
      return {
        success: true, // Token is already stored
        message:
          "Reset link generated, but there was an issue sending the email.",
      };
    }

    return {
      success: true,
      message: "If the email exists, a reset link has been sent.",
    };
  } catch (error) {
    console.error("Error handling forgot password:", error);

    return {
      success: false,
      message: "An error occurred while processing your request.",
    };
  }
}
