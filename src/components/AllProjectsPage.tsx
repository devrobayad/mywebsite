import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, Sparkles, FolderCode, ArrowLeft, Search, Filter } from 'lucide-react';
import { Project } from '../types';

interface AllProjectsPageProps {
  projects: Project[] | null;
  onBack: () => void;
}

export default function AllProjectsPage({ projects, onBack }: AllProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const fallbackProjects: Project[] = [
    {
      id: "p1",
      title: "n8n AI Lead Generator & Agent Workflow",
      desc: "An automated n8n workflow that monitors user submissions, qualifies leads with context using AI, and automatically syncs them to WordPress & active CRM platforms.",
      techTags: ["n8n Automation", "AI Agents", "WordPress API", "CRM Sync"],
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://n8n.devrobayad.com",
      githubUrl: "",
      status: "Active"
    },
    {
      id: "p2",
      title: "Custom WordPress Theme & Plugin for LMS",
      desc: "A custom WordPress theme built from scratch with an accompanying custom plugin managing courses and subscriptions securely.",
      techTags: ["WordPress Dev", "PHP & MySQL", "Theme Customize", "Custom Plugin"],
      thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://wordpress.devrobayad.com",
      githubUrl: "",
      status: "Active"
    },
    {
      id: "p3",
      title: "Responsive React Portfolio with Tailwind",
      desc: "A super fast single-page app containing beautiful micro-animations, customizable dark elements, and complete responsiveness.",
      techTags: ["React JS", "Tailwind CSS", "HTML/CSS/JS", "Vite"],
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://react.devrobayad.com",
      githubUrl: "",
      status: "Active"
    }
  ];

  const allProjects = projects && projects.length > 0 ? projects : fallbackProjects;

  // Extract all unique tech tags for filter buttons
  const allTags = ['All', ...Array.from(new Set(allProjects.flatMap(p => p.techTags)))];

  // Filter projects based on search query and selected filter tag
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || project.techTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back navigation option */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#06B6D4] transition"
        >
          <ArrowLeft size={16} />
          Back to Home Overview
        </button>
      </div>

      {/* Header text */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          All Portfolio <span className="bg-gradient-to-r from-[#EC4899] to-[#7C3AED] bg-clip-text text-transparent">Projects</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-[#EC4899] to-[#7C3AED] mx-auto rounded-full" />
        <p className="text-[#94A3B8] max-w-xl mx-auto mt-4 text-sm sm:text-base font-normal">
          Explore my complete collection of tailored solutions spanning automation flowcharts, bespoke WordPress components, and React applications.
        </p>
      </div>

      {/* Filter and search utilities bar */}
      <div className="glass-card p-6 border border-white/5 rounded-2xl mb-12 flex flex-col md:flex-row gap-6 items-center justify-between shadow-lg">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/3 border border-white/5 focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20 focus:outline-none rounded-xl text-sm placeholder:text-zinc-500 text-white transition-all duration-200"
          />
        </div>

        {/* Categories tags container */}
        <div className="w-full flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 shrink-0 select-none">
            <Filter size={13} />
            <span>FILTER:</span>
          </div>
          <div className="flex gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-[#7C3AED]/25 to-[#06B6D4]/25 border-[#7C3AED] text-[#06B6D4]'
                    : 'bg-white/3 border-white/5 hover:border-white/15 text-[#94A3B8]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid of loaded cards */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/2 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-sm">No projects matching your search parameters were discovered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => {
            const isComingSoon = project.status === 'Coming Soon' || !project.liveUrl;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:border-[#7C3AED]/35 hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)] h-full"
              >
                {/* Image layout */}
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

                {/* Body content */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
                      {project.desc}
                    </p>
                  </div>

                  {/* Tech Tags */}
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

                  {/* Footer dynamic links */}
                  <div className="flex items-center gap-4 pt-4 mt-auto border-t border-white/5">
                    {!isComingSoon ? (
                      <>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:brightness-115 flex items-center gap-1.5 transition shadow"
                        >
                          <ExternalLink size={13} />
                          Live Demo
                        </a>
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition"
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

      {/* Navigation footer layout to return to primary portfolio layout */}
      <div className="mt-16 text-center select-none">
        <button
          onClick={onBack}
          className="px-8 py-3.5 bg-white/3 border border-white/10 hover:border-white/20 text-white hover:text-[#06B6D4] font-semibold rounded-xl text-xs sm:text-sm shadow-xl transition-all duration-300"
        >
          Return to Hub Dashboard
        </button>
      </div>

    </div>
  );
}
