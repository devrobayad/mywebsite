import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('secure_password_132', 10);

const SEED_DATA = {
  hero: {
    heading: "Hi, I'm Robayad Hasan Jam 👋",
    typewriterTexts: ["n8n AI Agent Automation", "WordPress Developer", "Theme & Plugin Specialist", "React JS Developer"]
  },
  about: {
    bio: "I am a dedicated Web Developer and AI Automation Specialist. I specialize in designing intelligent workflows with n8n, crafting fully customized WordPress websites (including theme and plugin development), and building highly interactive, responsive user interfaces using HTML, CSS, JavaScript, and React JS. My mission is to bridge creative web development with intelligent automation.",
    highlightCards: [
      { title: "AI Automation", desc: "Designing autonomous agentic workflows and multi-tool pipelines with n8n to streamline operations.", icon: "Sparkles" },
      { title: "WordPress Dev", desc: "Building robust websites from scratch, customizing premium themes, and writing modular custom plugins.", icon: "Globe" },
      { title: "React JS & JS", desc: "Developing ultra-fast, rich single page applications using React, modern JavaScript, and Tailwind CSS.", icon: "Code2" },
      { title: "HTML / CSS / JS", desc: "Writing clean, standard-compliant, search-engine-optimized, and super fluid frontend layouts.", icon: "Flame" }
    ]
  },
  skills: [
    { id: "s1", name: "n8n AI Automation", category: "AI & Agents", icon: "Workflow" },
    { id: "s2", name: "AI Agent Systems", category: "AI & Agents", icon: "Sparkles" },
    { id: "s3", name: "API & Tool Integrations", category: "Tools", icon: "Cpu" },
    { id: "s4", name: "WordPress Core Dev", category: "Backend", icon: "Database" },
    { id: "s5", name: "Theme Customization", category: "Frontend", icon: "Palette" },
    { id: "s6", name: "Custom Plugin Dev", category: "Backend", icon: "FileCode" },
    { id: "s7", name: "React JS Ecosystem", category: "Frontend", icon: "Flame" },
    { id: "s8", name: "Modern JavaScript", category: "Frontend", icon: "Activity" },
    { id: "s9", name: "HTML5 & Tailwind CSS", category: "Frontend", icon: "Layers" },
    { id: "s10", name: "Git & Code Management", category: "Tools", icon: "Github" }
  ],
  projects: [
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
  ],
  social: {
    github: "https://github.com/robayad",
    linkedin: "https://linkedin.com/in/robayad",
    facebook: "https://facebook.com/robayad",
    email: "robayed.info@gmail.com"
  },
  messages: [],
  pricing: {
    plans: [
      {
        id: "plan1",
        name: "Standard Builder",
        monthlyPrice: 49,
        annualPrice: 450,
        badgeLabel: "Best for web presences",
        colorTheme: "cyan",
        features: ["Custom HTML / CSS / JS Layout", "WordPress Theme Custiomization", "Up to 5 Pages Responsive Site", "Plugin setups & configurations", "30 days tech assistance support"],
        ctaLabel: "Settle Order",
        ctaLink: "booking",
        active: true
      },
      {
        id: "plan2",
        name: "Active Automator",
        monthlyPrice: 149,
        annualPrice: 1390,
        badgeLabel: "Highly requested focus",
        colorTheme: "purple",
        features: ["Fully Custom WordPress Dev", "React JS Advanced Portal Pages", "n8n Workflow Automations setup", "Custom plugin integrations", "90 days prioritized support"],
        ctaLabel: "Appoint Call",
        ctaLink: "booking",
        active: true
      },
      {
        id: "plan3",
        name: "Enterprise Agent",
        monthlyPrice: "Custom",
        annualPrice: "Custom",
        badgeLabel: "Complex scale operations",
        colorTheme: "pink",
        features: ["Advanced n8n Multi-Agent Flow", "Custom Theme & Plugin from Scratch", "React JS Custom Web Interfaces", "Continuous system performance audits", "Ongoing SLA support assistance"],
        ctaLabel: "Consult Setup",
        ctaLink: "contact",
        active: true
      }
    ],
    annualEnabled: true,
    faq: [
      { id: "f1", question: "Which workflow automations do you model with n8n?", answer: "I create triggers, response filters, database auto-sync systems (WordPress/Sheets), and AI agent workflows using n8n for fully responsive task management." },
      { id: "f2", question: "Can you code WordPress plugins and themes from absolute scratch?", answer: "Yes. Beyond customizing templates, I build standards-compliant WordPress themes and custom modular plug-ins to implement your custom workflows cleanly." },
      { id: "f3", question: "What frameworks are used for web sites?", answer: "I utilize clean, native HTML/CSS/JS alongside React JS, Tailwind CSS, and Vite to build blazing-fast responsive applications." }
    ]
  },
  bookings: [],
  availability: {
    weeklySchedule: {
      monday: { active: true, start: "09:00", end: "17:00" },
      tuesday: { active: true, start: "09:00", end: "17:00" },
      wednesday: { active: true, start: "09:00", end: "17:00" },
      thursday: { active: true, start: "09:00", end: "17:00" },
      friday: { active: true, start: "09:00", end: "17:00" },
      saturday: { active: false, start: "10:00", end: "14:00" },
      sunday: { active: false, start: "10:00", end: "14:00" }
    },
    slotDuration: 30,
    bufferTime: 15,
    blockedDates: ["2026-06-25"],
    services: [
      "WordPress Web Dev Consultation",
      "n8n AI Agent Workflow Integration",
      "Theme & Plugin Optimization",
      "General Tech Consultation / Audit"
    ],
    maxBookingsPerDay: 5
  },
  admin: {
    username: "robayad",
    passwordHash: DEFAULT_PASSWORD_HASH
  }
};

function seed() {
  console.log('Seeding portfolio Database...');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
  console.log('✅ Portfolios populated with default seed user robayad / secure_password_132');
}

seed();
