import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import IconRenderer from './IconRenderer';
import { ServiceItem } from './ServicesTab';

interface AllServicesPageProps {
  services: ServiceItem[] | null;
  onBack: () => void;
  setActiveTab: (tab: string) => void;
  setPreSelectedService?: (service: string) => void;
}

export default function AllServicesPage({ 
  services, 
  onBack, 
  setActiveTab, 
  setPreSelectedService 
}: AllServicesPageProps) {

  const fallbackServices: ServiceItem[] = [
    {
      id: "srv-1",
      title: "n8n AI Agent Automation",
      desc: "Intelligent automated pipelines and multi-tool workflows built on n8n. Integrate ChatGPT/Gemini, auto-handle incoming leads, synchronize spreadsheets, and optimize manual tasks.",
      features: [
        "Advanced n8n workflow triggers and loops",
        "CRM & Google Sheets API integrations",
        "AI Agent tool definitions & custom function calls",
        "Real-time event logging & automated error recovery"
      ],
      icon: "Cpu",
      color: "from-[#7C3AED] to-[#06B6D4]",
      badge: "n8n AI",
      targetConsultation: "AI Agent & LLM Workflow Integration"
    },
    {
      id: "srv-2",
      title: "WordPress Website Development",
      desc: "Robust, lightweight, SEO-ready WordPress websites tailored to your unique agency presence or ecommerce workflows using standard PHP & modular layouts.",
      features: [
        "Full-site creation with clean PHP codebase",
        "WooCommerce & secure payment routing setup",
        "Mobile-first responsive layout rendering",
        "Speed optimization & caching configurations"
      ],
      icon: "Globe",
      color: "from-[#06B6D4] to-[#EC4899]",
      badge: "WordPress",
      targetConsultation: "Full-Stack Web Dev Consultation"
    },
    {
      id: "srv-3",
      title: "Theme & Plugin Customization",
      desc: "Customized development adjusting layout rules on premium WordPress themes or writing custom plugins from scratch to implement features standard systems miss.",
      features: [
        "Clean, upgrade-safe theme-override architectures",
        "Custom WP plugin programming from scratch",
        "Shortcode & widget customization",
        "API hooks integration to third-party databases"
      ],
      icon: "FileCode",
      color: "from-[#EC4899] to-[#7C3AED]",
      badge: "Plugin & Theme",
      targetConsultation: "Codebase Review & Optimization"
    }
  ];

  const allServices = services && services.length > 0 ? services : fallbackServices;

  const handleHireClick = (service: ServiceItem) => {
    if (setPreSelectedService) {
      setPreSelectedService(service.targetConsultation);
    }
    setActiveTab('contact');
    setTimeout(() => {
      const el = document.getElementById('booking-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#06B6D4] transition"
        >
          <ArrowLeft size={16} />
          Back to Home Overview
        </button>
      </div>

      {/* Services Header */}
      <div className="text-center mb-16 select-none animate-fade-in">
        
        {/* Upper tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium text-zinc-400 mb-4">
          <Sparkles size={14} className="text-[#06B6D4]" />
          <span>Complete Engineering Solutions Spectrum</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Exhaustive <span className="bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent">Services Catalog</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal leading-relaxed">
          I apply full-scale software principles, optimized responsive layouts, and granular diagnostic protocols to achieve lightning-fast loading and intelligent system connections.
        </p>
      </div>

      {/* Grid of service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
        {allServices.map((service, index) => {
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:border-[#7C3AED]/35 hover:shadow-[0_10px_35px_rgba(124,58,237,0.15)] h-full"
            >
              {/* Card strip color */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${service.color || "from-[#7C3AED] to-[#06B6D4]"}`} />

              <div className="p-8 flex flex-col flex-grow justify-between">
                <div>
                  
                  {/* Icon & Badge label */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06B6D4] transition-transform duration-300 group-hover:scale-110">
                      <IconRenderer name={service.icon} size={24} />
                    </div>
                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors duration-250">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  {/* Feature bullets details */}
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-3 mb-8 text-left select-text border-t border-white/5 pt-5">
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] shrink-0 mt-1.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

                {/* Consultation target trigger buttons */}
                <button
                  onClick={() => handleHireClick(service)}
                  className="w-full py-3 bg-white/3 hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 flex items-center justify-center gap-2 group/btn transition"
                >
                  <span>Book Consultation Slot</span>
                  <ArrowRight size={14} className="text-zinc-400 transition-transform duration-250 group-hover/btn:translate-x-1" />
                </button>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hero inquiry box */}
      <div className="relative glass-card border border-white/10 rounded-2xl p-8 sm:p-12 overflow-hidden text-center max-w-4xl mx-auto shadow-2xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#7C3AED]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#06B6D4]/10 blur-3xl rounded-full" />

        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Need a dynamic system or integrated WordPress flow?</h3>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            I customize fullstack features, build custom background processes, and orchestrate dedicated environments. Let's design exactly what you need.
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                setActiveTab('contact');
                setTimeout(() => {
                  const el = document.getElementById('contact-form-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] text-white brightness-105 hover:brightness-115 font-bold rounded-xl text-xs sm:text-sm shadow-xl flex items-center gap-2"
            >
              Send Me An Inquiry
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
