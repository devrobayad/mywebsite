import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { LocalDB } from '../database';
import { authMiddleware, AdminAuthRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { sendEmail } from '../utils/emailSender';
import { generateICSString } from '../utils/icsGenerator';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-devrobayad-jwt-key-2025';

// --- IN-MEMORY RATE LIMITER FOR LOGIN ---
const LOGIN_ATTEMPTS: Record<string, { count: number; lockUntil?: number }> = {};

function rateLimitLogin(req: Request, res: Response, next: () => void) {
  const ip = req.ip || 'global';
  const now = Date.now();
  const limit = LOGIN_ATTEMPTS[ip];

  if (limit && limit.lockUntil && limit.lockUntil > now) {
    const minsLeft = Math.ceil((limit.lockUntil - now) / 60000);
    res.status(429).json({ error: `Too many login attempts. Please try again in ${minsLeft} minutes.` });
    return;
  }

  next();
}

// Helper to record login failures
function recordLoginFailure(ip: string) {
  if (!LOGIN_ATTEMPTS[ip]) {
    LOGIN_ATTEMPTS[ip] = { count: 0 };
  }
  LOGIN_ATTEMPTS[ip].count += 1;
  if (LOGIN_ATTEMPTS[ip].count >= 5) {
    LOGIN_ATTEMPTS[ip].lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins block
  }
}

// Helper to clear login attempts on success
function clearLoginAttempts(ip: string) {
  delete LOGIN_ATTEMPTS[ip];
}

// ==========================================
// 🔓 PUBLIC PATHS
// ==========================================

// 1. GET Hero section
router.get('/hero', (req, res) => {
  res.json(LocalDB.getHero());
});

// 2. GET About section
router.get('/about', (req, res) => {
  res.json(LocalDB.getAbout());
});

// 3. GET Skills List (sorted by category)
router.get('/skills', (req, res) => {
  res.json(LocalDB.getSkills());
});

// 4. GET Projects List
router.get('/projects', (req, res) => {
  res.json(LocalDB.getProjects());
});

// 5. GET Social Links
router.get('/social', (req, res) => {
  res.json(LocalDB.getSocial());
});

// GET Footer Settings
router.get('/footer', (req, res) => {
  res.json(LocalDB.getFooter());
});

// GET Counters Link Section
router.get('/counters', (req, res) => {
  res.json(LocalDB.getCounters());
});

// 6. GET Pricing State (plans and FAQs)
router.get('/pricing', (req, res) => {
  res.json(LocalDB.getPricing());
});

// GET Services List
router.get('/services', (req, res) => {
  res.json(LocalDB.getServices());
});

// 7. GET Dynamic Free Availability slots on a given date /?date=YYYY-MM-DD
router.get('/availability', (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Missing date parameter. Format: YYYY-MM-DD' });
    return;
  }

  const settings = LocalDB.getAvailabilitySettings();
  const bookings = LocalDB.getBookings();
  const dayBookings = bookings.filter(b => b.date === date && b.status !== 'Cancelled');

  // --- CUSTOM DATES & TIMES CONFIG OVERRIDES ---
  if (settings.customSlots && settings.customSlots[date]) {
    const customTimes = settings.customSlots[date] || [];
    if (customTimes.length === 0) {
      res.json({ dayActive: false, slots: [], reason: 'No available slots designated for this date', services: settings.services });
      return;
    }
    // Filter out already booked slots
    const availableSlots = customTimes.filter(t => !dayBookings.some(b => b.time === t));
    res.json({
      dayActive: true,
      slots: availableSlots,
      services: settings.services,
      isCustomDate: true
    });
    return;
  }

  // 1. Check if date is blocked
  if (settings.blockedDates.includes(date)) {
    res.json({ dayActive: false, slots: [], reason: 'Date is blocked by admin', services: settings.services });
    return;
  }

  // 3. Check day of week
  // Carefully parse the YYYY-MM-DD string in UTC to avoid server-side timezone shifts (which can misalign days)
  const parts = date.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const dayName = utcDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase() as any;
  const dayConfig = settings.weeklySchedule[dayName];

  if (!dayConfig || !dayConfig.active) {
    res.json({ dayActive: false, slots: [], reason: 'Closed on this day of the week', services: settings.services });
    return;
  }

  // check maximum daily bookings
  if (dayBookings.length >= settings.maxBookingsPerDay) {
    res.json({ dayActive: false, slots: [], reason: 'Booking capacity reached for this day', services: settings.services });
    return;
  }

  const [startHour, startMin] = dayConfig.start.split(':').map(Number);
  const [endHour, endMin] = dayConfig.end.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  const duration = settings.slotDuration;
  const buffer = settings.bufferTime;
  const slotInterval = duration + buffer;

  const availableSlots: string[] = [];

  for (let mins = startTotalMinutes; mins + duration <= endTotalMinutes; mins += slotInterval) {
    const slotHour = Math.floor(mins / 60);
    const slotMin = mins % 60;
    const timeString = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;

    // Ensure slot not already taken on that date
    const isBooked = dayBookings.some(b => b.time === timeString);
    if (!isBooked) {
      availableSlots.push(timeString);
    }
  }

  res.json({
    dayActive: true,
    slots: availableSlots,
    services: settings.services
  });
});

