import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: parse JSON payloads
  app.use(express.json());

  // API Route to send notification email using user SMTP settings
  app.post("/api/send-notification", async (req, res) => {
    try {
      const { type, data, emailSettings } = req.body;

      if (!emailSettings) {
        return res.status(400).json({ error: "Missing email settings" });
      }

      const { senderEmail, smtpPass, receiverEmail, enableNotifications } = emailSettings;

      if (!enableNotifications && type !== "test") {
        console.log("Notifications are disabled in settings");
        return res.json({ success: true, message: "Notifications are disabled" });
      }

      if (!senderEmail || !smtpPass || !receiverEmail) {
        return res.status(400).json({ error: "SMTP settings are incomplete" });
      }

      // Configure nodemailer transporter with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: senderEmail,
          pass: smtpPass
        }
      });

      let mailOptions;

      if (type === "contact") {
        mailOptions = {
          from: `"${data.name}" <${senderEmail}>`,
          to: receiverEmail,
          subject: `New Contact Message: ${data.subject}`,
          text: `You received a new contact message from your website:\n\n` +
                `Name: ${data.name}\n` +
                `Email: ${data.email}\n` +
                `Subject: ${data.subject}\n\n` +
                `Message:\n${data.message}\n\n` +
                `Sent on: ${new Date().toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc; color: #1e293b;">
              <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Contact Message Received</h2>
              <p>You received a new message from your website contact form:</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 100px; color: #64748b;">Name:</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Subject:</td>
                  <td style="padding: 8px 0;">${data.subject}</td>
                </tr>
              </table>
              <p style="font-weight: bold; margin-bottom: 8px; color: #64748b;">Message Content:</p>
              <div style="margin-top: 0; padding: 16px; border-left: 4px solid #4f46e5; background-color: #ffffff; border-radius: 0 8px 8px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">${data.message}</div>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 35px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">Sent securely from your portfolio system on ${new Date().toLocaleString()}</p>
            </div>
          `
        };
      } else if (type === "booking") {
        mailOptions = {
          from: `"${data.name}" <${senderEmail}>`,
          to: receiverEmail,
          subject: `New Meeting Booked: ${data.service}`,
          text: `You have a new meeting booked on your website:\n\n` +
                `Name: ${data.name}\n` +
                `Email: ${data.email}\n` +
                `Service Type: ${data.service}\n` +
                `Date: ${data.date}\n` +
                `Time Slot: ${data.time}\n` +
                `Meeting Type: ${data.meetingType || 'Virtual Call'}\n` +
                `Notes/Comments: ${data.notes || 'None'}\n\n` +
                `Sent on: ${new Date().toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc; color: #1e293b;">
              <h2 style="color: #06b6d4; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Consultation Recieved</h2>
              <p>A new client has scheduled an appointment on your meeting booking system:</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #64748b;">Client Name:</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Client Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #06b6d4; text-decoration: none;">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Requested Service:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">${data.service}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Meeting Format:</td>
                  <td style="padding: 8px 0;">${data.meetingType || 'Virtual Call'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #06b6d4;">Date:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #06b6d4;">Time Slot:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${data.time}</td>
                </tr>
              </table>
              ${data.notes ? `
                <p style="font-weight: bold; margin-bottom: 8px; color: #64748b;">Client's Notes:</p>
                <div style="padding: 16px; border-left: 4px solid #06b6d4; background-color: #ffffff; border-radius: 0 8px 8px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.5; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">${data.notes}</div>
              ` : ''}
              <p style="font-size: 11px; color: #94a3b8; margin-top: 35px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">Sent securely from your portfolio system on ${new Date().toLocaleString()}</p>
            </div>
          `
        };
      } else {
        return res.status(400).json({ error: "Invalid notification type" });
      }

      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent successfully for ${type}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: error.message || "Failed to send notification email" });
    }
  });

  // API Route to send dynamic reply email to a client/user using administrator SMTP settings
  app.post("/api/send-reply", async (req, res) => {
    try {
      const { type, recipientName, recipientEmail, subject, originalMessage, replyText, emailSettings } = req.body;

      if (!emailSettings) {
        return res.status(400).json({ error: "Missing SMTP configuration" });
      }

      const { senderEmail, smtpPass } = emailSettings;

      if (!senderEmail || !smtpPass) {
        return res.status(400).json({ error: "SMTP credentials are missing in your Admin settings" });
      }

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is undefined" });
      }

      // Configure nodemailer transporter with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: senderEmail,
          pass: smtpPass
        }
      });

      const emailSubject = `Re: ${subject || (type === "booking" ? "Your Consulting Appointment" : "Your Website Message")}`;

      const replyHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Area -->
          <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; display: block;">Message Reply From</span>
              <span style="font-size: 18px; font-weight: 800; color: #020617;">Robayed Hasan</span>
            </div>
            <div style="padding: 6px 12px; background-color: #f0fdfa; border-radius: 20px; font-size: 11px; font-weight: bold; color: #0f766e;">
              Live Correspond
            </div>
          </div>

          <!-- Greet & Reply Message -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 14px; font-weight: 600; color: #475569; margin-top: 0; margin-bottom: 12px;">Hello ${recipientName || 'there'},</p>
            <div style="font-size: 15px; line-height: 1.6; color: #0f172a; white-space: pre-wrap; font-weight: 500;">${replyText}</div>
          </div>

          <!-- Divider & Quoted Message -->
          <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 12px;">
              --- Original Message / Request Details ---
            </div>
            <div style="background-color: #f8fafc; border-left: 4px solid #cbd5e1; border-radius: 4px; padding: 14px 16px; font-size: 13px; line-height: 1.5; color: #475569; font-style: italic;">
              ${originalMessage ? originalMessage.replace(/\n/g, '<br/>') : 'No additional information.'}
            </div>
          </div>

          <!-- Footer Metadata -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">You received this response from Robayed Hasan's official client correspondence desk.</p>
            <p style="font-size: 11px; color: #cbd5e1; margin-top: 8px;">Automated using secure custom Gmail SMTP Integration.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"Robayed Hasan" <${senderEmail}>`,
        to: recipientEmail,
        replyTo: senderEmail,
        subject: emailSubject,
        text: `Hello ${recipientName || 'there'},\n\n${replyText}\n\n` +
              `----------------------------------------\n` +
              `Original Context:\n${originalMessage || ''}`,
        html: replyHtml
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email reply successfully dispatched to ${recipientEmail}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending reply email:", error);
      return res.status(500).json({ error: error.message || "Failed to dispatch email reply." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
