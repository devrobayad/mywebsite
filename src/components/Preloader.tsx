import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Loader2, Sparkles, Activity, ShieldAlert, Cpu as CoreIcon, Flame, Globe, Bot } from 'lucide-react';
import { FooterData } from '../types';

interface PreloaderProps {
  footer: FooterData | null;
  isLoading: boolean;
  onFinished: () => void;
}

export default function Preloader({ footer, isLoading, onFinished }: PreloaderProps) {
  const [dots, setDots] = useState('');
  const [visible, setVisible] = useState(true);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [hackerStep, setHackerStep] = useState(0);

  // Fallback logo if none configured
  const logoUrl = footer?.preloaderLogoUrl || footer?.headerLogoImg || footer?.siteFavicon || "";
  const loaderType = footer?.preloaderType || 'cyber-core';
  const isEnabled = footer?.preloaderEnabled !== false;

  // Dots tick for text loaders
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Hacker terminal lines generator
  useEffect(() => {
    if (loaderType !== 'hacker-terminal') return;

    const phrases = [
      "> initial_boot: system diagnostic active...",
      "> connecting: secure API cloud handshake...",
      "> parsing: WordPress metadata layout...",
      "> optimizing: n8n autonomous lead agents...",
      "> compiling: responsive React client view...",
      "> status: premium interface loaded."
    ];

    if (hackerStep < phrases.length) {
      const timer = setTimeout(() => {
        setTerminalLines((prev) => [...prev, phrases[hackerStep]]);
        setHackerStep((prev) => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [loaderType, hackerStep]);

  // Handle fading out when isLoading is false
  useEffect(() => {
    if (!isLoading) {
      // Small timeout for graceful final state before fading out
      const fadeTimer = setTimeout(() => {
        setVisible(false);
      }, 400);
      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading]);

  // Destruct preloader on exit animation complete
  const handleAnimationComplete = () => {
    if (!visible) {
      onFinished();
    }
  };

  if (!isEnabled) {
    return null;
  }

  // --- LOGO OR ICON RENDERER ---
  const renderLogo = (sizeClass = "w-14 h-14", iconSize = 24) => {
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt="Site Logo" 
          className={`${sizeClass} object-contain rounded-xl select-none`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If image fails to load, replace with clean monogram fallback
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const nextSibling = e.currentTarget.nextSibling as HTMLElement;
            if (nextSibling) nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    // Monogram fallback
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center font-bold text-white tracking-wider text-sm select-none shadow-[0_0_15px_rgba(124,58,237,0.4)]`}>
        {footer?.logoText ? footer.logoText.slice(0, 2).toUpperCase() : 'RJ'}
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          id="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={handleAnimationComplete}
          className="fixed inset-0 z-[999999] bg-[#07070E] flex flex-col items-center justify-center p-6 text-slate-200 select-none overflow-hidden"
        >
          {/* Subtle Ambient background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370d_1px,transparent_1px),linear-gradient(to_bottom,#1f29370d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* 1. CYBER CORE STYLE */}
          {loaderType === 'cyber-core' && (
            <div className="flex flex-col items-center space-y-6 max-w-sm w-full">
              {/* Outer multi-ring rotating system */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outermost ring: solid dash */}
                <div className="absolute inset-0 rounded-full border border-dashed border-[#7C3AED]/40 animate-[spin_8s_linear_infinite]" />
                
                {/* Middle ring: colorful spinner */}
                <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-[#06B6D4] border-b-[#7C3AED] animate-[spin_1.5s_linear_infinite]" />
                
                {/* Inner ring: counter rotating */}
                <div className="absolute inset-4 rounded-full border border-dotted border-white/20 animate-[spin_3s_linear_infinite_reverse]" />
                
                {/* Center Core Logo/Icon */}
                <div className="absolute w-14 h-14 rounded-full bg-[#0D0D19] border border-white/10 flex items-center justify-center p-2 shadow-inner">
                  {logoUrl ? (
                    renderLogo("w-10 h-10", 18)
                  ) : (
                    <CoreIcon className="text-[#06B6D4] animate-pulse" size={20} />
                  )}
                </div>
              </div>

              {/* Status and title indicator */}
              <div className="text-center space-y-2">
                <h3 className="font-mono text-xs tracking-[0.25em] text-[#A78BFA] font-bold uppercase">
                  ACTIVE ENGINE CORE
                </h3>
                <p className="font-mono text-[10px] text-slate-400 h-4 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
                  <span>Booting elements{dots}</span>
                </p>
              </div>

              {/* Minimalist System Parameters */}
              <div className="border border-white/5 bg-[#0A0A14]/80 backdrop-blur-md rounded-lg p-2.5 w-full text-left font-mono text-[9px] text-[#94A3B8] space-y-1">
                <div className="flex justify-between border-b border-white/5 pb-1 text-slate-500">
                  <span>SYSTEM ADDR</span>
                  <span className="text-[#06B6D4]">PORT::3000</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>AUTONOMOUS_INTEGRATIONS</span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex justify-between">
                  <span>WP_CORE_SHADOWS</span>
                  <span className="text-emerald-400 font-bold">STABLE</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. QUANTUM PULSE STYLE */}
          {loaderType === 'quantum-pulse' && (
            <div className="flex flex-col items-center space-y-6">
              {/* Soft radial glow backlights */}
              <div className="absolute w-80 h-80 rounded-full bg-[#7C3AED]/10 filter blur-[60px] animate-pulse" />
              <div className="absolute w-60 h-60 rounded-full bg-[#06B6D4]/10 filter blur-[40px] animate-pulse [animation-delay:1s]" />

              <div className="relative">
                {/* Pulsing visual orbits */}
                <div className="absolute -inset-4 rounded-3xl border border-[#06B6D4]/20 animate-ping [animation-duration:2.5s]" />
                <div className="absolute -inset-8 rounded-3xl border border-[#7C3AED]/10 animate-ping [animation-duration:4s]" />
                
                {/* Main breathing container */}
                <motion.div 
                  className="relative bg-[#0F0F23] p-4.5 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(124,58,237,0.15)] flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  {logoUrl ? (
                    renderLogo("w-16 h-16", 28)
                  ) : (
                    <Sparkles className="text-[#06B6D4]" size={28} />
                  )}
                </motion.div>
              </div>

              {/* Simple subtle branding title */}
              <div className="text-center space-y-1.5">
                <h4 className="text-sm font-semibold tracking-wider text-white">
                  {footer?.logoText || 'Robayad Hasan'}
                </h4>
                <p className="text-[10px] font-mono tracking-widest text-[#06B6D4] uppercase">
                  Quantum Stream Loading{dots}
                </p>
              </div>
            </div>
          )}

          {/* 3. HACKER TERMINAL STYLE */}
          {loaderType === 'hacker-terminal' && (
            <div className="w-full max-w-sm bg-[#05050A]/95 border border-emerald-500/20 rounded-xl p-4 font-mono text-[10px] text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/60" />
                </div>
                <span className="text-[8px] text-emerald-600 uppercase font-bold">ROBAYAD SHELL v4.2</span>
              </div>

              {/* Monogram logo nested */}
              <div className="flex items-center space-x-3 p-2 bg-emerald-950/20 border border-emerald-500/5 rounded-lg">
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs border border-emerald-500/20 animate-pulse">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded" referrerPolicy="no-referrer" />
                  ) : (
                    <Terminal size={12} />
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] text-white font-bold leading-tight">SYSTEM INITIALIZER</h4>
                  <p className="text-[8px] text-emerald-500/70">Connecting indices: online</p>
                </div>
              </div>

              {/* Logs */}
              <div className="space-y-1.5 min-h-[100px] text-emerald-300">
                {terminalLines.map((line, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {line}
                  </motion.div>
                ))}
                {hackerStep < 6 && (
                  <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* 4. NEON SHIMMER STYLE */}
          {loaderType === 'neon-shimmer' && (
            <div className="flex flex-col items-center space-y-6 max-w-xs w-full">
              {/* Outer sleek circle wrapper with shimmer */}
              <div className="relative p-6 bg-[#0B0B14] rounded-full border border-white/10 shadow-[0_4px_30px_rgba(6,182,212,0.1)] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-r-[#06B6D4] border-l-[#7C3AED] animate-[spin_3s_linear_infinite]" />
                
                {/* Inner Glowing Shield */}
                <div className="bg-[#121226] p-3.5 rounded-full shadow-inner flex items-center justify-center">
                  {logoUrl ? (
                    renderLogo("w-12 h-12", 22)
                  ) : (
                    <Flame className="text-[#7C3AED] animate-pulse" size={22} />
                  )}
                </div>
              </div>

              {/* Modern progress bar indicator */}
              <div className="w-full space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute h-full left-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-[#64748B]">
                  <span>RESONANCE SECURE LOAD</span>
                  <span className="text-[#06B6D4]">SECURE HANDSHAKE</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. CUSTOM LOGO SPIN STYLE */}
          {loaderType === 'custom-logo-spin' && (
            <div className="flex flex-col items-center space-y-6">
              {/* Spinning 3D Logo Cube / Card perspective container */}
              <div className="w-24 h-24 relative flex items-center justify-center">
                
                {/* Halo glows around logo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4]/40 opacity-15 filter blur-xl animate-pulse" />
                <div className="absolute inset-2 rounded-full border border-white/5 animate-[spin_6s_linear_infinite]" />

                {/* Perspective flipping card container */}
                <motion.div
                  className="w-16 h-16 p-2 bg-[#0E0E1F] border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl relative z-10"
                  animate={{ 
                    rotateY: [0, 180, 360],
                    rotateZ: [0, 15, 0, -15, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    ease: "easeInOut" 
                  }}
                >
                  {logoUrl ? (
                    renderLogo("w-12 h-12", 24)
                  ) : (
                    <Bot className="text-[#06B6D4]" size={24} />
                  )}
                </motion.div>
              </div>

              {/* Brand descriptor */}
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {footer?.logoText || 'Robayad Hasan'}
                </p>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  Loading site environment{dots}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