// 8. POST Contact Form Messaging
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'All message fields (name, email, subject, message) are strictly required' });
    return;
  }

  const savedMessage = LocalDB.addMessage({ name, email, subject, message });

  // Dispatches notification emails asynchronously
  const brandName = "devrobayad";
  
  // Resolve target email precisely to user specified address
  const adminEmail = "robayed.info@gmail.com";

  // Email to Admin (Beautifully Styled layout)
  sendEmail({
    to: adminEmail,
    replyTo: email,
    subject: `🚨 New Inbox Message: ${subject} (from ${name})`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF; color: #1E293B; line-height: 1.6;">
        <!-- Header -->
        <div style="padding-bottom: 20px; border-bottom: 2px solid #7C3AED; margin-bottom: 25px;">
          <h2 style="color: #7C3AED; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">New Contact Form Message</h2>
          <p style="color: #64748B; margin: 5px 0 0 0; font-size: 13px;">Received from your devrobayad portfolio platform</p>
        </div>

        <!-- User Information Fields -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
          <tr style="background-color: #F8FAFC;">
            <th style="padding: 10px 15px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9; width: 120px;">Name</th>
            <td style="padding: 10px 15px; color: #1E293B; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${name}</td>
          </tr>
          <tr>
            <th style="padding: 10px 15px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9;">Email Address</th>
            <td style="padding: 10px 15px; color: #7C3AED; border-bottom: 1px solid #F1F5F9; font-weight: 500;"><a href="mailto:${email}" style="color: #7C3AED; text-decoration: none;">${email}</a></td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <th style="padding: 10px 15px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9;">Subject</th>
            <td style="padding: 10px 15px; color: #1E293B; border-bottom: 1px solid #F1F5F9; font-weight: 600;">${subject}</td>
          </tr>
        </table>

        <!-- Message Body -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #475569; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">Message Content</h3>
          <div style="padding: 20px; background: #F1F5F9; border-radius: 12px; border-left: 4px solid #7C3AED; color: #334155; font-size: 14px; white-space: pre-line; min-height: 100px;">
            ${message}
          </div>
        </div>

        <!-- Footer actions & metadata -->
        <div style="padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
          <p style="margin: 0;">This email was automatically triggered upon a secure contact form submission.</p>
          <p style="margin: 5px 0 0 0;"><strong>IP Address:</strong> ${req.ip || 'N/A'} • <strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  });

  // Autoback to Client
  sendEmail({
    to: email,
    subject: `Message Received! — ${brandName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">Thank You, ${name}!</h2>
        <p>I have successfully received your inquiry regarding <strong>"${subject}"</strong>.</p>
        <p>I typically review messages within 24 hours. Here is a summary of the transcript you entered:</p>
        <div style="padding: 15px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; color: #555;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 20px;">Looking forward to connecting with you!</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #888;">Sincerely,<br>Robayad Hasan Jam<br><a href="https://devrobayad.com">devrobayad.com</a></p>
      </div>
    `
  });

  res.json({ success: true, data: savedMessage });
});

