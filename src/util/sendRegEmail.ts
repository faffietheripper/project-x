// utils/sendRegEmail.ts
"use client";

import emailjs from "@emailjs/browser";

export async function sendRegEmail({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const TEMPLATE_ID = "template_yxsn82b";
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  try {
    const templateParams = {
      to_email: email,
      user_name: name,
      user_email: email,
      user_password: password,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log("Registration email sent.");
      return { success: true };
    } else {
      throw new Error("Failed to send email.");
    }
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, message: "Failed to send registration email." };
  }
}
