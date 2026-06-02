import React, { useState, useMemo } from 'react';
import { ExternalLink, Github, Sparkles, FolderCode, ArrowRight, Filter } from 'lucide-react';
import { Project } from '../types';
import { motion } from 'motion/react';

interface ProjectsTabProps {
  projects: Project[] | null;
  limit?: number;
  onViewAll?: () => void;
}

export default function ProjectsTab({ projects, limit, onViewAll }: ProjectsTabProps) {
  const [selectedTag, setSelectedTag] = useState('All');

  const fallbackProjects: Project[] = [
    {
      id: "p1",
      title: "SmartAgent CRM Platform",
      desc: "An AI-powered client relationship manager that parses incoming user inquiries, auto-categorizes subjects, and drafts precise smart replies.",
      techTags: ["React", "Express", "Gemini API", "Tailwind CSS"],
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://smartagent.devrobayad.com",
      githubUrl: "https://github.com/robayad/smartagent-crm",
      status: "Active"
    },
    {
      id: "p2",
      title: "AgileSprint Calendar Pro",
      desc: "Responsive workspace scheduling app with real-time slot bookings, availability buffers, and Google Calendar ics synchronizations.",
      techTags: ["TypeScript", "Vite", "Node.js", "Express"],
      thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://agilecal.devrobayad.com",
      githubUrl: "",
      status: "Coming Soon"
    },
    {
      id: "p3",
      title: "Glassy Dashboard UI kit",
      desc: "A sleek, highly custom interactive dashboards styled with Tailwind CSS glassmorphic cards and dynamic charts.",
      techTags: ["React", "Tailwind CSS", "Recharts", "Framer Motion"],
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://glassy.devrobayad.com",
      githubUrl: "https://github.com/robayad/glassy-dashboard",
      status: "Active"
    }
  ];

  const activeProjects = projects && projects.length > 0 ? projects : fallbackProjects;

  // Extract all unique tech tags for filter buttons
  const allTags = useMemo(() => {
    return ['All', ...Array.from(new Set(activeProjects.flatMap(p => p.techTags)))];
  }, [activeProjects]);

  // Filter projects based on selected filter tag
  const filteredProjects = useMemo(() => {
    if (selectedTag === 'All') return activeProjects;
    return activeProjects.filter(p => p.techTags.includes(selectedTag));
  }, [activeProjects, selectedTag]);

  const displayedProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;
  const hasMore = limit ? filteredProjects.length > limit : false;

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
      
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Featured <span className="bg-gradient-to-r from-[#EC4899] to-[#7C3AED] bg-clip-text text-transparent">Projects</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#EC4899] to-[#7C3AED] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal">
          A showcase of engineered applications, specialized system integrations, and open-source packages.
        </p>
      </motion.div>

      {/* Filter and search utilities bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 mb-12 select-none">
        <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 shrink-0 select-none mr-2">
          <Filter size={13} className="text-[#06B6D4]" />
          <span>FILTER PROJECTS:</span>
        </div>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono border transition-all duration-200 cursor-pointer ${
              selectedTag === tag
                ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/20 border-[#7C3AED] text-[#06B6D4] shadow-[0_0_12px_rgba(124,58,237,0.15)] font-bold'
                : 'bg-white/3 border-white/5 hover:border-white/15 text-[#94A3B8]'
            }`}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      {/* Grid of project cards */}
      {displayedProjects.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 bg-white/2 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-sm">No featured projects found for the selected filter tag.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project) => {
          const isComingSoon = project.status === 'Coming Soon' || !project.liveUrl;

          return (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col group transition-all duration-300 hover:border-[#7C3AED]/35 hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)] h-full"
            >
              {/* Thumbnail header */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900 select-none">
                {isComingSoon && (
                  <div className="absolute top-3 right-3 z-10 font-bold font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded bg-[#EC4899] text-white shadow-md animate-pulse">
                    Coming Soon
                  </div>
                )}
                <img
                  src={project.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-transparent to-transparent opacity-60" />
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors duration-200">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3 font-normal">
                    {project.desc}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white group-hover:text-[#06B6D4] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Card footer CTAs */}
                <div className="flex items-center gap-4 pt-4 mt-auto border-t border-white/5">
                  {!isComingSoon ? (
                    <>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:brightness-115 flex items-center gap-1.5 transition shadow cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        Live Demo
                      </a>
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Github size={13} />
                          Source Code
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold font-mono text-[#555] select-none flex items-center gap-1">
                          <FolderCode size={12} />
                          Internal Repo
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-[#94A3B8]/60 font-medium select-none italic">
                      <Sparkles size={12} className="text-[#EC4899] animate-pulse" />
                      In development pipeline
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
      )}

      {/* Slicing More Button */}
      {hasMore && onViewAll && (
        <motion.div variants={itemVariants} className="mt-12 text-center select-none">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#EC4899]/15 to-[#7C3AED]/15 border border-[#7C3AED]/50 hover:border-[#7C3AED] text-[#EC4899] hover:text-[#06B6D4] font-bold rounded-xl text-xs sm:text-sm shadow-xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer"
          >
            <span>More Projects</span>
            <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

    </motion.div>
  );
}