// 9. POST Submit New Meeting Booking
router.post('/bookings', async (req, res) => {
  const { name, email, service, date, time, meetingType, notes } = req.body;

  if (!name || !email || !service || !date || !time || !meetingType) {
    res.status(400).json({ error: 'Required booking fields are missing!' });
    return;
  }

  // Double-check availability slot collisions on same timestamp
  const activeBookings = LocalDB.getBookings().filter(b => b.date === date && b.time === time && b.status !== 'Cancelled');
  if (activeBookings.length > 0) {
    res.status(409).json({ error: 'This specific time slot has just been reserved! Please select another slot.' });
    return;
  }

  const savedBooking = LocalDB.addBooking({ name, email, service, date, time, meetingType, notes });

  const meetLink = meetingType === 'Online' ? 'https://meet.google.com/abc-defg-hij' : 'N/A';
  
  // Create .ics calendar invitation file contents
  const calendarString = generateICSString({
    id: savedBooking.id,
    name,
    service,
    date,
    time,
    meetingType,
    notes
  });

  // Resolve target email precisely to user specified address
  const adminEmail = "robayed.info@gmail.com";

  // Dispatch Email to Admin with detailed styling
  sendEmail({
    to: adminEmail,
    replyTo: email,
    subject: `📅 New Booking Pending: ${service} on ${date}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF; color: #1E293B; line-height: 1.6;">
        <!-- Header -->
        <div style="padding-bottom: 20px; border-bottom: 2px solid #06B6D4; margin-bottom: 25px;">
          <h2 style="color: #06B6D4; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">New Meeting Booking Pending</h2>
          <p style="color: #64748B; margin: 5px 0 0 0; font-size: 13px;">A new consultation request has been reserved on your devrobayad calendar</p>
        </div>

        <!-- Detailed Reservation Cards -->
        <div style="background-color: #F8FAFC; border: 1px solid #EDF2F7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 0.5px;">Reservation Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7; width: 140px;">Client Name</th>
              <td style="padding: 8px 0; color: #1E293B; border-bottom: 1px solid #EDF2F7; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7;">Client Email</th>
              <td style="padding: 8px 0; color: #06B6D4; border-bottom: 1px solid #EDF2F7; font-weight: 500;"><a href="mailto:${email}" style="color: #06B6D4; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7;">Requested Service</th>
              <td style="padding: 8px 0; color: #1E293B; border-bottom: 1px solid #EDF2F7; font-weight: 600;">${service}</td>
            </tr>
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7;">Meeting Date</th>
              <td style="padding: 8px 0; color: #1E293B; border-bottom: 1px solid #EDF2F7; font-weight: 600; font-family: monospace;">${date}</td>
            </tr>
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7;">Selected Time</th>
              <td style="padding: 8px 0; color: #1E293B; border-bottom: 1px solid #EDF2F7; font-weight: 600; font-family: monospace;">${time} (45 mins duration)</td>
            </tr>
            <tr>
              <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #EDF2F7;">Meeting Format</th>
              <td style="padding: 8px 0; color: #1E293B; border-bottom: 1px solid #EDF2F7; font-weight: 500;">${meetingType} (${meetingType === 'Online' ? 'Google Meet' : 'In-Person'})</td>
            </tr>
          </table>
        </div>

        <!-- Custom Notes (if provided by client) -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #475569; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">Client Notes</h3>
          <div style="padding: 15px; background: #F8FAFC; border-radius: 8px; border-left: 4px solid #06B6D4; color: #475569; font-size: 14px; italic;">
            ${notes || "No notes provided by client."}
          </div>
        </div>

        <!-- Next Steps -->
        <div style="padding: 15px; background-color: #ECFDF5; border: 1px dashed #A7F3D0; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 13px; color: #065F46; font-weight: 500;">
            👉 Action item: Head to your <strong>Admin Panel</strong> under the <strong>Bookings</strong> view to Confirm or Decline this invitation.
          </p>
        </div>

        <!-- Footer Actions and Calendar Attachments -->
        <div style="padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
          <p style="margin: 0;">An ics calendar invite item has been compiled and attached automatically.</p>
          <p style="margin: 5px 0 0 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'meeting-invite.ics',
        content: calendarString,
        contentType: 'text/calendar'
      }
    ]
  });

  // Confirmation email to Client
  sendEmail({
    to: email,
    subject: `Meeting Booking Requested! — devrobayad`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #06B6D4; border-bottom: 2px solid #06B6D4; padding-bottom: 10px;">Booking Pending Confirmation</h2>
        <p>Hi ${name}, Your meeting booking has been successfully logged and is currently <strong>Pending Confirmation</strong>.</p>
        <p>Here are your meeting reservation details:</p>
        <table style="width: 100%; font-size: 14px; text-align: left; border-collapse: collapse;">
          <tr style="background-color: #f9f9f9;"><th style="padding: 8px;">Service:</th><td style="padding: 8px;">${service}</td></tr>
          <tr><th style="padding: 8px;">Date:</th><td style="padding: 8px;">${date}</td></tr>
          <tr style="background-color: #f9f9f9;"><th style="padding: 8px;">Time:</th><td style="padding: 8px;">${time} (45 mins)</td></tr>
          <tr><th style="padding: 8px;">Meeting Type:</th><td style="padding: 8px;">${meetingType}</td></tr>
          ${meetingType === 'Online' ? `<tr style="background-color: #f9f9f9;"><th style="padding: 8px;">Google Meet Link:</th><td style="padding: 8px;"><a href="${meetLink}" target="_blank">${meetLink}</a></td></tr>` : ''}
        </table>
        <p style="margin-top: 15px; font-weight: bold; color: #7C3AED;">An attachment (.ics invite) has been included so you can add this slot directly to your preferred calendar app.</p>
        <p>I will confirm this slot shortly!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 11px; color: #888;">Greetings,<br>Robayad Hasan Jam<br><a href="https://devrobayad.com">devrobayad.com</a></p>
      </div>
    `,
    attachments: [
      {
        filename: 'booking-reminder.ics',
        content: calendarString,
        contentType: 'text/calendar'
      }
    ]
  });

  res.json({ success: true, data: savedBooking });
});

