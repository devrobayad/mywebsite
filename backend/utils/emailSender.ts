import nodemailer from 'nodemailer';
import { LocalDB } from '../database';

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
  replyTo
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  replyTo?: string;
}): Promise<boolean> {
  // Try to load settings from DB
  let senderEmail = '';
  let smtpPass = '';
  let receiverEmail = '';
  let enableNotifications = true;

  try {
    const settings = LocalDB.getEmailSettings();
    senderEmail = settings.senderEmail;
    smtpPass = settings.smtpPass;
    receiverEmail = settings.receiverEmail;
    enableNotifications = settings.enableNotifications;
  } catch (dbErr) {
    console.warn("Could not read email settings from DB, falling back to process.env:", dbErr);
  }

  // If DB was not configured or placeholder, we fall back to process.env variables
  if (!senderEmail || senderEmail === 'your_email@gmail.com') {
    senderEmail = process.env.EMAIL_USER || '';
  }
  if (!smtpPass || smtpPass === 'your_app_password') {
    smtpPass = process.env.EMAIL_PASS || '';
  }
  if (!receiverEmail || receiverEmail === 'your_email@gmail.com') {
    receiverEmail = process.env.EMAIL_USER || senderEmail || 'robayad.info@gmail.com';
  }

  console.log(`\n========================================`);
  console.log(`📧 OUTGOING EMAIL DISPATCH REQUEST`);
  console.log(`TO (Request): ${to}`);
  console.log(`SENDER:       ${senderEmail}`);
  console.log(`SUBJECT:      ${subject}`);
  console.log(`BODY SIZE:    ${html.length} chars`);
  console.log(`NOTIFICATIONS ENABLED: ${enableNotifications}`);
  console.log(`========================================\n`);

  if (!enableNotifications) {
    console.log(`ℹ️ Notifications are currently disabled in settings.`);
    return true;
  }

  // Check if credentials are missing or placeholder
  if (!senderEmail || !smtpPass || senderEmail.includes('your_email') || smtpPass.includes('your_app_password')) {
    console.log(`ℹ️ Email credentials are not configured. Placed in simulation mode successfully.`);
    return true;
  }

  // If the 'to' is 'adminEmail' or robayad.info@gmail.com, overwrite with the configured receiverEmail precisely!
  let finalTo = to;
  if (to === 'robayad.info@gmail.com' || to === 'adminEmail') {
    finalTo = receiverEmail;
    console.log(`🔄 Redirected admin notification to configured receiver: ${finalTo}`);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: `"devrobayad Service" <${senderEmail}>`,
      to: finalTo,
      subject,
      html,
      attachments,
      replyTo
    });

    console.log(`✔️ Email dispatched successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deliver email via Nodemailer:`, error);
    // Do not throw, keep executing gracefully so the client requests don't fail
    return false;
  }
}
