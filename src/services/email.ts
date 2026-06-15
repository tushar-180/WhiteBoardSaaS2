import sgMail from "@sendgrid/mail";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  idempotencyKey?: string;
}

/**
 * A generic email service to send emails.
 * Currently uses SendGrid. Can be swapped with Mailgun, AWS SES, etc., in the future.
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.log(
      "[Email Service] No SENDGRID_API_KEY found. Skipping email send.",
    );
    return { success: false, error: "No API key configured." };
  }

  sgMail.setApiKey(apiKey);

  try {
    // SendGrid requires a verified sender identity.
    // Configure this in your .env.local file.
    const rawFrom = options.from || process.env.SENDGRID_FROM_EMAIL || "onboarding@yourdomain.com";
    
    let fromObj: string | { name: string; email: string } = rawFrom;
    
    // Parse "Name <email@domain.com>" format if present
    const cleanFrom = rawFrom.replace(/["']/g, "").trim();
    const match = cleanFrom.match(/^(.*?)\s*<(.+?)>$/);
    
    if (match) {
      fromObj = {
        name: match[1].trim(),
        email: match[2].trim(),
      };
    } else {
      fromObj = cleanFrom;
    }

    const msg = {
      to: options.to,
      from: fromObj,
      subject: options.subject,
      html: options.html,
    };

    console.log("----------------------------------------");
    console.log("[Email Service] Attempting to send email via SendGrid...");
    console.log("  FROM: ", JSON.stringify(msg.from));
    console.log("  TO:   ", JSON.stringify(msg.to));
    console.log("----------------------------------------");

    const response = await sgMail.send(msg);

    console.log("[Email Service] Email successfully sent to", options.to);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Email Service] Failed to send email via SendGrid:", error.message);
    if (error.response) {
      console.error("[Email Service] SendGrid Response Error:", error.response.body);
    }
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
      <div style="background-color: #09090b; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Zentrox</h1>
      </div>
      <div style="padding: 40px;">
        <h2 style="color: #09090b; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">You've been invited to collaborate!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
          Hello,
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
          You have been invited to join the <strong>${workspaceName}</strong> workspace on Zentrox as an <strong>${role}</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${inviteLink}" style="background-color: #09090b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0 0 8px 0;">
          If the button doesn't work, copy and paste this URL into your browser:
        </p>
        <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; word-break: break-all;">
          <a href="${inviteLink}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${inviteLink}</a>
        </div>
      </div>
      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0;">
          This invitation was sent by <strong>${inviterEmail}</strong>.<br>If you were not expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Join the "${workspaceName}" workspace on Zentrox`,
    html,
    idempotencyKey: `invite-${inviteId}`,
  });
}