// 10. GET ICS Calendar download endpoint on Client confirmed screen
router.get('/bookings/:id/calendar', (req, res) => {
  const { id } = req.params;
  const bookings = LocalDB.getBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    res.status(404).send('Booking details not found');
    return;
  }

  const cal = generateICSString({
    id: booking.id,
    name: booking.name,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    meetingType: booking.meetingType,
    notes: booking.notes
  });

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="devrobayad-meeting-${booking.id}.ics"`);
  res.send(cal);
});


// ==========================================
// 🔑 ADMIN LOGIN
// ==========================================

router.post('/admin/login', rateLimitLogin, (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || 'global';

  if (!username || !password) {
    res.status(400).json({ error: 'Username and Password are required fields' });
    return;
  }

  const admin = LocalDB.getAdminUser();

  // Validate credentials
  const validUser = username === admin.username;
  const validPass = bcrypt.compareSync(password, admin.passwordHash);

  if (!validUser || !validPass) {
    recordLoginFailure(ip);
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  clearLoginAttempts(ip);

  // Generate bearer JWT token valid for 2 hours
  const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '2h' });

  res.json({ token, username: admin.username });
});

router.get('/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ valid: false });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, admin: (decoded as any).username });
  } catch {
    res.json({ valid: false });
  }
});


// ==========================================
// 🔐 SECURED ADMIN PATHS (JWT Required)
// ==========================================

// 0. UPDATE Admin Credentials
router.put('/admin/credentials', authMiddleware, (req: AdminAuthRequest, res) => {
  const { username, password } = req.body;
  if (!username || !username.trim()) {
    res.status(400).json({ error: 'Username is required and cannot be empty.' });
    return;
  }
  LocalDB.updateAdminCredentials(username, password);
  res.json({ success: true, message: 'Admin username and/or password updated successfully' });
});

// 1. UPDATE Hero Text
router.put('/hero', authMiddleware, (req: AdminAuthRequest, res) => {
  const { heading, typewriterTexts, heroPhotoUrl, heroPhotoWidth, heroPhotoHeight, heroPhotoFrame, heroPhotoBorderRadius, heroPhotoFullWidth } = req.body;
  if (!heading || !Array.isArray(typewriterTexts)) {
    res.status(400).json({ error: 'Heading and typewriterTexts array is required' });
    return;
  }
  LocalDB.updateHero({ 
    heading, 
    typewriterTexts,
    heroPhotoUrl,
    heroPhotoWidth,
    heroPhotoHeight,
    heroPhotoFrame,
    heroPhotoBorderRadius,
    heroPhotoFullWidth
  });
  res.json({ success: true, hero: LocalDB.getHero() });
});

// 2. UPDATE About details
router.put('/about', authMiddleware, (req: AdminAuthRequest, res) => {
  const { bio, highlightCards, bioPhoto, bioPhotoWidth, bioPhotoHeight, bioPhotoFrame, bioPhotoBorderRadius, bioPhotoFullWidth } = req.body;
  if (!bio || !Array.isArray(highlightCards)) {
    res.status(400).json({ error: 'Bio and highlightCards array are required' });
    return;
  }
  LocalDB.updateAbout({ 
    bio, 
    highlightCards,
    bioPhoto,
    bioPhotoWidth,
    bioPhotoHeight,
    bioPhotoFrame,
    bioPhotoBorderRadius,
    bioPhotoFullWidth
  });
  res.json({ success: true, about: LocalDB.getAbout() });
});

// 3. SKILLS Management
router.post('/skills', authMiddleware, (req: AdminAuthRequest, res) => {
  const { name, category, icon } = req.body;
  if (!name || !category || !icon) {
    res.status(400).json({ error: 'Missing properties. Need name, category, and icon' });
    return;
  }
  const created = LocalDB.addSkill({ name, category, icon });
  res.status(201).json({ success: true, skill: created });
});

router.put('/skills/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const updated = LocalDB.updateSkill(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  res.json({ success: true, skill: updated });
});

router.delete('/skills/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const deleted = LocalDB.deleteSkill(id);
  if (!deleted) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  res.json({ success: true, message: 'Skill deleted successfully' });
});

// 4. PROJECTS Management
router.post('/projects', authMiddleware, (req: AdminAuthRequest, res) => {
  const { title, desc, techTags, thumbnail, liveUrl, githubUrl, status } = req.body;
  if (!title || !desc || !Array.isArray(techTags) || !status) {
    res.status(400).json({ error: 'Required fields missing: title, desc, techTags, and status are needed' });
    return;
  }
  const created = LocalDB.addProject({
    title,
    desc,
    techTags,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    liveUrl,
    githubUrl,
    status
  });
  res.status(201).json({ success: true, project: created });
});

router.put('/projects/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const updated = LocalDB.updateProject(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ success: true, project: updated });
});

router.delete('/projects/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const deleted = LocalDB.deleteProject(id);
  if (!deleted) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ success: true, message: 'Project deleted successfully' });
});

// 5. UPDATE Social Links
router.put('/social', authMiddleware, (req: AdminAuthRequest, res) => {
  const { github, linkedin, facebook, email, customChannels, phone, address, contactItems } = req.body;
  LocalDB.updateSocial({ github, linkedin, facebook, email, customChannels, phone, address, contactItems });
  res.json({ success: true, social: LocalDB.getSocial() });
});

// UPDATE Footer Settings
router.put('/footer', authMiddleware, (req: AdminAuthRequest, res) => {
  const { logoText, copyrightText, developerText, developerUrlLabel, developerUrl, headerLogoImg, footerLogoImg, siteTitle, siteFavicon, customLinks, cursorStyle } = req.body;
  if (!logoText || !copyrightText || !developerText || !developerUrlLabel || !developerUrl) {
    res.status(400).json({ error: 'All footer fields are required' });
    return;
  }
  LocalDB.updateFooter({ 
    logoText, 
    copyrightText, 
    developerText, 
    developerUrlLabel, 
    developerUrl,
    headerLogoImg: headerLogoImg !== undefined ? headerLogoImg : (LocalDB.getFooter().headerLogoImg || ""),
    footerLogoImg: footerLogoImg !== undefined ? footerLogoImg : (LocalDB.getFooter().footerLogoImg || ""),
    siteTitle: siteTitle !== undefined ? siteTitle : (LocalDB.getFooter().siteTitle || "Robayad Hasan Jam - Portfolio"),
    siteFavicon: siteFavicon !== undefined ? siteFavicon : (LocalDB.getFooter().siteFavicon || ""),
    customLinks: customLinks !== undefined ? customLinks : (LocalDB.getFooter().customLinks || []),
    cursorStyle: cursorStyle !== undefined ? cursorStyle : (LocalDB.getFooter().cursorStyle || "system")
  });
  res.json({ success: true, footer: LocalDB.getFooter() });
});

// UPDATE Counters Settings
router.put('/counters', authMiddleware, (req: AdminAuthRequest, res) => {
  const { counters } = req.body;
  if (!Array.isArray(counters)) {
    res.status(400).json({ error: 'Counters list is required and must be an array' });
    return;
  }
  LocalDB.updateCounters(counters);
  res.json({ success: true, counters: LocalDB.getCounters() });
});

// 6. MESSAGES Inbox Management
router.get('/messages', authMiddleware, (req: AdminAuthRequest, res) => {
  res.json(LocalDB.getMessages());
});

router.put('/messages/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { read } = req.body;
  const updated = LocalDB.markMessageRead(id, read === true);
  if (!updated) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  res.json({ success: true, message: updated });
});

router.post('/messages/:id/reply', authMiddleware, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  
  if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
    res.status(400).json({ error: 'Reply text cannot be empty.' });
    return;
  }

  const messageObj = LocalDB.getMessages().find(m => m.id === id);
  if (!messageObj) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }

  const updated = LocalDB.saveMessageReply(id, reply);
  if (!updated) {
    res.status(400).json({ error: 'Failed to save reply in DB.' });
    return;
  }

  const sent = await sendEmail({
    to: messageObj.email,
    subject: `Re: ${messageObj.subject} — Portfolio Reply`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #7C3AED; border-radius: 16px; background-color: #FFFFFF; color: #1E293B; line-height: 1.6;">
        <div style="padding-bottom: 15px; border-bottom: 2px solid #7C3AED; margin-bottom: 20px;">
          <h2 style="color: #7C3AED; margin: 0; font-size: 20px; font-weight: 700;">Reply to your message — devrobayad</h2>
        </div>
        <p style="font-size: 14px;">Hello <strong>${messageObj.name}</strong>,</p>
        <p style="font-size: 14px;">Thank you for writing via the portfolio contact form. Here is my reply to your message:</p>
        
        <div style="background-color: #F8FAFC; border-left: 4px solid #7C3AED; border-radius: 4px; padding: 15px; margin: 20px 0; font-size: 14px; white-space: pre-wrap; color: #0F172A; font-weight: 500;">
          ${reply}
        </div>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">
        <div style="background-color: #F1F5F9; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569;">
          <strong>Your Original message:</strong><br>
          <em style="white-space: pre-line;">"${messageObj.message}"</em>
        </div>

        <p style="font-size: 13px; color: #64748B; margin-top:25px;">
          Best regards,<br>
          <strong>Robayad Hasan Jam</strong><br>
          <a href="https://devrobayad.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">devrobayad.com</a>
        </p>
      </div>
    `
  });

  res.json({ success: true, message: updated, emailSent: sent });
});

