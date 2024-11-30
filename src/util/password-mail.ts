import mailgun from "mailgun.js";

const DOMAIN = "YOUR_MAILGUN_DOMAIN";
const mg = mailgun({
  apiKey: "YOUR_MAILGUN_API_KEY",
  domain: DOMAIN,
});

export async function sendResetEmail(email: string, token: string) {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
  const data = {
    from: "YourApp <no-reply@yourdomain.com>",
    to: email,
    subject: "Password Reset Request",
    text: `Click the link below to reset your password:\n\n${resetLink}`,
  };

  try {
    await mg.messages().send(data);
  } catch (error) {
    console.error("Mailgun error:", error);
    throw new Error("Failed to send email");
  }
}
