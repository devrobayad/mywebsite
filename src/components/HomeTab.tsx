import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Terminal, Sparkles, Code2, Cpu, Upload } from 'lucide-react';
import { HeroData, AboutData, CounterItem } from '../types';

interface HomeTabProps {
  hero: HeroData | null;
  about: AboutData | null;
  counters?: CounterItem[] | null;
  setActiveTab: (tab: string) => void;
}

function AnimatedCounterText({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isPreloaderGone = !document.getElementById('preloader-overlay');
        
        if (entry.isIntersecting && isPreloaderGone) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    const fallbackTimer = setInterval(() => {
      const isPreloaderGone = !document.getElementById('preloader-overlay');
      const rect = elementRef.current?.getBoundingClientRect();
      const inViewport = rect ? (rect.top < window.innerHeight && rect.bottom > 0) : false;
      
      if (isPreloaderGone && inViewport) {
        setHasAnimated(true);
        clearInterval(fallbackTimer);
      }
    }, 300);

    return () => {
      observer.disconnect();
      clearInterval(fallbackTimer);
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const numericMatch = value.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const prefix = numericMatch[1] || '';
    const numStr = numericMatch[2];
    const suffix = numericMatch[3] || '';
    const targetNum = parseFloat(numStr);

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1600; // premium 1.6 seconds smooth count
    const framesPerSecond = 60;
    const totalFrames = Math.max(1, Math.floor((duration / 1000) * framesPerSecond));
    let currentFrame = 0;

    const hasDecimal = numStr.includes('.');
    const decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0;

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      
      // Premium cubic ease-out curve (feels highly professional)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = easeProgress * targetNum;

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(`${prefix}${targetNum.toFixed(decimalPlaces)}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${currentNum.toFixed(decimalPlaces)}${suffix}`);
      }
    }, Math.round(duration / totalFrames));

    return () => clearInterval(timer);
  }, [hasAnimated, value]);

  return <span ref={elementRef}>{displayValue}</span>;
}