router.delete('/messages/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const deleted = LocalDB.deleteMessage(id);
  if (!deleted) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  res.json({ success: true, message: 'Message deleted successfully' });
});

// 7. PRICING plans FAQ update
router.put('/pricing', authMiddleware, (req: AdminAuthRequest, res) => {
  const { plans, annualEnabled, faq } = req.body;
  if (!Array.isArray(plans) || !Array.isArray(faq)) {
    res.status(400).json({ error: 'Plans and FAQs must be array elements' });
    return;
  }
  LocalDB.updatePricing({ plans, annualEnabled: annualEnabled === true, faq });
  res.json({ success: true, pricing: LocalDB.getPricing() });
});

// SERVICES Content Update
router.put('/services', authMiddleware, (req: AdminAuthRequest, res) => {
  const services = req.body;
  if (!Array.isArray(services)) {
    res.status(400).json({ error: 'Services must be array elements' });
    return;
  }
  LocalDB.updateServices(services);
  res.json({ success: true, services: LocalDB.getServices() });
});

// 8. BOOKINGS Management
router.get('/bookings', authMiddleware, (req: AdminAuthRequest, res) => {
  const { status, search } = req.query;
  let bookings = LocalDB.getBookings();

  if (status && typeof status === 'string') {
    bookings = bookings.filter(b => b.status === status);
  }

  if (search && typeof search === 'string') {
    const sq = search.toLowerCase();
    bookings = bookings.filter(b =>
      b.name.toLowerCase().includes(sq) ||
      b.email.toLowerCase().includes(sq) ||
      b.service.toLowerCase().includes(sq)
    );
  }

  res.json(bookings);
});

