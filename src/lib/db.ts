import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  HeroData,
  AboutData,
  Skill,
  Project,
  SocialLinks,
  FooterData,
  ContactMessage,
  PricingState,
  Booking,
  AvailabilitySettings,
  ServiceItem,
  EmailSettings,
  CounterItem
} from '../types';

// Default layout database schema to fall back on
const DEFAULT_DB = {
  hero: {
    heading: "Hi, I'm Robayad Hasan Jam 👋",
    typewriterTexts: ["n8n AI Agent Automation", "WordPress Developer", "Theme & Plugin Specialist", "React JS Developer"]
  } as HeroData,

  about: {
    bio: "I am a dedicated Web Developer and AI Automation Specialist. I specialize in designing intelligent workflows with n8n, crafting fully customized WordPress websites (including theme and plugin development), and building highly interactive, responsive user interfaces using HTML, CSS, JavaScript, and React JS. My mission is to bridge creative web development with intelligent automation.",
    highlightCards: [
      { title: "AI Automation", desc: "Designing autonomous agentic workflows and multi-tool pipelines with n8n to streamline operations.", icon: "Sparkles" },
      { title: "WordPress Dev", desc: "Building robust websites from scratch, customizing premium themes, and writing modular custom plugins.", icon: "Globe" },
      { title: "React JS & JS", desc: "Developing ultra-fast, rich single page applications using React, modern JavaScript, and Tailwind CSS.", icon: "Code2" },
      { title: "HTML / CSS / JS", desc: "Writing clean, standard-compliant, search-engine-optimized, and super fluid frontend layouts.", icon: "Flame" }
    ]
  } as AboutData,

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
  ] as Skill[],

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
  ] as Project[],

  social: {
    github: "https://github.com/robayad",
    linkedin: "https://linkedin.com/in/robayad",
    facebook: "https://facebook.com/robayad",
    email: "robayed.info@gmail.com",
    phone: "+8801640785053",
    address: "Dakshin-khan, Dhaka-1230, Bangladesh",
    customChannels: [],
    contactItems: [
      { id: "cont_1", label: "phone", value: "+8801640785053", icon: "Phone" },
      { id: "cont_2", label: "email", value: "robayed.info@gmail.com", icon: "Mail" },
      { id: "cont_3", label: "address", value: "Dakshin-khan, Dhaka-1230, Bangladesh", icon: "MapPin" }
    ]
  } as SocialLinks,

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
  } as PricingState,

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
      "Full-Stack Web Dev Consultation",
      "AI Agent & LLM Workflow Integration",
      "Codebase Review & Optimization",
      "General Tech Assessment Consultation"
    ],
    maxBookingsPerDay: 5,
    customSlots: {}
  } as AvailabilitySettings,

  admin: {
    username: "robayad",
    passwordHash: bcrypt.hashSync('secure_password_132', 10)
  },

  footer: {
    logoText: "devrobayad",
    copyrightText: "Robayad Hasan Jam. All rights reserved.",
    developerText: "Web Developer & AI Agent Developer",
    developerUrlLabel: "devrobayad.com",
    developerUrl: "https://devrobayad.com",
    headerLogoImg: "",
    footerLogoImg: "",
    siteTitle: "Robayad Hasan Jam - Portfolio",
    siteFavicon: "",
    customLinks: [
      { id: "fl_1", label: "Home", url: "#home" },
      { id: "fl_2", label: "About", url: "#about" },
      { id: "fl_3", label: "Skills", url: "#skills" },
      { id: "fl_4", label: "Projects", url: "#projects" },
      { id: "fl_5", label: "Services", url: "#services" },
      { id: "fl_6", label: "Contact", url: "#contact" }
    ],
    preloaderEnabled: true,
    preloaderType: "cyber-core",
    preloaderLogoUrl: "",
    preloaderDuration: 1500
  } as FooterData,

  counters: [
    { id: "cnt_1", value: "120+", label: "Happy Customers" },
    { id: "cnt_2", value: "250+", label: "Projects Completed" },
    { id: "cnt_3", value: "99%", label: "Success Rate" },
    { id: "cnt_4", value: "5+", label: "Years Experience" }
  ] as CounterItem[],

  services: [
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
    },
    {
      id: "srv-4",
      title: "React JS Applications",
      desc: "Ultra-fast, responsive Single Page Applications (SPAs) fueled by modern React Hooks, local states, smooth motion animations, and robust modular structures.",
      features: [
        "State management and reactive front-ends",
        "Vite compilers & asset optimization bundling",
        "Custom charts & analytical visualization interfaces",
        "Tailwind CSS styling and fluid user UX"
      ],
      icon: "Code2",
      color: "from-[#F59E0B] to-[#7C3AED]",
      badge: "React JS",
      targetConsultation: "Full-Stack Web Dev Consultation"
    },
    {
      id: "srv-5",
      title: "HTML, CSS, JS Frontend Layouts",
      desc: "Sleek, lightweight, pixel-perfect user interfaces built with pure HTML5, CSS3, and native JavaScript. Complete cross-browser compatibility and outstanding responsiveness.",
      features: [
        "Lightweight animations (motion & CSS transitions)",
        "Semantic SEO-friendly markup structures",
        "Fluid grid systems without framework weight",
        "Interactive forms with client-side validations"
      ],
      icon: "Flame",
      color: "from-[#10B981] to-[#06B6D4]",
      badge: "HTML/CSS/JS",
      targetConsultation: "General Tech Assessment Consultation"
    }
  ] as ServiceItem[],

  emailSettings: {
    senderEmail: "devrobayad.info@gmail.com",
    smtpPass: "",
    receiverEmail: "devrobayad.info@gmail.com",
    enableNotifications: true
  } as EmailSettings
};

