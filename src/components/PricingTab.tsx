import React, { useState } from 'react';
import { Check, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { PricingState, PricingPlan } from '../types';

interface PricingTabProps {
  pricing: PricingState | null;
  setActiveTab: (tab: string) => void;
  setPreSelectedService?: (service: string) => void;
}

export default function PricingTab({ pricing, setActiveTab, setPreSelectedService }: PricingTabProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const fallbackPlans: PricingPlan[] = [
    {
      id: "plan1",
      name: "Basic Plan",
      monthlyPrice: 29,
      annualPrice: 250,
      badgeLabel: "Web Presence",
      colorTheme: "cyan",
      features: ["1 Custom Landing Page", "Responsive Layouts", "3 Months Muted Support", "Self-Hosted Deployment Assistance"],
      ctaLabel: "Get Started",
      ctaLink: "booking",
      active: true
    },
    {
      id: "plan2",
      name: "Pro Plan",
      monthlyPrice: 89,
      annualPrice: 790,
      badgeLabel: "Most Popular",
      colorTheme: "purple",
      features: ["Full-Stack App Development", "Multi-Agent System Integrations", "Interactive Admin Dashboards", "12 Months Dedicated Support", "Free Docker + Cloud Run Deployment"],
      ctaLabel: "Get Started",
      ctaLink: "booking",
      active: true
    },
    {
      id: "plan3",
      name: "Enterprise Plan",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      badgeLabel: "Enterprise Scaling",
      colorTheme: "pink",
      features: ["Custom LLM Workflows", "Secure Microservice Architectures", "Unlimited Scale Workflows", "SLA & 24/7 Priority Support Desk"],
      ctaLabel: "Contact Me",
      ctaLink: "contact",
      active: true
    }
  ];

  const fallbackFaqs = [
    { id: "f1", question: "Do you offer post-deployment maintenance?", answer: "Yes, all Pro and Enterprise projects include complimentary technical support and feature scaling services, up to 12 months." },
    { id: "f2", question: "Can we integrate custom AI agents into our existing systems?", answer: "Absolutely. I design standalone API modules that easily hook into your legacy systems to execute smart tasks like lead scoring, email drafting, or report summarizations." },
    { id: "f3", question: "What is your typical turnaround time?", answer: "Small projects are delivered in 1-2 weeks. Complex full-stack suites and custom automated agent flows take 3-6 weeks, with incremental milestones." }
  ];

  const plans = pricing?.plans && pricing.plans.length > 0 ? pricing.plans : fallbackPlans;
  const faqs = pricing?.faq && pricing.faq.length > 0 ? pricing.faq : fallbackFaqs;
  const annualEnabled = pricing ? pricing.annualEnabled : true;

  const themeClasses = {
    cyan: {
      accent: '#06B6D4',
      badgeBg: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      btnBg: 'bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-slate-900',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-[#06B6D4]/40'
    },
    purple: {
      accent: '#7C3AED',
      badgeBg: 'bg-gradient-to-r from-[#7C3AED]/20 to-[#EC4899]/10 text-white border-[#7C3AED]/30',
      btnBg: 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:brightness-110 text-white',
      glow: 'shadow-[0_0_25px_rgba(124,58,237,0.25)] hover:border-[#7C3AED]/50'
    },
    pink: {
      accent: '#EC4899',
      badgeBg: 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20',
      btnBg: 'bg-[#EC4899] hover:bg-[#EC4899]/90 text-white',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:border-[#EC4899]/40'
    }
  };

  const handleCtaClick = (plan: PricingPlan) => {
    if (plan.ctaLink === 'booking' || plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('basic')) {
      if (setPreSelectedService) {
        // Pre-select appropriate consultation type
        const serviceMap: Record<string, string> = {
          'basic': 'Full-Stack Web Dev Consultation',
          'pro': 'AI Agent & LLM Workflow Integration',
          'enterprise': 'General Tech Assessment Consultation'
        };
        const planKey = plan.name.toLowerCase();
        const mappedService = Object.keys(serviceMap).find(k => planKey.includes(k));
        if (mappedService) {
          setPreSelectedService(serviceMap[mappedService]);
        }
      }
      setActiveTab('contact');
      // Scroll down to Scheduler
      setTimeout(() => {
        const item = document.getElementById('booking-section');
        if (item) {
          item.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      setActiveTab('contact');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      
      {/* Header section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
          Pricing <span className="bg-gradient-to-r from-[#06B6D4] via-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Tiers</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal">
          Scalable service budgets curated for startups, individual innovators, and enterprises desiring smart agent integrations.
        </p>
      </div>

      {/* Monthly / Annual toggle switch */}
      {annualEnabled && (
        <div className="flex items-center justify-center gap-4 mb-16 select-none animate-fade-in">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`}>
            Monthly Billing
          </span>
          
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 flex items-center bg-[#1A1A2E] rounded-full p-1 border border-white/10 cursor-pointer focus:outline-none"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-300 ${
              isAnnual ? 'ml-6 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'ml-0'
            }`} />
          </button>

          <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`}>
            Annual Saving
            <span className="text-[10px] bg-[#EC4899]/15 border border-[#EC4899]/30 text-[#EC4899] px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">
              Save ~15%
            </span>
          </span>
        </div>
      )}

      {/* Plans Container Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
        {plans.map((plan, index) => {
          if (!plan.active) return null;
          const isPop = plan.badgeLabel?.toLowerCase().includes('popular') || index === 1;
          const currentTheme = themeClasses[plan.colorTheme as keyof typeof themeClasses] || themeClasses.cyan;

          // Compute price text
          let priceText = '';
          let periodText = '';
          if (typeof plan.monthlyPrice === 'number' || typeof plan.annualPrice === 'number') {
            if (isAnnual) {
              priceText = `$${plan.annualPrice}`;
              periodText = '/ year';
            } else {
              priceText = `$${plan.monthlyPrice}`;
              periodText = '/ month';
            }
          } else {
            priceText = plan.monthlyPrice || 'Custom';
            periodText = '';
          }

          return (
            <div
              key={plan.id || index}
              className={`glass-card rounded-3xl p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-103 ${currentTheme.glow} ${
                isPop 
                  ? 'border-2 border-[#7C3AED]/50 bg-gradient-to-b from-[#1A1A2E] to-[#0F0F1A]' 
                  : 'border border-white/5'
              }`}
            >
              {/* Highlight background blobs for prominent cards */}
              {isPop && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/10 blur-2xl rounded-full pointer-events-none" />
              )}

              {/* Badge elements */}
              {plan.badgeLabel && (
                <div className="mb-6 flex justify-start select-none">
                  <span className={`text-[10px] font-bold font-mono tracking-wider uppercase border px-2.5 py-1 rounded-full flex items-center gap-1.5 ${currentTheme.badgeBg}`}>
                    {isPop && <Sparkles size={11} className="text-[#EC4899] animate-spin" />}
                    {plan.badgeLabel}
                  </span>
                </div>
              )}

              {/* Title & price */}
              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                    {priceText}
                  </span>
                  <span className="text-sm font-medium text-[#94A3B8] font-sans">
                    {periodText}
                  </span>
                </div>
              </div>

              {/* Features line list */}
              <ul className="space-y-4 mb-10 flex-grow select-text">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3 text-sm text-[#94A3B8] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Call-to-action trigger */}
              <button
                onClick={() => handleCtaClick(plan)}
                className={`w-full py-3.5 rounded-xl font-bold transition duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5 ${currentTheme.btnBg}`}
              >
                {plan.ctaLabel || "Get Started"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ section collapsible accordion */}
      <div className="mt-12 glass-card border border-white/5 rounded-3xl p-6 sm:p-10 select-none">
        <h3 className="text-2xl font-bold text-white mb-2 text-center flex items-center justify-center gap-2">
          <HelpCircle size={24} className="text-[#06B6D4]" />
          Common FAQ Inquiries
        </h3>
        <p className="text-[#94A3B8] text-sm text-center mb-10 max-w-lg mx-auto">
          Need clarifying answers regarding terms, project ownerships, or maintenance guidelines?
        </p>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.id || index}
                className="border-b border-white/5 pb-4 last:border-b-0 transition duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left py-3 flex items-center justify-between text-base font-semibold text-white hover:text-[#06B6D4] transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-[#06B6D4] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={18} className="text-[#94A3B8] shrink-0 ml-2" />
                  )}
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-60 mt-2 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className="text-slate-400 text-sm leading-relaxed select-text font-normal py-1 pr-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
