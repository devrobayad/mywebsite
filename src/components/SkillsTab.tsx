import React from 'react';
import { Sparkles } from 'lucide-react';
import { Skill } from '../types';
import IconRenderer from './IconRenderer';

interface SkillsTabProps {
  skills: Skill[] | null;
}

export default function SkillsTab({ skills }: SkillsTabProps) {
  const categories: Skill['category'][] = ['Frontend', 'Backend', 'Tools'];

  const fallbackSkills: Skill[] = [
    { id: "s1", name: "React / Vite / JSX", category: "Frontend", icon: "Flame" },
    { id: "s2", name: "Tailwind CSS v4", category: "Frontend", icon: "Palette" },
    { id: "s3", name: "TypeScript & EsNext", category: "Frontend", icon: "FileCode" },
    { id: "s4", name: "Framer Motion", category: "Frontend", icon: "Activity" },
    { id: "s5", name: "Node.js & Express.js", category: "Backend", icon: "Server" },
    { id: "s6", name: "RESTful APIs & GraphQL", category: "Backend", icon: "Cpu" },
    { id: "s7", name: "MongoDB & Postgres SQL", category: "Backend", icon: "Database" },
    { id: "s8", name: "JWT Auth & Cryptography", category: "Backend", icon: "ShieldCheck" },
    { id: "s9", name: "Gemini Pro / Flash", category: "AI & Agents", icon: "Sparkles" },
    { id: "s10", name: "LangChain Workflows", category: "AI & Agents", icon: "Boxes" },
    { id: "s11", name: "Multi-Agent Systems", category: "AI & Agents", icon: "Workflow" },
    { id: "s12", name: "Git & GitHub Integrations", category: "Tools", icon: "Github" },
    { id: "s13", name: "Docker & Kubernetes", category: "Tools", icon: "Container" },
    { id: "s14", name: "Vercel & GCP Cloud Run", category: "Tools", icon: "Cloud" }
  ];

  const activeSkills = skills && skills.length > 0 ? skills : fallbackSkills;

  // Simple category card accent themes
  const accentThemes = {
    Frontend: {
      border: 'hover:border-[#06B6D4]/30',
      text: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/5',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]'
    },
    Backend: {
      border: 'hover:border-[#7C3AED]/30',
      text: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/5',
      glow: 'shadow-[0_0_15px_rgba(124,58,237,0.1)]'
    },
    'AI & Agents': {
      border: 'hover:border-[#EC4899]/30',
      text: 'text-[#EC4899]',
      bg: 'bg-[#EC4899]/5',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]'
    },
    Tools: {
      border: 'hover:border-white/20',
      text: 'text-[#F8FAFC]',
      bg: 'bg-white/5',
      glow: 'shadow-[0_0_15px_rgba(255,255,255,0.05)]'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      
      {/* Page header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Skills & <span className="bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] bg-clip-text text-transparent text-glow">Expertise</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal">
          A granular view of my architectural and development fluency spanning multiple tech ecosystems and paradigms.
        </p>
      </div>

      {/* Grid of skill categories */}
      <div className="space-y-16">
        {categories.map((category) => {
          const categorySkills = activeSkills.filter(s => s.category === category);
          const theme = accentThemes[category];

          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="space-y-6">
              {/* Category label */}
              <div className="flex items-center gap-3">
                <h3 className={`text-xl sm:text-2xl font-bold tracking-wide uppercase ${theme.text}`}>
                  {category}
                </h3>
                <div className="flex-grow h-[1px] bg-white/10" />
              </div>

              {/* Skills elements list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`glass-card p-4.5 rounded-xl border border-white/5 flex items-center gap-4 transition-all duration-300 hover:scale-102 ${theme.border} ${theme.glow}`}
                  >
                    {/* Icon frame */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${theme.bg} ${theme.text} border border-white/5 shrink-0`}>
                      <IconRenderer name={skill.icon} size={20} />
                    </div>

                    {/* Skill info */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-white truncate">
                        {skill.name}
                      </p>
                      <p className="text-xs text-[#94A3B8] lowercase font-mono">
                        {skill.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
