export interface HeroData {
  heading: string;
  typewriterTexts: string[];
  heroPhotoUrl?: string;
  heroPhotoWidth?: number;
  heroPhotoHeight?: number;
  heroPhotoFrame?: 'none' | 'circle-premium' | 'neon-glow' | 'sleek-card';
  heroPhotoBorderRadius?: 'none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  heroPhotoFullWidth?: boolean;
}

export interface HighlightCard {
  title: string;
  desc: string;
  icon: string;
}

export interface AboutData {
  bio: string;
  highlightCards: HighlightCard[];
  bioPhoto?: string;
  bioPhotoWidth?: number;
  bioPhotoHeight?: number;
  bioPhotoFrame?: 'none' | 'circle-premium' | 'neon-glow' | 'sleek-card';
  bioPhotoBorderRadius?: 'none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  bioPhotoFullWidth?: boolean;
  aboutMeEyebrow?: string;
  aboutMeTitle?: string;
  expertiseSubtitle?: string;
  methodologyTitle?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'AI & Agents' | 'Tools';
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  desc: string;
  techTags: string[];
  thumbnail: string;
  liveUrl?: string;
  githubUrl?: string; // empty means "Coming Soon" badge if empty
  status: 'Active' | 'Coming Soon';
}

export interface CustomSocialChannel {
  id: string;
  platform: string;
  url: string;
  iconType: 'lucide' | 'font-icon';
  iconValue: string;
  borderColor?: string;
}

export interface ContactInfoItem {
  id: string;
  label: string;
  value: string;
  icon: string; // e.g. Phone, Mail, MapPin, MessageCircle, etc.
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  facebook: string;
  email: string;
  phone?: string;
  address?: string;
  customChannels?: CustomSocialChannel[];
  contactItems?: ContactInfoItem[];
}

export interface FooterCustomLink {
  id: string;
  label: string;
  url: string;
}

export interface CounterItem {
  id: string;
  value: string;
  label: string;
}

export interface FooterData {
  logoText: string;
  copyrightText: string;
  developerText: string;
  developerUrlLabel: string;
  developerUrl: string;
  headerLogoImg?: string;
  footerLogoImg?: string;
  siteTitle?: string;
  siteFavicon?: string;
  customLinks?: FooterCustomLink[];
  cursorStyle?: 'system' | 'neon' | 'magnetic' | 'retro';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  reply?: string;
  replyDate?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  badgeLabel?: string;
  colorTheme: 'cyan' | 'purple' | 'pink';
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PricingState {
  plans: PricingPlan[];
  annualEnabled: boolean;
  faq: FAQItem[];
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  meetingType: 'Online' | 'In-Person';
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt?: string;
  reply?: string;
  replyDate?: string;
}

export interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface AvailabilitySettings {
  weeklySchedule: WeeklySchedule;
  slotDuration: 30 | 45 | 60;
  bufferTime: 0 | 15 | 30;
  blockedDates: string[]; // YYYY-MM-DD
  services: string[];
  maxBookingsPerDay: number;
  customSlots?: Record<string, string[]>; // YYYY-MM-DD -> ['09:00', '13:30']
}

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

export interface EmailSettings {
  senderEmail: string;
  smtpPass: string;
  receiverEmail: string;
  enableNotifications: boolean;
}


