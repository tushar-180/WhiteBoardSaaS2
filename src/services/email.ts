import { Resend } from "resend";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  idempotencyKey?: string;
}

/**
 * A generic email service to send emails.
 * Currently uses Resend. Can be swapped with SendGrid, Mailgun, etc., in the future.
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      "[Email Service] No RESEND_API_KEY found. Skipping email send.",
    );
    return { success: false, error: "No API key configured." };
  }

  try {
    const resend = new Resend(apiKey);
    
    // We'll use a friendly sender name. Since it's dev/test, onboarding@resend.dev is allowed.
    // In production, users verify their custom domain.
    const fromEmail = options.from || "Acme <onboarding@resend.dev>";

    const payload = {
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    };

    const requestOptions = options.idempotencyKey
      ? { idempotencyKey: options.idempotencyKey }
      : undefined;

    const { data, error } = await resend.emails.send(payload, requestOptions);

    if (error) {
      console.error("[Email Service] Provider SDK error:", error.message);
      return { success: false, error: error.message };
    }

    console.log("[Email Service] Email successfully sent to", payload.to);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Email Service] Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Pre-configured template for sending workspace invitations.
 */
export async function sendWorkspaceInviteEmail(
  toEmail: string,
  workspaceName: string,
  role: string,
  inviteLink: string,
  inviterEmail: string,
  inviteId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #1a1a1a;">Workspace Invitation</h2>
      <p>Hello,</p>
      <p>You have been invited to join the <strong>${workspaceName}</strong> workspace on Zentrox as an <strong>${role}</strong>.</p>
      <p>Click the link below to accept the invitation and start collaborating:</p>
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
      </div>
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; font-size: 14px;"><a href="${inviteLink}">${inviteLink}</a></p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">This invitation was sent by ${inviterEmail}. If you did not expect this invitation, you can ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Join the "${workspaceName}" workspace on Zentrox`,
    html,
    idempotencyKey: `invite-${inviteId}`,
  });
}
