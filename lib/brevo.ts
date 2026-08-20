import "server-only";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

// No-ops (logs and returns) when BREVO_API_KEY isn't configured yet,
// rather than throwing — retention emails are a nice-to-have layered on
// top of the in-app notification for the same event, never something
// that should break the action that triggered it.
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[brevo] Skipped (no BREVO_API_KEY): "${params.subject}" -> ${params.to}`);
    return;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "FarataNikah", email: "no-reply@faratanikah.com" },
        to: [{ email: params.to, name: params.toName }],
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });
    if (!response.ok) {
      console.error("Brevo email send failed:", await response.text());
    }
  } catch (error) {
    console.error("Brevo email send failed:", error);
  }
}
