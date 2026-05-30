import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, getDocFromServer } from 'firebase/firestore';
import {
  utilCleanId,
  utilGenerateId
} from './utils/idGenerator';

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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
} from '../src/types';

interface DatabaseSchema {
  hero: HeroData;
  about: AboutData;
  skills: Skill[];
  projects: Project[];
  social: SocialLinks;
  footer?: FooterData; // Optional so old files build/load perfectly
  messages: ContactMessage[];
  pricing: PricingState;
  bookings: Booking[];
  availability: AvailabilitySettings;
  services?: ServiceItem[];
  emailSettings?: EmailSettings;
  counters?: CounterItem[];
  admin: {
    username: string;
    passwordHash: string;
  };
}

// Generate default admin password hash "secure_password_132"
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('secure_password_132', 10);

const DEFAULT_DB: DatabaseSchema = {
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
    email: "robayed.info@gmail.com",
    phone: "+8801640785053",
    address: "Dakshin-khan, Dhaka-1230, Bangladesh"
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
      "Full-Stack Web Dev Consultation",
      "AI Agent & LLM Workflow Integration",
      "Codebase Review & Optimization",
      "General Tech Assessment Consultation"
    ],
    maxBookingsPerDay: 5,
    customSlots: {}
  },
  admin: {
    username: "robayad",
    passwordHash: DEFAULT_PASSWORD_HASH
  },
  footer: {
    logoText: "devrobayad",
    copyrightText: "Robayad Hasan Jam. All rights reserved.",
    developerText: "Web Developer & AI Agent Developer",
    developerUrlLabel: "devrobayad.com",
    developerUrl: "https://devrobayad.com",
    headerLogoImg: "",
    footerLogoImg: ""
  },
  counters: [
    { id: "cnt_1", value: "120+", label: "Happy Customers" },
    { id: "cnt_2", value: "250+", label: "Projects Completed" },
    { id: "cnt_3", value: "99%", label: "Success Rate" },
    { id: "cnt_4", value: "5+", label: "Years Experience" }
  ]
};

// ==========================================
// 🔥 FIREBASE INITIALIZATION & SYNC UTILS
// ==========================================
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseApp: any = null;
let firestoreDb: any = null;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('[Firestore Error Details]: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    firebaseApp = initializeApp(config);
    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully on background server with Firestore Database ID:", config.firestoreDatabaseId);
  } catch (err) {
    console.error("Failed to initialize Firebase on backend server:", err);
  }
}

async function testConnection() {
  if (!firestoreDb) return;
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    console.log("Firebase Connection Verified: Initial test connection successful!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please verify your internet connection or Firebase setup.");
    } else {
      console.log("Firebase Server initialized under readiness protocol.");
    }
  }
}
testConnection();

export class LocalDB {
  private static syncing = false;

