// ─── Email helper ────────────────────────────────────────────────────────────
// If SMTP_HOST is set, sends a real email. Otherwise, prints to console.
// Usage: await sendEmail({ to, subject, html });
// ─────────────────────────────────────────────────────────────────────────────
import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;

/**
 * @returns {boolean} True if SMTP is configured.
 */
export function isSmtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function getTransporter() {
  if (!transporter && isSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

/**
 * Send an email or print to console in dev if SMTP is not configured.
 * @param {{ to: string, subject: string, html: string }} opts
 */
export async function sendEmail({ to, subject, html }) {
  const transport = getTransporter();
  if (transport) {
    await transport.sendMail({ from: env.mailFrom, to, subject, html });
    console.log(`📧  Email sent to ${to}: "${subject}"`);
  } else {
    console.log('─'.repeat(60));
    console.log(`📧  [DEV] Email would be sent to: ${to}`);
    console.log(`    Subject: ${subject}`);
    console.log(`    Body (HTML):\n${html}`);
    console.log('─'.repeat(60));
  }
}

/**
 * Build the Brightloop-branded HTML email wrapper.
 */
export function emailTemplate(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#FBF6EC;">
  <div style="max-width:520px;margin:32px auto;background:#FFFDF8;border:1px solid #EADFCB;border-radius:16px;overflow:hidden;">
    <div style="background:#0E5A55;padding:24px 32px;">
      <h1 style="margin:0;color:#FFFDF8;font-size:20px;font-weight:700;">Brightloop</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#1E1B2E;font-size:18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #EADFCB;text-align:center;">
      <p style="margin:0;color:#6B667A;font-size:12px;">© ${new Date().getFullYear()} Brightloop Software. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