// Action confirms or cancels, triggers template emails
router.put('/bookings/:id', authMiddleware, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
    res.status(400).json({ error: 'Invalid or missing booking status' });
    return;
  }

  const updated = LocalDB.updateBookingStatus(id, status);
  if (!updated) {
    res.status(404).json({ error: 'Booking details not found' });
    return;
  }

  // Generate ICS to attach also in confirm states
  const calStr = generateICSString({
    id: updated.id,
    name: updated.name,
    service: updated.service,
    date: updated.date,
    time: updated.time,
    meetingType: updated.meetingType,
    notes: updated.notes
  });

  // Sends emails on status change
  if (status === 'Confirmed') {
    const meetText = updated.meetingType === 'Online'
      ? `<p><strong>Google Meet Private URL:</strong> <a href="https://meet.google.com/abc-defg-hij">https://meet.google.com/abc-defg-hij</a></p>`
      : '';

    sendEmail({
      to: updated.email,
      subject: `🎉 Booking Confirmed: ${updated.service}! — devrobayad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7C3AED; border-radius: 8px;">
          <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">Meeting Confirmed!</h2>
          <p>Hi ${updated.name},</p>
          <p>I have confirmed your consultation booking for <strong>"${updated.service}"</strong>.</p>
          <div style="background-color: #f7f5ff; padding: 15px; border-radius: 5px; border-left: 4px solid #7C3AED;">
            <p style="margin: 4px 0;"><strong>Date:</strong> ${updated.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${updated.time} (45 mins)</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${updated.meetingType}</p>
            ${meetText}
          </div>
          <p style="margin-top: 15px;">Your digital calendar event format (.ics item) is attached. See you then!</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #888;">Greetings,<br>Robayad Hasan Jam<br><a href="https://devrobayad.com">devrobayad.com</a></p>
        </div>
      `,
      attachments: [
        {
          filename: 'confirmed-meeting.ics',
          content: calStr,
          contentType: 'text/calendar'
        }
      ]
    });
  } else if (status === 'Cancelled') {
    sendEmail({
      to: updated.email,
      subject: `⚠️ Booking Cancellation Note — devrobayad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Booking Cancelled</h2>
          <p>Hi ${updated.name},</p>
          <p>We regret to inform you that your booking for <strong>"${updated.service}"</strong> on <strong>${updated.date} at ${updated.time}</strong> has been cancelled due to scheduling conflicts.</p>
          <p>Kindly head back to <a href="https://devrobayad.com/contact">devrobayad.com/contact</a> to reserve another working hour window.</p>
          <p>Apologies for the inconvenience.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #888;">Greetings,<br>Robayad Hasan Jam<br><a href="https://devrobayad.com">devrobayad.com</a></p>
        </div>
      `
    });
  }

  res.json({ success: true, booking: updated });
});

