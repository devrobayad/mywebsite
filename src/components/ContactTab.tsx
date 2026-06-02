import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Clock, Laptop, Compass, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SocialLinks, Booking } from '../types';
import IconRenderer from './IconRenderer';
import { ClientDB } from '../lib/db';

interface ContactTabProps {
  social: SocialLinks | null;
  preSelectedService: string;
  setPreSelectedService: (service: string) => void;
  onBookingSuccess: (bookingDetails: Booking) => void;
}

export default function ContactTab({
  social,
  preSelectedService,
  setPreSelectedService,
  onBookingSuccess
}: ContactTabProps) {
  // --- STATE FOR CONTACT MESSAGE ---
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<{ status: 'success' | 'err'; text: string } | null>(null);

  // --- STATE FOR MEETING SCHEDULER ---
  const [bName, setBName] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bService, setBService] = useState(preSelectedService || '');
  const [bDate, setBDate] = useState('');
  const [bTime, setBTime] = useState('');
  const [bType, setBType] = useState<'Online' | 'In-Person'>('Online');
  const [bNotes, setBNotes] = useState('');
  
  const [services, setServices] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dayClosedReason, setDayClosedReason] = useState<string | null>(null);
  const [bookingSending, setBookingSending] = useState(false);
  const [bookingErr, setBookingErr] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load fallback/initial availability structure to read services list
  useEffect(() => {
    ClientDB.getAvailability().then(settings => {
      if (settings && settings.services) {
        setServices(settings.services);
        if (!bService && settings.services.length > 0) {
          setBService(preSelectedService || settings.services[0]);
        }
      }
    }).catch(() => {
      const fallbacks = [
        "Full-Stack Web Dev Consultation",
        "AI Agent & LLM Workflow Integration",
        "Codebase Review & Optimization",
        "General Tech Assessment Consultation"
      ];
      setServices(fallbacks);
      if (!bService) setBService(fallbacks[0]);
    });
  }, []);

  // Update dropdown selection if parent changes preSelectedService
  useEffect(() => {
    if (preSelectedService) {
      setBService(preSelectedService);
    }
  }, [preSelectedService]);

  // Dynamic slot lookups on Date change
  useEffect(() => {
    if (!bDate) {
      setAvailableSlots([]);
      setDayClosedReason(null);
      return;
    }

    setSlotsLoading(true);
    setDayClosedReason(null);
    setBTime('');

    ClientDB.getSlotsForDate(bDate)
      .then(data => {
        setSlotsLoading(false);
        if (data.dayActive) {
          setAvailableSlots(data.slots || []);
          if (data.slots && data.slots.length === 0) {
            setDayClosedReason('No slots available for this date. All hours booked!');
          }
        } else {
          setAvailableSlots([]);
          setDayClosedReason(data.reason || 'Closed on this date');
        }
      })
      .catch(() => {
        setSlotsLoading(false);
        setAvailableSlots(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
      });
  }, [bDate]);

  // Submit contact message handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName || !msgEmail || !msgSubject || !msgBody) {
      setMsgFeedback({ status: 'err', text: 'Please fill out all the input fields.' });
      return;
    }

    setMsgSending(true);
    setMsgFeedback(null);

    try {
      const msgPayload = {
        name: msgName,
        email: msgEmail,
        subject: msgSubject,
        message: msgBody
      };
      await ClientDB.addMessage(msgPayload);

      // Trigger automatic SMTP email notification dispatch in background
      try {
        const emailSettings = await ClientDB.getEmailSettings();
        if (emailSettings && emailSettings.enableNotifications) {
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'contact',
              data: msgPayload,
              emailSettings
            })
          }).catch(err => console.error("Error dispatching background post:", err));
        }
      } catch (err) {
        console.warn("Background notification settings parse failed:", err);
      }

      setMsgSending(false);
      setMsgFeedback({ status: 'success', text: `Message sent! Thank you ${msgName}. I will correspond shortly.` });
      setMsgName('');
      setMsgEmail('');
      setMsgSubject('');
      setMsgBody('');
    } catch {
      setMsgSending(false);
      setMsgFeedback({ status: 'err', text: 'Connection failure. Try again shortly.' });
    }
  };

  // Submit booking scheduler handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingErr(null);

    if (!bName || !bEmail || !bService || !bDate || !bTime || !bType) {
      setBookingErr('Please complete all scheduling input configurations.');
      return;
    }

    setBookingSending(true);

    try {
      const bookingPayload = {
        name: bName,
        email: bEmail,
        service: bService,
        date: bDate,
        time: bTime,
        meetingType: bType,
        notes: bNotes
      };
      const bObj = await ClientDB.addBooking(bookingPayload);

      // Trigger automatic SMTP booking email notification dispatch in background
      try {
        const emailSettings = await ClientDB.getEmailSettings();
        if (emailSettings && emailSettings.enableNotifications) {
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'booking',
              data: bookingPayload,
              emailSettings
            })
          }).catch(err => console.error("Error dispatching booking background post:", err));
        }
      } catch (err) {
        console.warn("Background booking notification settings parse failed:", err);
      }

      setBookingSending(false);
      onBookingSuccess(bObj);

      setBName('');
      setBEmail('');
      setBDate('');
      setBTime('');
      setBNotes('');
    } catch (err: any) {
      setBookingSending(false);
      setBookingErr(err?.message || 'Failure deploying booking request.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      
      {/* Tab headings */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Get In <span className="bg-gradient-to-r from-[#06B6D4] via-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Touch</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal">
          Inquire regarding full-time openings, custom agency projects, or reserve a personal technical audit calendar slot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* ==========================================
            LEFT SECTION: General Contact Form
           ========================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 glass-card border border-white/5 rounded-3xl p-6 sm:p-8 select-text">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Mail className="text-[#7C3AED]" size={22} />
              Send a Message
            </h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Have general questions or suggestions? Drop me an instant message and I will feedback within 24 hours.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  placeholder="e.g. Alice Carter"
                  className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={msgEmail}
                  onChange={(e) => setMsgEmail(e.target.value)}
                  placeholder="e.g. alice@gmail.com"
                  className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="Web app development project request"
                  className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Message Description</label>
                <textarea
                  required
                  rows={4}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Hey Robayad, let's configure a smart CRM portal with Gemini API capabilities..."
                  className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors resize-none"
                />
              </div>

              {msgFeedback && (
                <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium border ${
                  msgFeedback.status === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                }`}>
                  {msgFeedback.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{msgFeedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={msgSending}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:brightness-110 text-white shadow-lg transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {msgSending && <Loader2 size={16} className="animate-spin" />}
                {msgSending ? 'Sending Inquiry...' : 'Submit Message'}
              </button>
            </form>
          </div>

          {/* Quick Info contacts */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            {social?.contactItems && social.contactItems.length > 0 ? (
              social.contactItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#7C3AED] shrink-0">
                    <IconRenderer name={item.icon} size={16} />
                  </div>
                  <p className="text-sm text-[#94A3B8] font-mono break-all select-all">
                    <span className="text-zinc-500 font-semibold mr-1">{item.label}:</span> {item.value}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#7C3AED] shrink-0">
                    <Phone size={16} />
                  </div>
                  <p className="text-sm text-[#94A3B8] font-mono select-all">
                    <span className="text-zinc-500 font-semibold mr-1">phone:</span> {social?.phone || "+8801640785053"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#7C3AED] shrink-0">
                    <Mail size={16} />
                  </div>
                  <p className="text-sm text-[#94A3B8] font-mono select-all">
                    <span className="text-zinc-500 font-semibold mr-1">email:</span> {social?.email || "robayed.info@gmail.com"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#7C3AED] shrink-0">
                    <MapPin size={16} />
                  </div>
                  <p className="text-sm text-[#94A3B8] select-all">
                    <span className="text-zinc-500 font-semibold font-mono mr-1">address:</span> {social?.address || "Dakshin-khan, Dhaka-1230, Bangladesh"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>


        {/* ==========================================
            RIGHT SECTION: Custom Booking Form
           ========================================== */}
        <div id="booking-section" className="lg:col-span-7 glass-card border-2 border-[#06B6D4]/30 rounded-3xl p-6 sm:p-8 select-text flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-[#06B6D4]" size={22} />
                Schedule a Meeting
              </h3>
              <span className="text-[10px] bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                Live Scheduler
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Choose an available day and time slot to book an initial technical consultation with Robayad instantly.
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="e.g. Alice Carter"
                    className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={bEmail}
                    onChange={(e) => setBEmail(e.target.value)}
                    placeholder="e.g. alice@gmail.com"
                    className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Select Consultation Service</label>
                <select
                  required
                  value={bService}
                  onChange={(e) => setBService(e.target.value)}
                  className="w-full bg-[#0F0F1A]/90 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {services.map((srv, idx) => (
                    <option key={idx} value={srv} className="bg-[#1A1A2E] text-white">
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={bDate}
                    onChange={(e) => setBDate(e.target.value)}
                    className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                    Preferred Time Slot
                    {slotsLoading && <Loader2 size={12} className="animate-spin text-[#06B6D4]" />}
                  </label>
                  <select
                    required
                    disabled={availableSlots.length === 0 || slotsLoading}
                    value={bTime}
                    onChange={(e) => setBTime(e.target.value)}
                    className="w-full bg-[#0F0F1A]/90 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer disabled:opacity-40"
                  >
                    {!bDate && <option value="">Select a date first</option>}
                    {bDate && slotsLoading && <option value="">Calculating openings...</option>}
                    {bDate && !slotsLoading && availableSlots.length === 0 && (
                      <option value="">No openings</option>
                    )}
                    {bDate && !slotsLoading && availableSlots.length > 0 && (
                      <>
                        <option value="">-- Choose a slot --</option>
                        {availableSlots.map((slot, idx) => (
                          <option key={idx} value={slot} className="bg-[#1A1A2E] text-white">
                            {slot}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Quick Pick Slots recommendation panel */}
              {availableSlots.length > 0 && (
                <div className="space-y-2 select-none">
                  <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest block">
                    ⚡ Quick-Pick Recommendations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.slice(0, 3).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBTime(slot)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono transition-all cursor-pointer ${
                          bTime === slot 
                            ? 'bg-[#06B6D4]/25 border-[#06B6D4] text-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dayClosedReason && (
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{dayClosedReason}</span>
                </div>
              )}

              <div className="space-y-1.5 select-none">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">Meeting Format</label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="mType"
                      checked={bType === 'Online'}
                      onChange={() => setBType('Online')}
                      className="accent-[#06B6D4] w-4 h-4 cursor-pointer"
                    />
                    <span>Online (Google Meet)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="mType"
                      checked={bType === 'In-Person'}
                      onChange={() => setBType('In-Person')}
                      className="accent-[#06B6D4] w-4 h-4 cursor-pointer"
                    />
                    <span>In-Person</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Additional Message / Project Context (Optional)</label>
                <textarea
                  rows={2}
                  value={bNotes}
                  onChange={(e) => setBNotes(e.target.value)}
                  placeholder="Any brief project descriptions or links to current system scopes..."
                  className="w-full bg-[#0F0F1A]/80 border border-white/10 focus:border-[#06B6D4] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4] resize-none"
                />
              </div>

              {bookingErr && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{bookingErr}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingSending || slotsLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] hover:brightness-110 text-white shadow-lg transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {bookingSending && <Loader2 size={16} className="animate-spin" />}
                {bookingSending ? 'Saving Reservation...' : 'Reserve Consultation Room'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
