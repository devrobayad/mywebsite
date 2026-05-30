import React from 'react';
import { Download, Sparkles, ShieldCheck, Mail, Info } from 'lucide-react';
import { AboutData, SocialLinks } from '../types';
import IconRenderer from './IconRenderer';

interface AboutTabProps {
  about: AboutData | null;
  social: SocialLinks | null;
}

export default function AboutTab({ about, social }: AboutTabProps) {
  // Use a professional high-quality creative placeholder profile if none uploaded
  const defaultPhoto = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80";
  
  const isPhotoRemoved = about?.bioPhoto === "";
  const bioPhoto = about?.bioPhoto || defaultPhoto;
  const bioPhotoWidth = about?.bioPhotoWidth || 380;
  const bioPhotoFrame = about?.bioPhotoFrame || 'circle-premium';
  const bioPhotoBorderRadius = about?.bioPhotoBorderRadius || 'rounded-[2.5rem]';

  const radiusClass = bioPhotoFrame === 'circle-premium' 
    ? 'rounded-[2.5rem]' 
    : (bioPhotoBorderRadius === 'none' ? 'rounded-none' : (bioPhotoBorderRadius || 'rounded-3xl'));

  const handleDownloadCV = () => {
    const cvPath = (social as any)?.cvPath;
    if (cvPath) {
      window.open(cvPath, '_blank');
    } else {
      // Friendly notice if admin hasn't uploaded a PDF yet
      alert("Note: The CV PDF has not been uploaded to the server yet. You can upload a PDF via the Admin Panel under Section 8 (CV/Resume Upload) to enable this live download.");
    }
  };

  const highlightCards = about?.highlightCards && about.highlightCards.length > 0
    ? about.highlightCards
    : [
        { title: "Web Dev", desc: "Crafting beautiful, responsive, and performance-optimized React & Node.js web applications.", icon: "Code2" },
        { title: "AI Agents", desc: "Designing multi-agent systems, workflows, and tools powered by models like Gemini.", icon: "Sparkles" },
        { title: "Problem Solving", desc: "Structuring clean algorithms, robust APIs, and scalable full-stack engines.", icon: "Brain" },
        { title: "Learning", desc: "Constantly researching the cutting edge of web frameworks, AI APIs, and developer tools.", icon: "BookOpen" }
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Premium Developer Portrait */}
        {!isPhotoRemoved && (
          <div className="col-span-1 lg:col-span-12 xl:col-span-5 flex flex-col items-center w-full">
            
            {bioPhotoFrame === 'circle-premium' && (
              <div 
                className="relative group w-full flex items-center justify-center animate-fadeIn"
                style={{
                  width: '100%',
                }}
              >
                {/* Double background dynamic glow effects */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] rounded-[2.5rem] blur opacity-45 group-hover:opacity-85 transition duration-1000 group-hover:duration-250 animate-pulse pointer-events-none" />
                
                {/* Elegant Portrait Frame */}
                <div 
                  className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-transparent shadow-3xl"
                >
                  <img
                    src={bioPhoto}
                    alt="Robayad Hasan Jam"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain hover:scale-[1.03] transition duration-700 select-none pointer-events-none"
                  />
                </div>
              </div>
            )}

            {bioPhotoFrame === 'neon-glow' && (
              <div 
                className="relative w-full flex items-center justify-center animate-fadeIn"
                style={{
                  width: '100%',
                }}
              >
                {/* Subtle outer neon pulse blur */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#06B6D4]/30 via-[#EC4899]/15 to-transparent blur-xl z-0 animate-pulse pointer-events-none" />
                
                {/* Thin colored neon outline container */}
                <div 
                  className={`relative z-10 w-full overflow-hidden border-2 border-[#06B6D4]/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] bg-transparent ${radiusClass}`}
                >
                  <img
                    src={bioPhoto}
                    alt="Robayad Hasan Jam"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain hover:scale-[1.03] transition duration-700 select-none pointer-events-none"
                  />
                </div>
              </div>
            )}

            {bioPhotoFrame === 'sleek-card' && (
              <div 
                className="relative w-full flex items-center justify-center animate-fadeIn"
                style={{
                  width: '100%',
                }}
               >
                {/* Frosted Glass Polaroid Card frame */}
                <div 
                  className="w-full p-3 bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-3xl flex flex-col items-center justify-center rounded-2xl"
                >
                  <div className={`w-full bg-transparent overflow-hidden ${radiusClass}`}>
                    <img
                      src={bioPhoto}
                      alt="Robayad Hasan Jam"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain hover:scale-[1.03] transition duration-700 select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {bioPhotoFrame === 'none' && (
              <div 
                className="relative w-full flex items-center justify-center animate-fadeIn"
                style={{
                  width: '100%',
                }}
              >
                {/* PURE BARE FRAMELESS STYLE: No border, no overlay, no back gradients, pure borderless image with adjustable radius */}
                <div 
                  className={`relative z-10 w-full overflow-hidden bg-transparent ${radiusClass}`}
                >
                  <img
                    src={bioPhoto}
                    alt="Robayad Hasan Jam"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain hover:scale-[1.03] transition duration-700 select-none pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Biography, Heading, Category & Styled Pill Capsules */}
        <div className={`space-y-6 text-left ${isPhotoRemoved ? 'col-span-1 lg:col-span-12 max-w-4xl mx-auto' : 'col-span-1 lg:col-span-12 xl:col-span-7'}`}>
          
          {/* Eyebrow Label */}
          <span className="text-[#06B6D4] text-xs sm:text-sm font-bold tracking-[0.25em] font-mono uppercase block">
            {about?.aboutMeEyebrow || "-- ABOUT ME"}
          </span>

          {/* Heading (Removed 'About', reduced font-size by 5px: 30px->25px and 48px->43px) */}
          <h2 className="text-[25px] sm:text-[43px] font-extrabold tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent underline decoration-[#06B6D4]/30 decoration-[3px]">{about?.aboutMeTitle || "Robayad Hasan Jam"}</span>
          </h2>
          
          {/* Subtle gradient styling accent bar */}
          <div className="h-1 w-20 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full" />

          {/* Main Bio text */}
          <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed select-text font-normal">
            {about?.bio || "I am a high-performing Web Developer and AI Agent Developer with a passion for designing scalable cloud-native architectures, interactive user interfaces, and custom agentic workflows. Armed with expertise in modern full-stack web technologies and large language models (LLMs), I build applications that bridge the gap between elegant UI and intelligent automation."}
          </p>

          {/* Dynamic Capsule Badge Pills matching your reference design exact layout */}
          <div className="pt-4 space-y-3">
            <span className="text-[11px] font-bold font-mono tracking-wider text-zinc-400 uppercase block">
              {about?.expertiseSubtitle || "Core Expertise areas:"}
            </span>
            <div className="flex flex-wrap gap-3">
              {highlightCards.map((card, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm text-zinc-200 font-medium hover:border-[#06B6D4]/30 hover:bg-white/10 hover:translate-y-[-1px] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] select-none cursor-default"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                  <span>{card.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CV/Resume Download trigger */}
          <div className="pt-4">
            <button
               onClick={handleDownloadCV}
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.01] active:scale-95 transition-all duration-200"
            >
              <Download size={15} />
              Download CV
            </button>
          </div>

        </div>

      </div>

      {/* Focus Highlight cards - Methodological Pillars */}
      <div className="mt-24 border-t border-white/5 pt-16">
        <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-10">
          {about?.methodologyTitle || "Core Pillars of my Methodology"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightCards.map((card, idx) => (
            <div 
              key={idx}
              className="glass-card glass-card-hover p-6 rounded-2xl border border-white/5 group relative overflow-hidden"
            >
              {/* Corner ambient shine */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-3xl" />
              
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/5 border border-[#7C3AED]/20 mb-5 text-[#06B6D4] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <IconRenderer name={card.icon} size={22} />
              </div>

              <h4 className="text-lg font-bold text-white mb-2">{card.title}</h4>
              <p className="text-sm text-[#94A3B8] leading-relaxed font-normal">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
