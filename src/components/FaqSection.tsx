import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQItem } from '../types';

interface FaqSectionProps {
  faq: FAQItem[] | null | undefined;
}

export default function FaqSection({ faq }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fallbackFaqs: FAQItem[] = [
    {
      id: "f1",
      question: "Do you offer post-deployment maintenance?",
      answer: "Yes, all Pro and Enterprise projects include complimentary technical support and feature scaling services, up to 12 months."
    },
    {
      id: "f2",
      question: "Can we integrate custom AI agents into our existing systems?",
      answer: "Absolutely. I design standalone API modules that easily hook into your legacy systems to execute smart tasks like lead scoring, email drafting, or report summarizations."
    },
    {
      id: "f3",
      question: "What is your typical turnaround time?",
      answer: "Small projects are delivered in 1-2 weeks. Complex full-stack suites and custom automated agent flows take 3-6 weeks, with incremental milestones."
    }
  ];

  const faqItems = faq && faq.length > 0 ? faq : fallbackFaqs;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      
      {/* Visual Accent Badge */}
      <div className="flex justify-center mb-4 select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-[11px] font-bold tracking-widest uppercase font-mono"
        >
          <Sparkles size={11} className="text-[#EC4899] animate-pulse" />
          Got Questions?
        </motion.div>
      </div>

      {/* Styled Grid Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Frequently Asked <span className="bg-gradient-to-r from-[#06B6D4] via-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent underline decoration-[#06B6D4]/30 decoration-[3px]">Questions</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-xs sm:text-sm font-normal">
          Explore frequently asked questions regarding my development processes, service deliveries, and AI integration systems.
        </p>
      </div>

      {/* Collapsible Accordion Stream */}
      <div className="space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`glass-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? 'border-[#7C3AED]/40 bg-[#16162E]/70 shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-sm sm:text-base font-semibold text-slate-100 hover:text-[#06B6D4] transition-colors focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3 pr-4">
                  <HelpCircle size={18} className={`shrink-0 ${isOpen ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`} />
                  <span>{item.question}</span>
                </div>
                
                {/* Arrow toggle container */}
                <div className={`p-1 rounded-lg bg-white/5 border border-white/5 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 border-[#06B6D4]/30 text-[#06B6D4]' : 'text-slate-400'
                }`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="border-t border-white/5 bg-white/[0.01]">
                      <p className="px-5 py-4 sm:px-6 sm:py-5 text-xs sm:text-sm leading-relaxed text-[#94A3B8] select-text">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