router.post('/bookings/:id/reply', authMiddleware, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
    res.status(400).json({ error: 'Reply text cannot be empty.' });
    return;
  }

  const bookingObj = LocalDB.getBookings().find(b => b.id === id);
  if (!bookingObj) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const updated = LocalDB.saveBookingReply(id, reply);
  if (!updated) {
    res.status(400).json({ error: 'Failed to save booking reply in DB.' });
    return;
  }

  const sent = await sendEmail({
    to: bookingObj.email,
    subject: `Update regarding your scheduled booking: ${bookingObj.service} — devrobayad`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #06B6D4; border-radius: 16px; background-color: #FFFFFF; color: #1E293B; line-height: 1.6;">
        <div style="padding-bottom: 15px; border-bottom: 2px solid #06B6D4; margin-bottom: 20px;">
          <h2 style="color: #06B6D4; margin: 0; font-size: 20px; font-weight: 700;">Booking Update Notification</h2>
        </div>
        <p style="font-size: 14px;">Hello <strong>${bookingObj.name}</strong>,</p>
        <p style="font-size: 14px;">This is Robayad Hasan Jam. Regarding your upcoming reservation slot for <strong>${bookingObj.service}</strong> on <strong>${bookingObj.date} at ${bookingObj.time}</strong>, I have written back with some updates:</p>
        
        <div style="background-color: #F8FAFC; border-left: 4px solid #06B6D4; border-radius: 4px; padding: 15px; margin: 20px 0; font-size: 14px; white-space: pre-wrap; color: #0F172A; font-weight: 500;">
          ${reply}
        </div>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">
        <div style="background-color: #F1F5F9; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569;">
          <strong>Reservation Details:</strong><br>
          • <strong>Service requested:</strong> ${bookingObj.service}<br>
          • <strong>Schedule date:</strong> ${bookingObj.date} at ${bookingObj.time}<br>
          • <strong>Current Status:</strong> <strong style="color: #0369A1;">${bookingObj.status}</strong> (${bookingObj.meetingType})
        </div>

        <p style="font-size: 13px; color: #64748B; margin-top:25px;">
          Best regards,<br>
          <strong>Robayad Hasan Jam</strong><br>
          <a href="https://devrobayad.com" style="color: #06B6D4; text-decoration: none; font-weight: 600;">devrobayad.com</a>
        </p>
      </div>
    `
  });

  res.json({ success: true, booking: updated, emailSent: sent });
});

router.delete('/bookings/:id', authMiddleware, (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const deleted = LocalDB.deleteBooking(id);
  if (!deleted) {
    res.status(404).json({ error: 'Booking details not found' });
    return;
  }
  res.json({ success: true, message: 'Booking deleted successfully' });
});

// 9. AVAILABILITY Settings Management
router.get('/availability/settings', authMiddleware, (req: AdminAuthRequest, res) => {
  res.json(LocalDB.getAvailabilitySettings());
});

router.put('/availability/settings', authMiddleware, (req: AdminAuthRequest, res) => {
  LocalDB.updateAvailabilitySettings(req.body);
  res.json({ success: true, settings: LocalDB.getAvailabilitySettings() });
});

// 9.5. EMAIL Notification Settings Management
router.get('/email-settings', authMiddleware, (req: AdminAuthRequest, res) => {
  res.json(LocalDB.getEmailSettings());
});

router.put('/email-settings', authMiddleware, (req: AdminAuthRequest, res) => {
  LocalDB.updateEmailSettings(req.body);
  res.json({ success: true, settings: LocalDB.getEmailSettings() });
});

router.post('/email-settings/test', authMiddleware, async (req: AdminAuthRequest, res) => {
  const { senderEmail, smtpPass, receiverEmail } = req.body;
  if (!senderEmail || !smtpPass || !receiverEmail) {
    res.status(400).json({ error: 'Sender email, app password, and receiver email list are all strictly required for test dispatch.' });
    return;
  }
  
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: smtpPass
      }
    });
    
    await transporter.sendMail({
      from: `"devrobayad Test" <${senderEmail}>`,
      to: receiverEmail,
      subject: `🧪 Test Email Connection: Success!`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #7C3AED; border-radius: 12px; max-width: 500px; margin: 0 auto; background: #FAF5FF; color: #5B21B6; line-height: 1.5;">
          <h2 style="margin-top: 0; color: #7C3AED; font-size: 20px;">Connection Successful! 🎉</h2>
          <p>Your website is now successfully integrated with your Gmail SMTP service.</p>
          <p>From now on, user messages and calendar bookings will automatically send notifications here.</p>
          <hr style="border: none; border-top: 1px solid #E9D5FF; margin: 20px 0;">
          <p style="font-size: 11px; color: #7F9CF5; margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    res.json({ success: true, message: `Test email dispatched to ${receiverEmail}` });
  } catch (error: any) {
    console.error(`❌ Test email failed:`, error);
    res.status(500).json({ error: `Connection failed: ${error.message || error}` });
  }
});



// 10. FILE UPLOADS: Profile Pic & CV Document uploads (max 5MB)
// profile-photo
router.put('/profile-photo', authMiddleware, uploadMiddleware.single('profilePhoto'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid image file. Allowed: JPG, PNG.' });
    return;
  }

  // Compute public path access relative to servers
  const publicPath = `/uploads/profile/${req.file.filename}`;
  
  // Actually update our Bio image in database
  const about = LocalDB.getAbout();
  const updatedAbout = {
    ...about,
    // Add file link dynamically inside database
    bioPhoto: publicPath
  };
  LocalDB.updateAbout(updatedAbout as any);

  res.json({ success: true, filePath: publicPath });
});

// hero-photo
router.put('/hero-photo', authMiddleware, uploadMiddleware.single('heroPhoto'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid image file. Allowed: JPG, PNG, JPEG.' });
    return;
  }

  const publicPath = `/uploads/profile/${req.file.filename}`;
  
  const hero = LocalDB.getHero();
  const updatedHero = {
    ...hero,
    heroPhotoUrl: publicPath
  };
  LocalDB.updateHero(updatedHero);

  res.json({ success: true, filePath: publicPath });
});

// resume/cv upload
router.put('/cv', authMiddleware, uploadMiddleware.single('cv'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid PDF file for the CV.' });
    return;
  }

  const publicPath = `/uploads/cv/${req.file.filename}`;
  
  // Store cvPath inside social or general profile DB structures
  const social = LocalDB.getSocial();
  const cvSocial = {
    ...social,
    cvPath: publicPath
  };
  LocalDB.updateSocial(cvSocial as any);

  res.json({ success: true, filePath: publicPath });
});

// header-logo upload
router.put('/header-logo', authMiddleware, uploadMiddleware.single('headerLogo'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid image file. Allowed: JPG, PNG, JPEG.' });
    return;
  }
  const publicPath = `/uploads/logos/${req.file.filename}`;
  const footer = LocalDB.getFooter();
  footer.headerLogoImg = publicPath;
  LocalDB.updateFooter(footer);
  res.json({ success: true, filePath: publicPath, footer });
});

// footer-logo upload
router.put('/footer-logo', authMiddleware, uploadMiddleware.single('footerLogo'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid image file. Allowed: JPG, PNG, JPEG.' });
    return;
  }
  const publicPath = `/uploads/logos/${req.file.filename}`;
  const footer = LocalDB.getFooter();
  footer.footerLogoImg = publicPath;
  LocalDB.updateFooter(footer);
  res.json({ success: true, filePath: publicPath, footer });
});

// favicon upload
router.put('/favicon', authMiddleware, uploadMiddleware.single('favicon'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid favicon file. Allowed: JPG, PNG, JPEG, ICO, SVG.' });
    return;
  }
  const publicPath = `/uploads/logos/${req.file.filename}`;
  const footer = LocalDB.getFooter();
  footer.siteFavicon = publicPath;
  LocalDB.updateFooter(footer);
  res.json({ success: true, filePath: publicPath, footer });
});

// project-image upload
router.post('/projects/upload', authMiddleware, uploadMiddleware.single('projectImage'), (req: AdminAuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please submit a valid image file. Allowed: JPG, PNG, JPEG.' });
    return;
  }
  const publicPath = `/uploads/projects/${req.file.filename}`;
  res.json({ success: true, filePath: publicPath });
});


export default router;
