import { Resend } from "resend";

export async function sendRegEmail({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.MOBILE_INVITE_FROM_EMAIL ??
    process.env.INVOICE_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey || !from || !appUrl) {
    console.error("[MOBILE_INVITE_NOT_CONFIGURED]", {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
      hasAppUrl: Boolean(appUrl),
    });

    return {
      success: false,
      message: "Mobile invitation email is not configured.",
    };
  }

  const inviteLink = `${appUrl.replace(/\/$/, "")}/setup-account?token=${encodeURIComponent(token)}`;

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: "You're invited to Waste X Mobile",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Welcome to Waste X Mobile</h2>

          <p>Hello ${escapeHtml(name)},</p>

          <p>
            You've been invited to use Waste X Mobile for your assigned
            transport work.
          </p>

          <p>
            Use the button below to activate your account and create your
            password.
          </p>

          <p style="margin:28px 0">
            <a
              href="${inviteLink}"
              style="
                display:inline-block;
                background:#000;
                color:#f97316;
                padding:12px 20px;
                border-radius:12px;
                text-decoration:none;
                font-weight:700;
              "
            >
              Activate Waste X Mobile
            </a>
          </p>

          <p style="font-size:13px;color:#666">
            This invitation expires automatically. If you weren't expecting
            this invitation, you can ignore this email.
          </p>
        </div>
      `,
      text: [
        `Hello ${name},`,
        "",
        "You've been invited to use Waste X Mobile.",
        "",
        "Activate your account and create your password here:",
        inviteLink,
        "",
        "If you weren't expecting this invitation, you can ignore this email.",
      ].join("\n"),
    });

    if (error) {
      console.error("[MOBILE_INVITE_RESEND_ERROR]", error);

      return {
        success: false,
        message: "Failed to send invitation email.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[MOBILE_INVITE_RESEND_EXCEPTION]", error);

    return {
      success: false,
      message: "Failed to send invitation email.",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
