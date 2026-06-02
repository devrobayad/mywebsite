import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import IconRenderer from './IconRenderer';

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  features: string[];
  icon: string;
  color: string;
  badge: string;
  targetConsultation: string;
}

interface ServicesTabProps {
  services?: ServiceItem[];
  setActiveTab: (tab: string) => void;
  setPreSelectedService?: (service: string) => void;
  limit?: number;
  onViewAll?: () => void;
}

export default function ServicesTab({ services = [], setActiveTab, setPreSelectedService, limit, onViewAll }: ServicesTabProps) {
  
  const fallbackServices: ServiceItem[] = [
    {
      id: "srv-1",
      title: "Fullstack Web Applications",
      desc: "End-to-end web architectures powered by ultra-fast React, Vite bundlers, TypeScript, and elegant Tailwind CSS visual layers. Highly performant, completely responsive, and visually modern.",
      features: [
        "Advanced interactive state management",
        "Mobile-first fluid interactive layouts",
        "Secure backend REST/GraphQL API hooks",
        "Interactive Admin CMS portal controls"
      ],
      icon: "Globe",
      color: "from-[#7C3AED] to-[#06B6D4]",
      badge: "Full-Stack Dev",
      targetConsultation: "Full-Stack Web Dev Consultation"
    },
    {
      id: "srv-2",
      title: "System APIs & Database Engine Architectures",
      desc: "Robust Express / Node.js backend systems designed with deep consideration of transaction concurrency and data normalization to prevent sync conflicts across client databases.",
      features: [
        "Custom RESTful & GraphQL schema modeling",
        "Optimized Postgres, MongoDB, & Firestore index layers",
        "Real-time event streams and WebSockets",
        "Robust JWT & OAuth-based authentication controls"
      ],
      icon: "Database",
      color: "from-[#06B6D4] to-[#EC4899]",
      badge: "Database & APIs",
      targetConsultation: "Database & Backend Design"
    },
    {
      id: "srv-3",
      title: "Workflow Automation & Core Integrations",
      desc: "Intelligent background sync routines, third-party system interactions (Gmail, Sheets, Twilio, Stripe), and automation pipelines that double operational efficiency.",
      features: [
        "Advanced automated event-driven triggers",
        "Google Workspace & Calendar deep pipelines",
        "Automated PDF compiling & asset generation",
        "SaaS payment portal (Stripe) integration"
      ],
      icon: "Zap",
      color: "from-[#EC4899] to-[#7C3AED]",
      badge: "Automations",
      targetConsultation: "Workflow Automation Planning"
    },
    {
      id: "srv-4",
      title: "Interactive Admin Dashboards",
      desc: "Gorgeous analytics dashboards with clear data visualization. Ideal for internal operations, content management, scheduling, or monitoring business telemetry gracefully.",
      features: [
        "High-performance charting (Recharts/D3)",
        "Collapsible sidebar workflows & data tables",
        "Secure real-time update monitors",
        "Dynamic JSON spreadsheet importing/exporting"
      ],
      icon: "Code2",
      color: "from-[#F59E0B] to-[#7C3AED]",
      badge: "Dashboards & CMS",
      targetConsultation: "General Tech Assessment Consultation"
    },
    {
      id: "srv-5",
      title: "Docker Orchestration & Cloud Deployment",
      desc: "Reliable DevOps environments mapped with structured Docker definitions, customized container configurations, and cost-effective serverless environments.",
      features: [
        "Serverless execution (Google Cloud Run / Vercel)",
        "Custom domain mapping with automated SSL certs",
        "CI/CD workflow orchestration",
        "Robust error tracking & telemetry logging setups"
      ],
      icon: "GitBranch",
      color: "from-[#10B981] to-[#06B6D4]",
      badge: "Cloud Run & DevOps",
      targetConsultation: "Cloud Consultation & Setup"
    },
    {
      id: "srv-6",
      title: "Tech Stack Consultation & Performance Audits",
      desc: "Professional architectural review of high-complexity legacy or new applications. Analyze bottlenecks, secure environment structures, and map out scalable plans.",
      features: [
        "Lighthouse optimization & bundle size review",
        "Security validation (headers, CORS, middleware safety)",
        "Strict TypeScript transition plans",
        "Clear step-by-step product milestones maps"
      ],
      icon: "ShieldAlert",
      color: "from-[#EF4444] to-[#F59E0B]",
      badge: "Consultation",
      targetConsultation: "General Tech Assessment Consultation"
    }
  ];

  const servicesList = services.length > 0 ? services : fallbackServices;
  const displayedServices = limit ? servicesList.slice(0, limit) : servicesList;
  const hasMore = limit ? servicesList.length > limit : false;

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="max-w-6xl mx-auto px-4 py-16"
    >
      
      {/* Services Header */}
      <motion.div variants={itemVariants} className="text-center mb-16 select-none">
        
        {/* Upper badge tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium text-zinc-400 mb-4">
          <Sparkles size={14} className="text-[#06B6D4]" />
          <span>Engineered Excellence for Your Vision</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Services <span className="bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent">Offered</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal leading-relaxed">
          Unlock high-performance products built with robust modern codebases, clean APIs, and responsive styling custom-fit for your scaling goals.
        </p>
      </motion.div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
        {displayedServices.map((service) => {
          return (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col group transition-all duration-300 hover:border-[#7C3AED]/35 hover:shadow-[0_10px_35px_rgba(124,58,237,0.15)] h-full"
            >
              {/* Card visual accent strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${service.color || "from-[#7C3AED] to-[#06B6D4]"}`} />

              <div className="p-8 flex flex-col flex-grow justify-between">
                <div>
                  
                  {/* Icon & Badge row */}
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
                    <p className="text-sm text-[#94A3B8] leading-relaxed font-normal">
                      {service.desc}
                    </p>
                  </div>

                  {/* Feature Bullets list */}
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

                {/* Interactive Consultation Target Trigger */}
                <button
                  onClick={() => handleHireClick(service)}
                  className="w-full py-3 bg-white/3 hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 flex items-center justify-center gap-2 group/btn transition cursor-pointer"
                >
                  <span>Book Consultation</span>
                  <ArrowRight size={14} className="text-zinc-400 transition-transform duration-250 group-hover/btn:translate-x-1" />
                </button>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slicing More Button */}
      {hasMore && onViewAll && (
        <motion.div variants={itemVariants} className="mt-4 mb-16 text-center select-none">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#7C3AED]/15 to-[#06B6D4]/15 border border-[#06B6D4]/50 hover:border-[#06B6D4] text-[#06B6D4] hover:text-[#EC4899] font-bold rounded-xl text-xs sm:text-sm shadow-xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer"
          >
            <span>More Services</span>
            <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

      {/* Prominent Call to Action banner at the bottom */}
      <motion.div variants={itemVariants} className="relative glass-card border border-white/10 rounded-2xl p-8 sm:p-12 overflow-hidden text-center max-w-4xl mx-auto shadow-2xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#7C3AED]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#06B6D4]/10 blur-3xl rounded-full" />

        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Have a unique system specification or complex idea?</h3>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            I customize fullstack features, build custom background processes, and orchestrate dedicated environments. Let's design exactly what you need.
          </p>
          <div className="flex justify-center select-none pt-2">
            <button
              onClick={() => {
                setActiveTab('contact');
                setTimeout(() => {
                  const el = document.getElementById('contact-form-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] text-white brightness-105 hover:brightness-115 font-bold rounded-xl text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer"
            >
              Send Me An Inquiry
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
