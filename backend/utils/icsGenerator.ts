export function generateICSString({
  id,
  name,
  service,
  date, // YYYY-MM-DD
  time, // HH:MM
  meetingType,
  notes
}: {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  meetingType: 'Online' | 'In-Person';
  notes?: string;
}): string {
  // Convert date & time into YYYYMMDDTHHMMSS
  // Input: 2026-05-28 and 09:30
  const cleanDate = date.replace(/-/g, ''); // 20260528
  const cleanTimeStart = time.replace(/:/g, '') + '00'; // 093000

  // Standard duration: 45 minutes
  const [hours, minutes] = time.split(':').map(Number);
  let endMinutes = minutes + 45;
  let endHours = hours;
  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes -= 60;
  }
  const endHoursStr = String(endHours).padStart(2, '0');
  const endMinutesStr = String(endMinutes).padStart(2, '0');
  const cleanTimeEnd = `${endHoursStr}${endMinutesStr}00`;

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const isOnline = meetingType === 'Online';
  const location = isOnline
    ? 'Google Meet (Link will be provided prior to meeting)'
    : 'In-Person Conference Room';

  const meetLink = isOnline ? 'Google Meet Link: https://meet.google.com/abc-defg-hij' : '';

  const summary = `${service} - Robayad Jam`;
  const description = `Hi ${name},\\n\\nYour scheduling for "${service}" is confirmed with Robayad Hasan Jam.\\n\\nDetails:\\nDate: ${date}\\nTime: ${time}\\nType: ${meetingType}\\n${meetLink}\\n\\nNotes: ${notes || 'None'}`;

  // ICS Content String
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//devrobayad//NONSGML Meeting Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${id}@devrobayad.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${cleanDate}T${cleanTimeStart}`,
    `DTEND:${cleanDate}T${cleanTimeEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Consultation with Robayad',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