export default function HomeTab({ hero, about, counters, setActiveTab }: HomeTabProps) {
  const defaultCounters = [
    { id: "cnt_1", value: "120+", label: "Happy Customers" },
    { id: "cnt_2", value: "250+", label: "Projects Completed" },
    { id: "cnt_3", value: "99%", label: "Success Rate" },
    { id: "cnt_4", value: "5+", label: "Years Experience" }
  ];
  const listCounters = counters && counters.length > 0 ? counters : defaultCounters;

  const heading = hero?.heading || "Hi, I'm Robayad Hasan Jam 👋";
  const words = hero?.typewriterTexts && hero.typewriterTexts.length > 0 
    ? hero.typewriterTexts 
    : ["Web Developer", "Full-Stack Engineer", "Problem Solver"];

  const defaultPhoto = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80";
  
  // Decide what photo to show - '' (empty string) means photo has been explicitly removed
  const isPhotoRemoved = hero?.heroPhotoUrl === "";
  const heroPhotoUrl = hero?.heroPhotoUrl || (about as any)?.bioPhoto || defaultPhoto;

  const isFullWidth = hero?.heroPhotoFullWidth ?? false;
  const heroPhotoWidth = hero?.heroPhotoWidth || 420;
  const heroPhotoHeight = hero?.heroPhotoHeight || 420;
  const heroPhotoFrame = hero?.heroPhotoFrame || 'circle-premium';
  const heroPhotoBorderRadius = hero?.heroPhotoBorderRadius || 'rounded-3xl';
  
  const radiusClass = heroPhotoFrame === 'circle-premium' 
    ? 'rounded-full' 
    : (heroPhotoBorderRadius === 'none' ? 'rounded-none' : (heroPhotoBorderRadius || 'rounded-3xl'));

  const finalWidth = isFullWidth ? '100%' : `${heroPhotoWidth}px`;
  const finalHeight = isFullWidth ? 'auto' : `${heroPhotoHeight}px`;
  const finalAspect = isFullWidth ? `${heroPhotoWidth}/${heroPhotoHeight}` : undefined;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullWord = words[currentWordIndex];

    const handleType = () => {
      if (!isDeleting) {
        // Typing characters
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        if (currentText === fullWord) {
          // Pause at complete word, then start deleting
          timer = setTimeout(() => setIsDeleting(true), 1500);
          return;
        }
      } else {
        // Deleting characters
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(100);
          return;
        }
      }

      setTypingSpeed(isDeleting ? 50 : 100);
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed]);

  return (
    <div className="relative min-h-[85vh] bg-[#0F0F1A] text-white flex items-center justify-center py-16 lg:py-24 overflow-hidden">
      
      {/* Dynamic Glowing Ambient Background Blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#7C3AED]/15 rounded-full blur-[120px] pointer-events-none select-none animate-[pulse_8s_infinite]" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-[120px] pointer-events-none select-none animate-[pulse_6s_infinite_1s]" />
      
      {/* Subtle futuristic matrix grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none select-none" />

      {/* 🌸 FLOATING VECTOR 1: Pink Dots on LHS Column */}
      <div className="absolute top-24 left-6 sm:left-12 opacity-30 pointer-events-none select-none z-10">
        <svg width="45" height="45" viewBox="0 0 45 45" fill="currentColor" className="text-pink-500">
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="18" cy="11" r="2" />
          <circle cx="28" cy="7" r="2.5" />
          <circle cx="11" cy="20" r="2" />
          <circle cx="22" cy="22" r="2.5" />
          <circle cx="33" cy="17" r="2" />
          <circle cx="9" cy="32" r="3" />
          <circle cx="21" cy="34" r="2" />
          <circle cx="31" cy="30" r="2.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full select-text">
        <div id="home-two-columns-wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* DIVISION 1: DEVELOPER INFO COLUMN */}
          <div className={isPhotoRemoved ? "lg:col-span-12 space-y-6 text-center max-w-3xl mx-auto" : "lg:col-span-6 space-y-6 text-center lg:text-left max-w-2xl mx-auto lg:mx-0"}>
            
            {/* Tagline / Introduction badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium text-zinc-300"
            >
              <Sparkles size={14} className="text-[#06B6D4]" />
              <span>Interactive Portfolio & CMS Platform</span>
            </motion.div>

            {/* Majestic Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[31px] sm:text-[43px] md:text-[55px] font-extrabold tracking-tight text-white leading-[1.15]"
            >
              {heading}
            </motion.h1>

            {/* Typing dynamic rotating display */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`text-lg sm:text-2xl md:text-3xl font-bold font-mono h-10 flex items-center justify-center ${isPhotoRemoved ? 'lg:justify-center' : 'lg:justify-start'}`}
            >
              <span className="text-zinc-400">Professional </span>
              <span className="ml-2 sm:ml-3 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent border-r-2 border-r-[#06B6D4] pr-1.5 animate-[blink_0.8s_infinite] inline-block">
                {currentText}
              </span>
            </motion.div>

            {/* High craftsmanship descriptive helper */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className={`text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed ${isPhotoRemoved ? 'mx-auto' : 'mx-auto lg:mx-0'}`}
            >
              I architect full-stack web products, responsive user interfaces, and robust database setups built for peak performance & enterprise scaling.
            </motion.p>

            {/* Calls to Action Buttons Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 select-none ${isPhotoRemoved ? 'lg:justify-center' : 'lg:justify-start'}`}
            >
              <button
                onClick={() => setActiveTab('projects')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] text-white hover:brightness-110 font-bold rounded-xl text-xs sm:text-sm hover:scale-105 active:scale-98 transition duration-200 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore My Projects
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-white transition hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
              >
                View My Services
              </button>
            </motion.div>

            {/* Live System Tech Badge Accents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`grid grid-cols-2 gap-3 max-w-md pt-8 text-zinc-400 select-none text-left ${isPhotoRemoved ? 'mx-auto' : 'mx-auto lg:mx-0'}`}
            >
              <div className="flex items-center gap-2 bg-white/3 border border-white/5 px-3 py-2 rounded-xl text-[10px] font-medium tracking-wide">
                <Code2 size={13} className="text-[#7C3AED]" />
                <span>REACT / TYPESCRIPT</span>
              </div>
              <div className="flex items-center gap-2 bg-white/3 border border-white/5 px-3 py-2 rounded-xl text-[10px] font-medium tracking-wide font-mono">
                <Cpu size={13} className="text-[#06B6D4]" />
                <span>SYSTEM ARCHITECTURE</span>
              </div>
            </motion.div>

          </div>

          {/* DIVISION 2: DEVELOPER PHOTO COLUMN */}
          {!isPhotoRemoved && (
            <div className="lg:col-span-6 flex items-center justify-center relative select-none w-full animate-fadeIn">
              
              {heroPhotoFrame === 'circle-premium' && (
                <div 
                  className="relative w-full flex items-center justify-center"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%'
                  }}
                >
                  
                  {/* ✨ GORGEOUS DOODLE/VECTOR: Pink/neon curly ribbon layout accents */}
                  <div className="absolute -top-6 -right-6 z-30 pointer-events-none select-none opacity-80 animate-[pulse_5s_infinite]">
                    <svg width="100" height="90" viewBox="0 0 140 120" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M10,25 C35,20 60,60 80,45 C95,35 75,10 60,25 C50,35 65,55 90,40" />
                      <path d="M95,35 L120,15" />
                      <path d="M98,48 L125,40" />
                      <path d="M92,58 L115,62" />
                    </svg>
                  </div>
 
                  {/* 🌀 FLOATING SPIRAL: Below the photo container */}
                  <div className="absolute -bottom-6 -left-6 z-30 pointer-events-none select-none opacity-70">
                    <svg width="45" height="45" viewBox="0 0 60 60" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round">
                      <path d="M30,30 C20,35 15,20 25,15 C38,10 48,25 35,38 C22,50 5,30 18,10 C25,2 45,5 50,22" />
                    </svg>
                  </div>
 
                  {/* Ambient Glowing Halo Backdrop */}
                  <div 
                    className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#7C3AED]/25 via-[#EC4899]/25 to-[#06B6D4]/10 blur-[40px] z-0 animate-[pulse_8s_infinite] transition-all duration-300 pointer-events-none"
                  />
 
                  {/* Precise Adaptive Backdrop Shape */}
                  <div 
                    className="absolute -inset-1 bg-gradient-to-b from-[#7C3AED] via-[#EC4899] to-[#F43F5E] z-10 opacity-90 shadow-xl transition-all duration-300"
                    style={{ 
                      borderRadius: radiusClass === 'rounded-full' ? '50%' : '1.5rem'
                    }}
                  />
 
                  {/* Overflow Mask Container with elegant premium border */}
                  <div 
                    className={`relative z-20 w-full h-auto overflow-hidden border-[6px] border-white shadow-2xl bg-transparent flex items-center justify-center transition-all duration-300 ${radiusClass}`}
                  >
                    <img
                      src={heroPhotoUrl}
                      alt={heading}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
 
                </div>
              )}
 
              {heroPhotoFrame === 'neon-glow' && (
                <div 
                  className="relative flex items-center justify-center w-full"
                >
                  {/* Subtle radiating pulsing ring glow */}
                  <div 
                    className="absolute -inset-4 bg-gradient-to-tr from-[#06B6D4]/30 via-[#7C3AED]/15 to-transparent blur-2xl z-0 animate-pulse transition-all duration-300 pointer-events-none"
                    style={{
                      borderRadius: radiusClass === 'rounded-full' ? '50%' : '1.5rem'
                    }}
                  />
                  
                  {/* Outer container with thin colored neon glow border */}
                  <div 
                    className={`relative z-10 w-full h-auto overflow-hidden border-2 border-[#06B6D4]/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] bg-transparent flex items-center justify-center transition-all duration-300 ${radiusClass}`}
                  >
                    <img
                      src={heroPhotoUrl}
                      alt={heading}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>
              )}
 
              {heroPhotoFrame === 'sleek-card' && (
                <div 
                  className="relative w-full flex items-center justify-center animate-fadeIn"
                >
                  {/* Glass Card frame structure with inner padding */}
                  <div 
                    className="relative z-10 w-full p-3 bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 rounded-2xl"
                  >
                    <div 
                      className={`w-full bg-transparent overflow-hidden ${radiusClass}`}
                    >
                      <img
                        src={heroPhotoUrl}
                        alt={heading}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                  </div>
                </div>
              )}
 
              {heroPhotoFrame === 'none' && (
                <div 
                  className="relative w-full flex items-center justify-center"
                >
                  {/* ABSOLUTELY PURE FRAMELESS STYLE: No border, no decorations, no backdrop element */}
                  <div 
                    className={`relative z-10 w-full overflow-hidden bg-transparent flex items-center justify-center transition-all duration-300 ${radiusClass}`}
                  >
                    <img
                      src={heroPhotoUrl}
                      alt={heading}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>
              )}
 
            </div>
          )}

        </div>

        {/* Dynamic Responsive Counters Section */}
        {listCounters && listCounters.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-16 sm:mt-24 pt-10 sm:pt-14"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 md:divide-x md:divide-white/10 text-center">
              {listCounters.map((stat, idx) => (
                <div key={stat.id || idx} className="flex flex-col items-center justify-center px-4 group">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent group-hover:from-[#06B6D4] group-hover:to-[#EC4899] transition-all duration-300 select-none">
                    <AnimatedCounterText value={stat.value} />
                  </span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#94A3B8] mt-2.5 tracking-wider uppercase group-hover:text-white transition-colors duration-250 leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