  private static initDB() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    }
  }

  private static read(): DatabaseSchema {
    this.initDB();
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return DEFAULT_DB;
    }
  }

  private static write(data: DatabaseSchema) {
    this.initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Background Cloud Push Helpers ---
  private static async pushSingleton(docId: string, data: any) {
    if (!firestoreDb) return;
    const pathName = `settings/${docId}`;
    try {
      await setDoc(doc(firestoreDb, 'settings', docId), data);
      console.log(`Cloud Sync: Successfully pushed singleton metadata directly to ${pathName}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, pathName);
    }
  }

  private static async pushCollectionItem(colName: string, id: string, data: any) {
    if (!firestoreDb) return;
    const pathName = `${colName}/${id}`;
    try {
      await setDoc(doc(firestoreDb, colName, id), data);
      console.log(`Cloud Sync: Pushed collection item direct to ${pathName}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, pathName);
    }
  }

  private static async deleteCollectionItem(colName: string, id: string) {
    if (!firestoreDb) return;
    const pathName = `${colName}/${id}`;
    try {
      await deleteDoc(doc(firestoreDb, colName, id));
      console.log(`Cloud Sync: Deleted collection item ${pathName}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, pathName);
    }
  }

  // --- Initial Synchronizer boot loader ---
  public static async pullFromFirestore() {
    if (!firestoreDb) {
      console.info("Sync Engine: Firebase isn't configured yet. Using local repository cache.");
      return;
    }
    if (this.syncing) return;
    this.syncing = true;
    console.log("Sync Engine: Restoring state from Cloud Firestore database...");
    try {
      const db = this.read();

      const syncSingleton = async (docId: string, defaultValue: any) => {
        try {
          const docRef = doc(firestoreDb, 'settings', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return docSnap.data();
          } else {
            await setDoc(docRef, defaultValue);
            return defaultValue;
          }
        } catch (e) {
          console.warn(`Sync Warning for singleton settings/${docId}:`, e);
          return defaultValue;
        }
      };

      db.hero = await syncSingleton('hero', db.hero || DEFAULT_DB.hero) as HeroData;
      db.about = await syncSingleton('about', db.about || DEFAULT_DB.about) as AboutData;
      db.social = await syncSingleton('social', db.social || DEFAULT_DB.social) as SocialLinks;
      db.footer = await syncSingleton('footer', db.footer || DEFAULT_DB.footer || {}) as FooterData;
      db.pricing = await syncSingleton('pricing', db.pricing || DEFAULT_DB.pricing) as PricingState;
      db.availability = await syncSingleton('availability', db.availability || DEFAULT_DB.availability) as AvailabilitySettings;
      db.admin = await syncSingleton('admin', db.admin || DEFAULT_DB.admin) as any;
      if (db.emailSettings) {
        db.emailSettings = await syncSingleton('email', db.emailSettings) as EmailSettings;
      } else {
        const emailVal = await syncSingleton('email', DEFAULT_DB.emailSettings || {}) as EmailSettings;
        if (emailVal && Object.keys(emailVal).length > 0) {
          db.emailSettings = emailVal;
        }
      }

      const pullCollection = async (colName: string, localArray: any[], defaultArray: any[]) => {
        try {
          const querySnap = await getDocs(collection(firestoreDb, colName));
          if (!querySnap.empty) {
            const items: any[] = [];
            querySnap.forEach(d => {
              items.push(d.data());
            });
            return items;
          } else if (localArray && localArray.length > 0) {
            for (const item of localArray) {
              await setDoc(doc(firestoreDb, colName, item.id), item);
            }
            return localArray;
          } else {
            for (const item of defaultArray) {
              await setDoc(doc(firestoreDb, colName, item.id), item);
            }
            return defaultArray;
          }
        } catch (e) {
          console.warn(`Sync Warning for collection ${colName}:`, e);
          return localArray || defaultArray;
        }
      };

      db.skills = await pullCollection('skills', db.skills, DEFAULT_DB.skills);
      db.projects = await pullCollection('projects', db.projects, DEFAULT_DB.projects);
      db.counters = await pullCollection('counters', db.counters || [], DEFAULT_DB.counters || []);
      db.services = await pullCollection('services', db.services || [], DEFAULT_DB.services || []);
      db.bookings = await pullCollection('bookings', db.bookings || [], DEFAULT_DB.bookings || []);
      db.messages = await pullCollection('messages', db.messages || [], DEFAULT_DB.messages || []);

      this.write(db);
      console.log("Sync Engine: Database completely synchronized with Cloud Firestore database!");
    } catch (error) {
      console.error("Critical Sync Engine Error during pullFromFirestore:", error);
    } finally {
      this.syncing = false;
    }
  }

  // --- API Methods ---

  public static getHero(): HeroData {
    return this.read().hero;
  }

  public static updateHero(hero: HeroData) {
    const db = this.read();
    db.hero = hero;
    this.write(db);
    this.pushSingleton('hero', hero);
  }

  public static getAbout(): AboutData {
    return this.read().about;
  }

  public static updateAbout(about: AboutData) {
    const db = this.read();
    db.about = about;
    this.write(db);
    this.pushSingleton('about', about);
  }

  public static getSkills(): Skill[] {
    return this.read().skills;
  }

  public static addSkill(skill: Omit<Skill, 'id'>): Skill {
    const db = this.read();
    const newSkill: Skill = {
      ...skill,
      id: utilGenerateId()
    };
    db.skills.push(newSkill);
    this.write(db);
    this.pushCollectionItem('skills', newSkill.id, newSkill);
    return newSkill;
  }

  public static updateSkill(id: string, updated: Partial<Skill>): Skill | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.skills.findIndex(s => utilCleanId(s.id) === cleanId);
    if (index === -1) return null;
    db.skills[index] = { ...db.skills[index], ...updated, id: db.skills[index].id };
    this.write(db);
    this.pushCollectionItem('skills', db.skills[index].id, db.skills[index]);
    return db.skills[index];
  }

  public static deleteSkill(id: string): boolean {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const beforeLength = db.skills.length;
    db.skills = db.skills.filter(s => utilCleanId(s.id) !== cleanId);
    this.write(db);
    this.deleteCollectionItem('skills', cleanId);
    return db.skills.length < beforeLength;
  }

  public static getProjects(): Project[] {
    return this.read().projects;
  }

  public static addProject(project: Omit<Project, 'id'>): Project {
    const db = this.read();
    const newProject: Project = {
      ...project,
      id: utilGenerateId()
    };
    db.projects.push(newProject);
    this.write(db);
    this.pushCollectionItem('projects', newProject.id, newProject);
    return newProject;
  }

  public static updateProject(id: string, updated: Partial<Project>): Project | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.projects.findIndex(p => utilCleanId(p.id) === cleanId);
    if (index === -1) return null;
    db.projects[index] = { ...db.projects[index], ...updated, id: db.projects[index].id };
    this.write(db);
    this.pushCollectionItem('projects', db.projects[index].id, db.projects[index]);
    return db.projects[index];
  }

  public static deleteProject(id: string): boolean {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const beforeLength = db.projects.length;
    db.projects = db.projects.filter(p => utilCleanId(p.id) !== cleanId);
    this.write(db);
    this.deleteCollectionItem('projects', cleanId);
    return db.projects.length < beforeLength;
  }

  public static getSocial(): SocialLinks {
    const db = this.read();
    let updated = false;
    if (!db.social) {
      db.social = { 
        github: '', 
        linkedin: '', 
        facebook: '', 
        email: '', 
        phone: '+8801640785053',
        address: 'Dakshin-khan, Dhaka-1230, Bangladesh',
        customChannels: [],
        contactItems: [
          { id: "cont_1", label: "phone", value: "+8801640785053", icon: "Phone" },
          { id: "cont_2", label: "email", value: "robayed.info@gmail.com", icon: "Mail" },
          { id: "cont_3", label: "address", value: "Dakshin-khan, Dhaka-1230, Bangladesh", icon: "MapPin" }
        ]
      };
      updated = true;
    } else {
      if (!db.social.customChannels) {
        db.social.customChannels = [];
        updated = true;
      }
      if (db.social.phone === undefined) {
        db.social.phone = '+8801640785053';
        updated = true;
      }
      if (db.social.address === undefined) {
        db.social.address = 'Dakshin-khan, Dhaka-1230, Bangladesh';
        updated = true;
      }
      if (!db.social.contactItems) {
        db.social.contactItems = [
          { id: "cont_1", label: "phone", value: db.social.phone || "+8801640785053", icon: "Phone" },
          { id: "cont_2", label: "email", value: db.social.email || "robayed.info@gmail.com", icon: "Mail" },
          { id: "cont_3", label: "address", value: db.social.address || "Dakshin-khan, Dhaka-1230, Bangladesh", icon: "MapPin" }
        ];
        updated = true;
      }
    }
    if (updated) {
      this.write(db);
      this.pushSingleton('social', db.social);
    }
    return db.social;
  }

  public static updateSocial(social: SocialLinks) {
    const db = this.read();
    db.social = social;
    this.write(db);
    this.pushSingleton('social', social);
  }

  public static getMessages(): ContactMessage[] {
    return this.read().messages;
  }

  public static addMessage(msg: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>): ContactMessage {
    const db = this.read();
    const newMessage: ContactMessage = {
      ...msg,
      id: utilGenerateId(),
      read: false,
      createdAt: new Date().toISOString()
    };
    db.messages.unshift(newMessage); // newest first
    this.write(db);
    this.pushCollectionItem('messages', newMessage.id, newMessage);
    return newMessage;
  }

  public static markMessageRead(id: string, read: boolean): ContactMessage | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.messages.findIndex(m => utilCleanId(m.id) === cleanId);
    if (index === -1) return null;
    db.messages[index].read = read;
    this.write(db);
    this.pushCollectionItem('messages', db.messages[index].id, db.messages[index]);
    return db.messages[index];
  }

  public static saveMessageReply(id: string, reply: string): ContactMessage | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.messages.findIndex(m => utilCleanId(m.id) === cleanId);
    if (index === -1) return null;
    db.messages[index].reply = reply;
    db.messages[index].replyDate = new Date().toISOString();
    db.messages[index].read = true; // automatic mark as read
    this.write(db);
    this.pushCollectionItem('messages', db.messages[index].id, db.messages[index]);
    return db.messages[index];
  }

  public static deleteMessage(id: string): boolean {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const beforeLength = db.messages.length;
    db.messages = db.messages.filter(m => utilCleanId(m.id) !== cleanId);
    this.write(db);
    this.deleteCollectionItem('messages', cleanId);
    return db.messages.length < beforeLength;
  }

  public static getPricing(): PricingState {
    return this.read().pricing;
  }

  public static updatePricing(pricing: PricingState) {
    const db = this.read();
    pricing.plans = pricing.plans.map(p => ({
      ...p,
      id: p.id || utilGenerateId()
    }));
    pricing.faq = pricing.faq.map(f => ({
      ...f,
      id: f.id || utilGenerateId()
    }));
    db.pricing = pricing;
    this.write(db);
    this.pushSingleton('pricing', pricing);
  }

  public static getBookings(): Booking[] {
    return this.read().bookings;
  }

  public static addBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Booking {
    const db = this.read();
    const newBooking: Booking = {
      ...booking,
      id: utilGenerateId(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    db.bookings.unshift(newBooking);
    this.write(db);
    this.pushCollectionItem('bookings', newBooking.id, newBooking);
    return newBooking;
  }

  public static updateBookingStatus(id: string, status: Booking['status']): Booking | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.bookings.findIndex(b => utilCleanId(b.id) === cleanId);
    if (index === -1) return null;
    db.bookings[index].status = status;
    this.write(db);
    this.pushCollectionItem('bookings', db.bookings[index].id, db.bookings[index]);
    return db.bookings[index];
  }

  public static saveBookingReply(id: string, reply: string): Booking | null {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const index = db.bookings.findIndex(b => utilCleanId(b.id) === cleanId);
    if (index === -1) return null;
    db.bookings[index].reply = reply;
    db.bookings[index].replyDate = new Date().toISOString();
    this.write(db);
    this.pushCollectionItem('bookings', db.bookings[index].id, db.bookings[index]);
    return db.bookings[index];
  }

  public static deleteBooking(id: string): boolean {
    const db = this.read();
    const cleanId = utilCleanId(id);
    const beforeLength = db.bookings.length;
    db.bookings = db.bookings.filter(b => utilCleanId(b.id) !== cleanId);
    this.write(db);
    this.deleteCollectionItem('bookings', cleanId);
    return db.bookings.length < beforeLength;
  }

  public static getAvailabilitySettings(): AvailabilitySettings {
    return this.read().availability;
  }

  public static updateAvailabilitySettings(settings: AvailabilitySettings) {
    const db = this.read();
    db.availability = settings;
    this.write(db);
    this.pushSingleton('availability', settings);
  }

  public static getFooter(): FooterData {
    const db = this.read();
    if (!db.footer) {
      db.footer = {
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
        ]
      };
      this.write(db);
    } else {
      let updated = false;
      if (db.footer.headerLogoImg === undefined) {
        db.footer.headerLogoImg = "";
        updated = true;
      }
      if (db.footer.footerLogoImg === undefined) {
        db.footer.footerLogoImg = "";
        updated = true;
      }
      if (db.footer.siteTitle === undefined) {
        db.footer.siteTitle = "Robayad Hasan Jam - Portfolio";
        updated = true;
      }
      if (db.footer.siteFavicon === undefined) {
        db.footer.siteFavicon = "";
        updated = true;
      }
      if (db.footer.customLinks === undefined) {
        db.footer.customLinks = [
          { id: "fl_1", label: "Home", url: "#home" },
          { id: "fl_2", label: "About", url: "#about" },
          { id: "fl_3", label: "Skills", url: "#skills" },
          { id: "fl_4", label: "Projects", url: "#projects" },
          { id: "fl_5", label: "Services", url: "#services" },
          { id: "fl_6", label: "Contact", url: "#contact" }
        ];
        updated = true;
      }
      if (updated) {
        this.write(db);
        this.pushSingleton('footer', db.footer);
      }
    }
    return db.footer;
  }

  public static updateFooter(footer: FooterData) {
    const db = this.read();
    db.footer = footer;
    this.write(db);
    this.pushSingleton('footer', footer);
  }

  public static getAdminUser() {
    return this.read().admin;
  }

  public static updateAdminCredentials(username: string, passwordPlain?: string) {
    const db = this.read();
    if (!db.admin) {
      db.admin = { username: 'robayad', passwordHash: DEFAULT_PASSWORD_HASH };
    }
    db.admin.username = username.trim();
    if (passwordPlain && passwordPlain.trim()) {
      db.admin.passwordHash = bcrypt.hashSync(passwordPlain.trim(), 10);
    }
    this.write(db);
    this.pushSingleton('admin', db.admin);
  }

  public static updateAdminPassword(passwordPlain: string) {
    const db = this.read();
    db.admin.passwordHash = bcrypt.hashSync(passwordPlain, 10);
    this.write(db);
    this.pushSingleton('admin', db.admin);
  }

  public static getServices(): ServiceItem[] {
    const db = this.read();
    if (!db.services) {
      db.services = [
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
      ];
      this.write(db);
    }
    return db.services;
  }

  public static updateServices(services: ServiceItem[]) {
    const db = this.read();
    db.services = services.map(s => ({
      ...s,
      id: s.id || utilGenerateId()
    }));
    this.write(db);
    if (firestoreDb && db.services) {
      db.services.forEach(s => {
        this.pushCollectionItem('services', s.id, s);
      });
    }
  }

  public static getEmailSettings(): EmailSettings {
    const db = this.read();
    if (!db.emailSettings) {
      db.emailSettings = {
        senderEmail: "devrobayad.info@gmail.com",
        smtpPass: "",
        receiverEmail: "devrobayad.info@gmail.com",
        enableNotifications: true
      };
      this.write(db);
    }
    return db.emailSettings;
  }

  public static updateEmailSettings(settings: EmailSettings) {
    const db = this.read();
    db.emailSettings = settings;
    this.write(db);
    this.pushSingleton('email', settings);
  }

  public static getCounters(): CounterItem[] {
    const db = this.read();
    if (!db.counters) {
      db.counters = [
        { id: "cnt_1", value: "120+", label: "Happy Customers" },
        { id: "cnt_2", value: "250+", label: "Projects Completed" },
        { id: "cnt_3", value: "99%", label: "Success Rate" },
        { id: "cnt_4", value: "5+", label: "Years Experience" }
      ];
      this.write(db);
    }
    return db.counters;
  }

  public static updateCounters(counters: CounterItem[]) {
    const db = this.read();
    db.counters = counters.map(c => ({
      id: c.id || "cnt_" + utilGenerateId(),
      value: c.value || "0",
      label: c.label || "Statistic"
    }));
    this.write(db);
    if (firestoreDb && db.counters) {
      db.counters.forEach(c => {
        this.pushCollectionItem('counters', c.id, c);
      });
    }
  }
}