// ==========================================
// 🚀 CLIENT FIREBASE SETUP
// ==========================================
let firebaseApp: any = null;
let db: any = null;
let auth: any = null;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(firebaseApp);
    console.log("Firebase client initialized successfully. Connected to Database ID:", firebaseConfig.firestoreDatabaseId);
  }
} catch (err) {
  console.warn("Could not auto-initialize Firebase client database. Falling back/running local engine.", err);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function compressImageIfNeeded(base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.75): Promise<string> {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return Promise.resolve(base64Str);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64Str;
    img.onload = () => {
      if (base64Str.includes('image/svg+xml') || base64Str.length < 50000) {
        resolve(base64Str);
        return;
      }
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas with transparent pixels first to ensure no default color is filled
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/jpeg';
        const match = base64Str.match(/^data:([^;]+);base64,/);
        if (match) {
          const detected = match[1];
          if (detected === 'image/png' || detected === 'image/gif') {
            mimeType = 'image/png';
          } else if (detected === 'image/webp') {
            mimeType = 'image/webp';
          }
        }

        let compressed;
        if (mimeType === 'image/png') {
          // PNG does not accept quality argument, so we call it with just the type to preserve native layout with transparency
          compressed = canvas.toDataURL('image/png');
        } else {
          compressed = canvas.toDataURL(mimeType, quality);
        }
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

// Generate standard clean identifier
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
}

export class ClientDB {
  private static cache: any = null;

  // Sync internal cache with LocalStorage & Firebase
  private static async getCache() {
    if (this.cache) return this.cache;

    // First load from localStorage to enable lightning fast renders
    const localS = localStorage.getItem('robayad_cms_cache');
    if (localS) {
      try {
        this.cache = JSON.parse(localS);
      } catch {
        this.cache = { ...DEFAULT_DB, bookings: [], messages: [] };
      }
    } else {
      this.cache = { ...DEFAULT_DB, bookings: [], messages: [] };
    }

    // Try to load state / restore from Firebase if active
    if (db) {
      try {
        const fetchSingleton = async (docId: string, defaultVal: any) => {
          const docPath = `settings/${docId}`;
          try {
            let snap;
            try {
              snap = await getDoc(doc(db, 'settings', docId));
            } catch (err: any) {
              handleFirestoreError(err, OperationType.GET, docPath);
            }
            if (snap && snap.exists()) {
              const cloudData = snap.data();
              const localData = this.cache[docId];
              // Compare updatedAt timestamps to protect newer local edits
              if (localData && localData.updatedAt && cloudData.updatedAt) {
                if (localData.updatedAt > cloudData.updatedAt) {
                  console.log(`Local version of settings/${docId} is newer. Syncing newer version back to Firestore.`);
                  try {
                    await setDoc(doc(db, 'settings', docId), localData);
                  } catch (writeErr) {
                    console.warn(`Failed to sync newer local settings/${docId} to Firestore:`, writeErr);
                  }
                  return localData;
                }
              }
              return cloudData;
            } else {
              const valToWrite = this.cache[docId] || defaultVal;
              try {
                await setDoc(doc(db, 'settings', docId), valToWrite);
              } catch (err: any) {
                handleFirestoreError(err, OperationType.WRITE, docPath);
              }
              return valToWrite;
            }
          } catch (e) {
            console.warn(`Firestore Singleton load failed for ${docPath}:`, e);
            return defaultVal;
          }
        };

        const fetchCollection = async (colId: string, localArray: any[], defaultArray: any[]) => {
          try {
            let querySnap;
            try {
              querySnap = await getDocs(collection(db, colId));
            } catch (err: any) {
              handleFirestoreError(err, OperationType.GET, colId);
            }
            if (querySnap && !querySnap.empty) {
              const cloudItems: any[] = [];
              querySnap.forEach(docSnap => {
                cloudItems.push(docSnap.data());
              });

              // Merge logic: Compare local and cloud timestamps
              const mergedMap = new Map<string, any>();
              const localItems = localArray || [];
              for (const localItem of localItems) {
                if (localItem && localItem.id) {
                  mergedMap.set(localItem.id, localItem);
                }
              }

              for (const cloudItem of cloudItems) {
                if (!cloudItem || !cloudItem.id) continue;
                const localItem = mergedMap.get(cloudItem.id);
                if (localItem) {
                  const localTime = localItem.updatedAt || 0;
                  const cloudTime = cloudItem.updatedAt || 0;
                  if (localTime > cloudTime) {
                    console.log(`Local item ${colId}/${localItem.id} is newer than Firestore. Syncing local version back.`);
                    try {
                      await setDoc(doc(db, colId, localItem.id), localItem);
                    } catch (writeErr) {
                      console.warn(`Failed to sync newer local item ${colId}/${localItem.id} to Firestore:`, writeErr);
                    }
                  } else {
                    mergedMap.set(cloudItem.id, cloudItem);
                  }
                } else {
                  mergedMap.set(cloudItem.id, cloudItem);
                }
              }

              return Array.from(mergedMap.values());
            } else {
              const finalArray = localArray && localArray.length > 0 ? localArray : defaultArray;
              for (const item of finalArray) {
                try {
                  const timestampedItem = { ...item, updatedAt: item.updatedAt || Date.now() };
                  await setDoc(doc(db, colId, item.id), timestampedItem);
                } catch (err: any) {
                  handleFirestoreError(err, OperationType.WRITE, `${colId}/${item.id}`);
                }
              }
              return finalArray;
            }
          } catch (e) {
            console.warn(`Firestore collection loading failed for /${colId}:`, e);
            return localArray || defaultArray;
          }
        };

        const cloudHero = await fetchSingleton('hero', this.cache.hero);
        const cloudAbout = await fetchSingleton('about', this.cache.about);
        const cloudSocial = await fetchSingleton('social', this.cache.social);
        const cloudFooter = await fetchSingleton('footer', this.cache.footer);
        const cloudPricing = await fetchSingleton('pricing', this.cache.pricing);
        const cloudAvailability = await fetchSingleton('availability', this.cache.availability);
        const cloudEmail = await fetchSingleton('email', this.cache.emailSettings || DEFAULT_DB.emailSettings);
        const cloudAdmin = await fetchSingleton('admin', this.cache.admin);

        const cloudSkills = await fetchCollection('skills', this.cache.skills, DEFAULT_DB.skills);
        const cloudProjects = await fetchCollection('projects', this.cache.projects, DEFAULT_DB.projects);
        const cloudCounters = await fetchCollection('counters', this.cache.counters, DEFAULT_DB.counters);
        const cloudServices = await fetchCollection('services', this.cache.services, DEFAULT_DB.services);
        
        // Fetch private items
        const cloudBookings = await fetchCollection('bookings', this.cache.bookings || [], []);
        const cloudMessages = await fetchCollection('messages', this.cache.messages || [], []);

        this.cache = {
          hero: cloudHero,
          about: cloudAbout,
          social: cloudSocial,
          footer: cloudFooter,
          pricing: cloudPricing,
          availability: cloudAvailability,
          emailSettings: cloudEmail,
          admin: cloudAdmin,
          skills: cloudSkills,
          projects: cloudProjects,
          counters: cloudCounters,
          services: cloudServices,
          bookings: cloudBookings,
          messages: cloudMessages
        };

        this.writeLocal();
      } catch (err) {
        console.warn("Failed overall background Firebase database sync:", err);
      }
    }

    return this.cache;
  }

  private static writeLocal() {
    if (this.cache) {
      localStorage.setItem('robayad_cms_cache', JSON.stringify(this.cache));
    }
  }

  private static async updateSingleton(docId: string, data: any) {
    const timestampedData = {
      ...data,
      updatedAt: Date.now()
    };
    if (this.cache) {
      this.cache[docId] = timestampedData;
      this.writeLocal();
    }
    if (db) {
      try {
        await setDoc(doc(db, 'settings', docId), timestampedData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `settings/${docId}`);
      }
    }
  }

  private static async deleteCollectionItem(colName: string, id: string) {
    if (this.cache && this.cache[colName]) {
      this.cache[colName] = this.cache[colName].filter((item: any) => item.id !== id);
      this.writeLocal();
    }
    if (db) {
      try {
        await deleteDoc(doc(db, colName, id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`);
      }
    }
  }

  private static async saveCollectionItem(colName: string, id: string, data: any) {
    const timestampedData = {
      ...data,
      updatedAt: Date.now()
    };
    if (this.cache) {
      if (!this.cache[colName]) this.cache[colName] = [];
      const index = this.cache[colName].findIndex((item: any) => item.id === id);
      if (index > -1) {
        this.cache[colName][index] = timestampedData;
      } else {
        this.cache[colName].push(timestampedData);
      }
      this.writeLocal();
    }
    if (db) {
      try {
        await setDoc(doc(db, colName, id), timestampedData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `${colName}/${id}`);
      }
    }
  }

  // ==========================================
  // ⚡ EXPOSED PUBLIC LOAD & UPDATE FUNCTIONS
  // ==========================================

  public static async loadAllData() {
    return await this.getCache();
  }

  public static async getHero() {
    const cache = await this.getCache();
    return cache.hero;
  }

  public static async updateHero(data: HeroData) {
    if (data && data.heroPhotoUrl) {
      data.heroPhotoUrl = await compressImageIfNeeded(data.heroPhotoUrl, 1200, 1200, 0.8);
    }
    await this.updateSingleton('hero', data);
  }

  public static async getAbout() {
    const cache = await this.getCache();
    return cache.about;
  }

  public static async updateAbout(data: AboutData) {
    if (data && data.bioPhoto) {
      data.bioPhoto = await compressImageIfNeeded(data.bioPhoto, 1000, 1000, 0.8);
    }
    await this.updateSingleton('about', data);
  }

  public static async getFooter() {
    const cache = await this.getCache();
    return cache.footer;
  }

  public static async updateFooter(data: FooterData) {
    if (data) {
      if (data.headerLogoImg) data.headerLogoImg = await compressImageIfNeeded(data.headerLogoImg, 400, 400, 0.85);
      if (data.footerLogoImg) data.footerLogoImg = await compressImageIfNeeded(data.footerLogoImg, 400, 400, 0.85);
      if (data.siteFavicon) data.siteFavicon = await compressImageIfNeeded(data.siteFavicon, 128, 128, 0.9);
      if (data.preloaderLogoUrl) data.preloaderLogoUrl = await compressImageIfNeeded(data.preloaderLogoUrl, 400, 400, 0.85);
    }
    await this.updateSingleton('footer', data);
  }

  public static async getSocial() {
    const cache = await this.getCache();
    return cache.social;
  }

  public static async updateSocial(data: SocialLinks) {
    await this.updateSingleton('social', data);
  }

  public static async getPricing() {
    const cache = await this.getCache();
    return cache.pricing;
  }

  public static async updatePricing(data: PricingState) {
    await this.updateSingleton('pricing', data);
  }

  public static async getAvailability() {
    const cache = await this.getCache();
    return cache.availability;
  }

  public static async updateAvailability(data: AvailabilitySettings) {
    await this.updateSingleton('availability', data);
  }

  public static async getEmailSettings() {
    const cache = await this.getCache();
    return cache.emailSettings || DEFAULT_DB.emailSettings;
  }

  public static async updateEmailSettings(data: EmailSettings) {
    const cache = await this.getCache();
    cache.emailSettings = data;
    await this.updateSingleton('email', data);
  }

  // Admin Verification Engine
  public static async verifyAdminLogin(usernameEntered: string, passwordEntered: string): Promise<{ success: boolean; error?: string }> {
    const cache = await this.getCache();
    const admin = cache.admin || DEFAULT_DB.admin;
    
    if (admin.username === usernameEntered) {
      const match = bcrypt.compareSync(passwordEntered, admin.passwordHash);
      if (match) {
        // Authenticated
        localStorage.setItem('admin_token', 'local_jwt_authorized_' + usernameEntered + '_' + Date.now());
        return { success: true };
      }
    }
    return { success: false, error: "Incorrect Username or Private Access Password Key!" };
  }

  public static async updateAdminCredentials(username: string, newPassword?: string) {
    const cache = await this.getCache();
    const admin = cache.admin || DEFAULT_DB.admin;
    admin.username = username.trim();
    if (newPassword && newPassword.trim()) {
      admin.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
    }
    await this.updateSingleton('admin', admin);
  }

  // Skills
  public static async getSkills(): Promise<Skill[]> {
    const cache = await this.getCache();
    return cache.skills;
  }

  public static async saveSkill(skill: Partial<Skill> & { id?: string }): Promise<Skill> {
    const cleanSkill: Skill = {
      id: skill.id || 's_' + generateId(),
      name: skill.name || '',
      category: skill.category || 'Frontend',
      icon: skill.icon || 'Code2'
    };
    await this.saveCollectionItem('skills', cleanSkill.id, cleanSkill);
    return cleanSkill;
  }

  public static async deleteSkill(id: string) {
    await this.deleteCollectionItem('skills', id);
  }

  // Projects
  public static async getProjects(): Promise<Project[]> {
    const cache = await this.getCache();
    return cache.projects;
  }

  public static async saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
    const thumbnail = project.thumbnail ? await compressImageIfNeeded(project.thumbnail, 800, 800, 0.8) : '';
    const cleanProject: Project = {
      id: project.id || 'p_' + generateId(),
      title: project.title || '',
      desc: project.desc || '',
      techTags: project.techTags || [],
      thumbnail: thumbnail,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      status: project.status || 'Active'
    };
    await this.saveCollectionItem('projects', cleanProject.id, cleanProject);
    return cleanProject;
  }

  public static async deleteProject(id: string) {
    await this.deleteCollectionItem('projects', id);
  }

  // Services
  public static async getServices(): Promise<ServiceItem[]> {
    const cache = await this.getCache();
    return cache.services;
  }

  public static async saveServices(services: ServiceItem[]) {
    const cache = await this.getCache();
    cache.services = services.map(s => ({
      ...s,
      id: s.id || 'srv_' + generateId()
    }));
    this.writeLocal();
    if (db) {
      for (const s of cache.services) {
        try {
          await setDoc(doc(db, 'services', s.id), s);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `services/${s.id}`);
        }
      }
    }
  }

  // Counters
  public static async getCounters(): Promise<CounterItem[]> {
    const cache = await this.getCache();
    return cache.counters;
  }

  public static async saveCounters(counters: CounterItem[]) {
    const cache = await this.getCache();
    cache.counters = counters.map(c => ({
      ...c,
      id: c.id || 'cnt_' + generateId()
    }));
    this.writeLocal();
    if (db) {
      for (const c of cache.counters) {
        try {
          await setDoc(doc(db, 'counters', c.id), c);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `counters/${c.id}`);
        }
      }
    }
  }

  // Messaging (Contact messages)
  public static async getMessages(): Promise<ContactMessage[]> {
    const cache = await this.getCache();
    return cache.messages || [];
  }

  public static async addMessage(msg: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>): Promise<ContactMessage> {
    const cache = await this.getCache();
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg_' + generateId(),
      read: false,
      createdAt: new Date().toISOString()
    };
    if (!cache.messages) cache.messages = [];
    cache.messages.unshift(newMsg);
    this.writeLocal();
    await this.saveCollectionItem('messages', newMsg.id, newMsg);
    return newMsg;
  }

  public static async markMessageRead(id: string, read: boolean): Promise<ContactMessage | null> {
    const cache = await this.getCache();
    const index = cache.messages.findIndex((m: any) => m.id === id);
    if (index === -1) return null;
    cache.messages[index].read = read;
    this.writeLocal();
    await this.saveCollectionItem('messages', id, cache.messages[index]);
    return cache.messages[index];
  }

  public static async saveMessageReply(id: string, reply: string): Promise<ContactMessage | null> {
    const cache = await this.getCache();
    const index = cache.messages.findIndex((m: any) => m.id === id);
    if (index === -1) return null;
    cache.messages[index].reply = reply;
    cache.messages[index].replyDate = new Date().toISOString();
    cache.messages[index].read = true;
    this.writeLocal();
    await this.saveCollectionItem('messages', id, cache.messages[index]);
    return cache.messages[index];
  }

  public static async deleteMessage(id: string) {
    await this.deleteCollectionItem('messages', id);
  }

  // Calendar Bookings
  public static async getBookings(): Promise<Booking[]> {
    const cache = await this.getCache();
    return cache.bookings || [];
  }

  public static async addBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    const cache = await this.getCache();
    const newBooking: Booking = {
      ...booking,
      id: 'bk_' + generateId(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    if (!cache.bookings) cache.bookings = [];
    cache.bookings.unshift(newBooking);
    this.writeLocal();
    await this.saveCollectionItem('bookings', newBooking.id, newBooking);
    return newBooking;
  }

  public static async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    const cache = await this.getCache();
    const index = cache.bookings.findIndex((b: any) => b.id === id);
    if (index === -1) return null;
    cache.bookings[index].status = status;
    this.writeLocal();
    await this.saveCollectionItem('bookings', id, cache.bookings[index]);
    return cache.bookings[index];
  }

  public static async saveBookingReply(id: string, reply: string): Promise<Booking | null> {
    const cache = await this.getCache();
    const index = cache.bookings.findIndex((b: any) => b.id === id);
    if (index === -1) return null;
    cache.bookings[index].reply = reply;
    cache.bookings[index].replyDate = new Date().toISOString();
    this.writeLocal();
    await this.saveCollectionItem('bookings', id, cache.bookings[index]);
    return cache.bookings[index];
  }

  public static async deleteBooking(id: string) {
    await this.deleteCollectionItem('bookings', id);
  }

  // Calculate available calendar slots dynamically on client
  public static async getSlotsForDate(date: string) {
    const cache = await this.getCache();
    const settings = cache.availability;
    const bookings = cache.bookings || [];
    const dayBookings = bookings.filter((b: any) => b.date === date && b.status !== 'Cancelled');

    // Custom overrides
    if (settings.customSlots && settings.customSlots[date]) {
      const customTimes = settings.customSlots[date] || [];
      if (customTimes.length === 0) {
        return { dayActive: false, slots: [], reason: 'No available slots designated for this date', services: settings.services };
      }
      const availableSlots = customTimes.filter((t: string) => !dayBookings.some((b: any) => b.time === t));
      return {
        dayActive: true,
        slots: availableSlots,
        services: settings.services,
        isCustomDate: true
      };
    }

    // Blocked dates checking
    if (settings.blockedDates && settings.blockedDates.includes(date)) {
      return { dayActive: false, slots: [], reason: 'Date is blocked by admin', services: settings.services };
    }

    // Weekly schedule checking
    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
    const dayName = utcDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase() as any;
    const dayConfig = settings.weeklySchedule ? settings.weeklySchedule[dayName] : null;

    if (!dayConfig || !dayConfig.active) {
      return { dayActive: false, slots: [], reason: 'Closed on this day of the week', services: settings.services };
    }

    // Max booking checks
    if (dayBookings.length >= settings.maxBookingsPerDay) {
      return { dayActive: false, slots: [], reason: 'Booking capacity reached for this day', services: settings.services };
    }

    const [startHour, startMin] = dayConfig.start.split(':').map(Number);
    const [endHour, endMin] = dayConfig.end.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    const duration = settings.slotDuration;
    const buffer = settings.bufferTime;
    const slotInterval = duration + buffer;

    const availableSlots: string[] = [];

    for (let mins = startTotalMinutes; mins + duration <= endTotalMinutes; mins += slotInterval) {
      const slotHour = Math.floor(mins / 60);
      const slotMin = mins % 60;
      const timeString = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;

      const isBooked = dayBookings.some((b: any) => b.time === timeString);
      if (!isBooked) {
        availableSlots.push(timeString);
      }
    }

    return {
      dayActive: true,
      slots: availableSlots,
      services: settings.services
    };
  }
}
