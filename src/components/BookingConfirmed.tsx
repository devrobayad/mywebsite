import React from 'react';
import { CheckCircle, Calendar, Clock, Laptop, ArrowLeft, Download, MapPin } from 'lucide-react';
import { Booking } from '../types';

interface BookingConfirmedProps {
  booking: Booking | null;
  setActiveTab: (tab: string) => void;
}

export default function BookingConfirmed({ booking, setActiveTab }: BookingConfirmedProps) {
  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-[#94A3B8] mb-6">No scheduling details found. Log a meeting first.</p>
        <button
          onClick={() => setActiveTab('contact')}
          className="px-6 py-2 rounded-xl text-white bg-[#7C3AED]"
        >
          Go to Scheduler
        </button>
      </div>
    );
  }

  const isOnline = booking.meetingType === 'Online';
  const meetLocation = isOnline ? 'Google Meet Conference Room' : 'In-Person Meeting Room';

  const handleDownloadICS = () => {
    // Queries dynamic server endpoint to trigger automated rfc-compliant .ics file assembly download
    window.open(`/api/bookings/${booking.id}/calendar`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in select-text">
      
      {/* Visual Header card */}
      <div className="glass-card border-2 border-emerald-500/30 rounded-3xl p-8 sm:p-10 text-center space-y-6 relative overflow-hidden select-none">
        
        {/* Sparkle top ambient */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#06B6D4] to-emerald-400" />

        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle size={36} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Booking Confirmed!</h2>
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
            Status: Pending Admin Confirmation
          </p>
        </div>

        <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed font-normal">
          Thank you, <strong>{booking.name}</strong>. Your consultation reservation has been successfully registered. 
          A confirmation email has been dispatched to <strong>{booking.email}</strong>, and Robayad has been notified!
        </p>

        {/* Details list summary */}
        <div className="bg-[#0F0F1A]/85 border border-white/5 rounded-2xl p-6 text-left space-y-4 shadow-inner">
          <h3 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-2 uppercase tracking-widest font-mono">
            Reservation Card Details:
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#06B6D4] shrink-0">
                <Laptop size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Consultation</p>
                <p className="text-xs font-semibold text-white truncate">{booking.service}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Calendar size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Target Date</p>
                <p className="text-xs font-semibold text-white truncate">{booking.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#EC4899] shrink-0">
                <Clock size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Reserved Time</p>
                <p className="text-xs font-semibold text-white truncate">{booking.time} (45M duration)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#06B6D4] shrink-0">
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Location</p>
                <p className="text-xs font-semibold text-white truncate">{meetLocation}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="pt-2 border-t border-white/5 mt-2">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Additional Context Notes:</p>
              <p className="text-xs text-slate-300 italic font-normal mt-1 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                "{booking.notes}"
              </p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleDownloadICS}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-[#06B6D4] hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-103 transition duration-300"
          >
            <Download size={16} />
            Add to Google Calendar (.ics)
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition duration-300"
          >
            <ArrowLeft size={16} />
            Back to Home View
          </button>
        </div>

      </div>

    </div>
  );
}
