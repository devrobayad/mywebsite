import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, User, LayoutDashboard, Sparkles, UserCheck, Flame, FolderGit, 
  Camera, Globe, Mail, DollarSign, CalendarCheck, Clock, LogOut, 
  Plus, Trash2, Edit2, CheckCircle2, XCircle, Eye, EyeOff, Loader2, FileText, Upload, HelpCircle,
  Calendar, Phone, ChevronUp, ChevronDown, Activity, MousePointer
} from 'lucide-react';
import { 
  HeroData, AboutData, Skill, Project, SocialLinks, FooterData, ContactMessage, 
  PricingState, PricingPlan, FAQItem, Booking, AvailabilitySettings, ServiceItem, CounterItem 
} from '../types';
import IconRenderer from './IconRenderer';
import { ClientDB } from '../lib/db';

interface AdminPanelProps {
  onLogout?: () => void;
  onDataChange?: () => void;
}

export default function AdminPanel({ onLogout, onDataChange }: AdminPanelProps) {
  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- CMS WORKSPACE SELECTED SECTIONS ---
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'skills' | 'projects' | 'services' | 'photo' | 'social' | 'messages' | 'cv' | 'pricing' | 'bookings' | 'availability' | 'footer' | 'cursor-theme' | 'counters' | 'email' | 'credentials'>('hero');

  // Email state variables
  const [senderEmail, setSenderEmail] = useState('devrobayad.info@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('devrobayad.info@gmail.com');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testLogs, setTestLogs] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  // Admin Reply States
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeBookingReplyId, setActiveBookingReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // admin credential update states
  const [adminUsername, setAdminUsername] = useState('robayad');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [updatingCredentials, setUpdatingCredentials] = useState(false);


  // --- CMS DATASETS STATES ---
  const [hero, setHero] = useState<HeroData>({ heading: '', typewriterTexts: [] });
  const [about, setAbout] = useState<AboutData>({ bio: '', highlightCards: [] });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [social, setSocial] = useState<SocialLinks>({ github: '', linkedin: '', facebook: '', email: '' });
  const [footer, setFooter] = useState<FooterData>({ logoText: '', copyrightText: '', developerText: '', developerUrlLabel: '', developerUrl: '' });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pricing, setPricing] = useState<PricingState>({ plans: [], annualEnabled: true, faq: [] });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null);
  const [counters, setCounters] = useState<CounterItem[]>([]);
  const [editingCounters, setEditingCounters] = useState<CounterItem[]>([]);
  const [savingCounters, setSavingCounters] = useState(false);

  // --- BADGE COUNTS ---
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

  // --- EDITORS ACTION MODALS OR TEMP INPUT STATES ---
  const [toast, setToast] = useState<{ status: 'success' | 'err'; text: string } | null>(null);
  
  // Skill creation inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState<Skill['category']>('Frontend');
  const [newSkillIcon, setNewSkillIcon] = useState('Flame');

  // Project creation inputs
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTags, setNewProjTags] = useState('');
  const [newProjLink, setNewProjLink] = useState('');
  const [newProjGit, setNewProjGit] = useState('');
  const [newProjThumb, setNewProjThumb] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<'Active' | 'Coming Soon'>('Active');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [adminProjectFilter, setAdminProjectFilter] = useState<string>('All');
  const [availableTechTags, setAvailableTechTags] = useState<string[]>([]);
  const [newQuickTagInput, setNewQuickTagInput] = useState('');

  // Dynamically compute selectable tags (built-in + custom + active from loaded projects)
  const allSelectableTags = useMemo(() => {
    const baseList = [
      'React JS', 'Tailwind CSS', 'WordPress Dev', 'WooCommerce', 
      'n8n Automation', 'Gemini API', 'PHP', 'Stripe API', 
      'Node.js', 'Express', 'Vite', 'HTML/CSS/JS', 'Web Design', 'Custom Plugin'
    ];
    const combined = new Set([...baseList, ...availableTechTags]);
    projects.forEach(p => {
      if (p.techTags && Array.isArray(p.techTags)) {
        p.techTags.forEach(tag => {
          if (tag) combined.add(tag);
        });
      }
    });
    return Array.from(combined);
  }, [availableTechTags, projects]);

  // FAQ item inputs
  const [newFaqQuest, setNewFaqQuest] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Availability temporary buffers
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newService, setNewService] = useState('');
  const [customSlotDate, setCustomSlotDate] = useState('');
  const [customSlotTime, setCustomSlotTime] = useState('');

  // File upload selectors
  const [photoProgress, setPhotoProgress] = useState(false);
  const [heroPhotoProgress, setHeroPhotoProgress] = useState(false);
  const [bioPhotoProgress, setBioPhotoProgress] = useState(false);
  const [cvProgress, setCvProgress] = useState(false);
  const [headerLogoProgress, setHeaderLogoProgress] = useState(false);
  const [footerLogoProgress, setFooterLogoProgress] = useState(false);
  const [faviconProgress, setFaviconProgress] = useState(false);
  const [preloaderLogoProgress, setPreloaderLogoProgress] = useState(false);
  const [projectImageProgress, setProjectImageProgress] = useState(false);

  // Footer custom links states
  const [newFooterLinkLabel, setNewFooterLinkLabel] = useState('');
  const [newFooterLinkUrl, setNewFooterLinkUrl] = useState('');
  const [editingFooterLinkId, setEditingFooterLinkId] = useState<string | null>(null);

  // Services form buffers
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvBadge, setSrvBadge] = useState('');
  const [srvConsultation, setSrvConsultation] = useState('');
  const [srvIcon, setSrvIcon] = useState('Globe');
  const [srvColor, setSrvColor] = useState('from-[#7C3AED] to-[#06B6D4]');
  const [srvFeaturesText, setSrvFeaturesText] = useState('');

  // Custom Social Channels temporary state buffers
  const [editingChanId, setEditingChanId] = useState<string | null>(null);
  const [chanPlatform, setChanPlatform] = useState('');
  const [chanUrl, setChanUrl] = useState('');
  const [chanIconType, setChanIconType] = useState<'lucide' | 'font-icon'>('lucide');
  const [chanIconValue, setChanIconValue] = useState('');
  const [chanBorderColor, setChanBorderColor] = useState('#06B6D4');

  // Custom contact items temporary state buffers
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactLabel, setContactLabel] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [contactIcon, setContactIcon] = useState('Phone');

  // Synchronize editing state when counters load
  useEffect(() => {
    if (counters && counters.length > 0) {
      setEditingCounters(counters);
    }
  }, [counters]);

  // Verification on mount
  useEffect(() => {
    const savedSection = sessionStorage.getItem('admin_active_section');
    if (savedSection) {
      setActiveSection(savedSection as any);
      sessionStorage.removeItem('admin_active_section');
    }
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Client-side local session verification
      if (token.startsWith('local_jwt_authorized_')) {
        setIsLoggedIn(true);
        loadCMSData();
      } else {
        localStorage.removeItem('admin_token');
      }
    }
  }, []);

  const triggerToast = (text: string, status: 'success' | 'err' = 'success') => {
    setToast({ text, status });
    setTimeout(() => setToast(null), 4000);
  };

  // --- API RETRIEVAL LOADER ---
  const loadCMSData = async () => {
    try {
      const data = await ClientDB.loadAllData();

      setHero(data.hero);
      setAbout(data.about);
      setSkills(data.skills || []);
      setProjects(data.projects || []);
      setServices(data.services || []);
      setSocial(data.social);
      setFooter(data.footer);
      setMessages(data.messages || []);
      setPricing(data.pricing);
      setBookings(data.bookings || []);
      setAvailability(data.availability);
      setCounters(data.counters || []);

      if (data.emailSettings) {
        setSenderEmail(data.emailSettings.senderEmail || 'devrobayad.info@gmail.com');
        setSmtpPass(data.emailSettings.smtpPass || '');
        setReceiverEmail(data.emailSettings.receiverEmail || 'devrobayad.info@gmail.com');
        setEnableNotifications(data.emailSettings.enableNotifications !== false);
      }

      // Counts counters
      setUnreadMsgCount((data.messages || []).filter((m: any) => !m.read).length);
      setPendingBookingCount((data.bookings || []).filter((b: any) => b.status === "Pending").length);

      // Invoke the parent scope state synchronization callback
      onDataChange?.();

    } catch (err) {
      console.error("Error loading admin portfolio datasets:", err);
    }
  };

  // --- SECURE LOGIN ACTIONS ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoginLoading(true);
    setLoginError(null);

    try {
      const result = await ClientDB.verifyAdminLogin(username, password);
      setLoginLoading(false);

      if (result.success) {
        setIsLoggedIn(true);
        loadCMSData();
        triggerToast("Login verified! Welcome back, Admin.");
      } else {
        setLoginError(result.error || 'Authentication rejected. Unauthorized.');
      }
    } catch {
      setLoginLoading(false);
      setLoginError('Server authentication failure.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    if (onLogout) onLogout();
  };

  // ==========================================
  // 💾 SECTION CMS UPDATE HANDLERS (JWT protected routes)
  // ==========================================

  const apiPUT = async (endpoint: string, payload: any) => {
    try {
      if (endpoint === '/api/hero') {
        await ClientDB.updateHero(payload);
      } else if (endpoint === '/api/about') {
        await ClientDB.updateAbout(payload);
      } else if (endpoint === '/api/footer') {
        await ClientDB.updateFooter(payload);
      } else if (endpoint === '/api/counters') {
        await ClientDB.saveCounters(payload.counters);
      } else if (endpoint === '/api/social') {
        await ClientDB.updateSocial(payload);
      } else if (endpoint === '/api/pricing') {
        await ClientDB.updatePricing(payload);
      } else if (endpoint === '/api/availability/settings') {
        await ClientDB.updateAvailability(payload);
      } else if (endpoint === '/api/email-settings') {
        await ClientDB.updateEmailSettings(payload);
      } else if (endpoint === '/api/services') {
        await ClientDB.saveServices(payload);
      }

      triggerToast("Settings saved successfully.");
      loadCMSData(); // Refresh datasets
    } catch {
      triggerToast("Connection error.", 'err');
    }
  };

  // Save Hero (1)
  const handleSaveHero = () => {
    apiPUT('/api/hero', hero);
  };

  // Save About Me Bio (2)
  const handleSaveAbout = () => {
    apiPUT('/api/about', about);
  };

  // Save Footer Customize Settings
  const handleSaveFooter = () => {
    apiPUT('/api/footer', footer);
  };

  // Save Stats Counters Settings
  const handleSaveCounters = (e: React.FormEvent) => {
    e.preventDefault();
    apiPUT('/api/counters', { counters: editingCounters });
  };

  const handleAddFooterLink = () => {
    if (!newFooterLinkLabel.trim() || !newFooterLinkUrl.trim()) {
      triggerToast("Please provide both label and URL for the link", "err");
      return;
    }
    const currentLinks = footer.customLinks || [];
    
    if (editingFooterLinkId) {
      // Update existing link
      const updated = currentLinks.map(link => 
        link.id === editingFooterLinkId 
          ? { ...link, label: newFooterLinkLabel.trim(), url: newFooterLinkUrl.trim() }
          : link
      );
      setFooter({ ...footer, customLinks: updated });
      setEditingFooterLinkId(null);
      triggerToast("Footer link updated locally. Save to apply.");
    } else {
      // Add new link
      const newLink = {
        id: 'fl_' + Date.now(),
        label: newFooterLinkLabel.trim(),
        url: newFooterLinkUrl.trim()
      };
      setFooter({ ...footer, customLinks: [...currentLinks, newLink] });
      triggerToast("Footer link added locally. Save to apply.");
    }
    setNewFooterLinkLabel('');
    setNewFooterLinkUrl('');
  };

  const handleEditFooterLink = (link: any) => {
    setEditingFooterLinkId(link.id);
    setNewFooterLinkLabel(link.label);
    setNewFooterLinkUrl(link.url);
  };

  const handleRemoveFooterLink = (id: string) => {
    const currentLinks = footer.customLinks || [];
    const filtered = currentLinks.filter(l => l.id !== id);
    setFooter({ ...footer, customLinks: filtered });
    if (editingFooterLinkId === id) {
      setEditingFooterLinkId(null);
      setNewFooterLinkLabel('');
      setNewFooterLinkUrl('');
    }
    triggerToast("Footer link removed locally. Save to apply.");
  };

  const handleMoveFooterLink = (index: number, direction: 'up' | 'down') => {
    const currentLinks = [...(footer.customLinks || [])];
    if (direction === 'up' && index > 0) {
      const temp = currentLinks[index];
      currentLinks[index] = currentLinks[index - 1];
      currentLinks[index - 1] = temp;
    } else if (direction === 'down' && index < currentLinks.length - 1) {
      const temp = currentLinks[index];
      currentLinks[index] = currentLinks[index + 1];
      currentLinks[index + 1] = temp;
    }
    setFooter({ ...footer, customLinks: currentLinks });
    triggerToast("Footer links reordered. Save to apply.");
  };

  // --- SERVICES CRUD HANDLERS ---
  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle || !srvDesc) {
      triggerToast("Please provide service title and description.", "err");
      return;
    }

    const featuresArray = srvFeaturesText.split('\n').map(t => t.trim()).filter(Boolean);

    let updatedServices: ServiceItem[] = [];

    if (editingServiceId) {
      // Edit mode
      updatedServices = services.map(s => s.id === editingServiceId ? {
        ...s,
        title: srvTitle,
        desc: srvDesc,
        badge: srvBadge,
        targetConsultation: srvConsultation,
        icon: srvIcon,
        color: srvColor,
        features: featuresArray
      } : s);
      triggerToast("Service edited locally. Make sure to click save to write to DB.");
    } else {
      // Create mode
      const newServiceItem: ServiceItem = {
        id: 'srv-custom-' + Math.random().toString(36).substr(2, 9),
        title: srvTitle,
        desc: srvDesc,
        badge: srvBadge,
        targetConsultation: srvConsultation,
        icon: srvIcon,
        color: srvColor,
        features: featuresArray
      };
      updatedServices = [...services, newServiceItem];
      triggerToast("New service added locally. Make sure to click save to write to DB.");
    }

    setServices(updatedServices);
    handleResetServiceForm();
  };

  const handleEditServiceSelect = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setSrvTitle(service.title);
    setSrvDesc(service.desc);
    setSrvBadge(service.badge || '');
    setSrvConsultation(service.targetConsultation || '');
    setSrvIcon(service.icon || 'Globe');
    setSrvColor(service.color || 'from-[#7C3AED] to-[#06B6D4]');
    setSrvFeaturesText(service.features ? service.features.join('\n') : '');
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    triggerToast("Service removed locally. Click save to write to DB.");
    if (editingServiceId === id) {
      handleResetServiceForm();
    }
  };

  const handleResetServiceForm = () => {
    setEditingServiceId(null);
    setSrvTitle('');
    setSrvDesc('');
    setSrvBadge('');
    setSrvConsultation('');
    setSrvIcon('Globe');
    setSrvColor('from-[#7C3AED] to-[#06B6D4]');
    setSrvFeaturesText('');
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= services.length) return;

    const list = [...services];
    const [moved] = list.splice(index, 1);
    list.splice(nextIndex, 0, moved);
    setServices(list);
    triggerToast("Services re-ordered locally. Click save to write to DB.");
  };

  const handleSaveServicesToDB = () => {
    apiPUT('/api/services', services);
  };

  // Skills Management (3)
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;

    try {
      await ClientDB.saveSkill({ name: newSkillName, category: newSkillCat, icon: newSkillIcon });
      triggerToast("Skill added.");
      setNewSkillName('');
      loadCMSData();
    } catch {
      triggerToast("Add skill failed", 'err');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await ClientDB.deleteSkill(id);
      triggerToast("Skill deleted.");
      loadCMSData();
    } catch {
      triggerToast("Delete skill failed.", 'err');
    }
  };

  // Project Management (4)
  const handleEditProjectClick = (proj: Project) => {
    setEditingProjectId(proj.id);
    setNewProjTitle(proj.title);
    setNewProjDesc(proj.desc);
    setNewProjTags(proj.techTags.join(', '));
    setNewProjLink(proj.liveUrl || '');
    setNewProjGit(proj.githubUrl || '');
    setNewProjThumb(proj.thumbnail || '');
    setNewProjStatus(proj.status || 'Active');
    
    const element = document.getElementById('project-form-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTags('');
    setNewProjLink('');
    setNewProjGit('');
    setNewProjThumb('');
    setNewProjStatus('Active');
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = newProjTags.split(',').map(t => t.trim()).filter(Boolean);
    const index = currentTags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }
    setNewProjTags(currentTags.join(', '));
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle || !newProjDesc) return;

    const tags = newProjTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (editingProjectId) {
        await ClientDB.saveProject({
          id: editingProjectId,
          title: newProjTitle,
          desc: newProjDesc,
          techTags: tags,
          liveUrl: newProjLink,
          githubUrl: newProjGit,
          thumbnail: newProjThumb,
          status: newProjStatus
        });
        triggerToast("Project updated successfully.");
        handleCancelProjectEdit();
        loadCMSData();
      } else {
        await ClientDB.saveProject({
          title: newProjTitle,
          desc: newProjDesc,
          techTags: tags,
          liveUrl: newProjLink,
          githubUrl: newProjGit,
          thumbnail: newProjThumb,
          status: newProjStatus
        });
        triggerToast("Project added.");
        handleCancelProjectEdit();
        loadCMSData();
      }
    } catch {
      triggerToast("Failed to save project.", 'err');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await ClientDB.deleteProject(id);
      triggerToast("Project removed.");
      loadCMSData();
    } catch {
      triggerToast("Failed to remove project.", 'err');
    }
  };

  // Save Social (6)
  const handleSaveSocial = () => {
    apiPUT('/api/social', social);
  };

  const handleAddCustomChannel = () => {
    if (!chanPlatform.trim()) {
      triggerToast("Platform name is required", "err");
      return;
    }
    if (!chanUrl.trim()) {
      triggerToast("URL is required", "err");
      return;
    }
    if (!chanIconValue.trim()) {
      triggerToast("Icon value is required", "err");
      return;
    }

    const newChan = {
      id: editingChanId || 'chan_' + Date.now(),
      platform: chanPlatform.trim(),
      url: chanUrl.trim(),
      iconType: chanIconType,
      iconValue: chanIconValue.trim(),
      borderColor: chanBorderColor
    };

    let updatedChannels = [...(social.customChannels || [])];
    if (editingChanId) {
      updatedChannels = updatedChannels.map(c => c.id === editingChanId ? newChan : c);
      triggerToast(`Custom channel "${chanPlatform}" updated! (Please click "Save Social Channels" to persist to database)`);
    } else {
      updatedChannels.push(newChan);
      triggerToast(`Custom channel "${chanPlatform}" added! (Please click "Save Social Channels" to persist to database)`);
    }

    setSocial({
      ...social,
      customChannels: updatedChannels
    });

    setEditingChanId(null);
    setChanPlatform('');
    setChanUrl('');
    setChanIconType('lucide');
    setChanIconValue('');
    setChanBorderColor('#06B6D4');
  };

  const handleDeleteCustomChannel = (id: string) => {
    const platformName = social.customChannels?.find(c => c.id === id)?.platform || "channel";
    const updatedChannels = (social.customChannels || []).filter(c => c.id !== id);
    setSocial({
      ...social,
      customChannels: updatedChannels
    });
    triggerToast(`Removed "${platformName}". (Please click "Save Social Channels" to persist)`);
  };

  const handleEditCustomChannel = (c: any) => {
    setEditingChanId(c.id);
    setChanPlatform(c.platform);
    setChanUrl(c.url);
    setChanIconType(c.iconType || 'lucide');
    setChanIconValue(c.iconValue);
    setChanBorderColor(c.borderColor || '#06B6D4');
    triggerToast(`Loaded "${c.platform}" to form. Modify details and click update.`);
  };

  const handleCancelCustomChannelEdit = () => {
    setEditingChanId(null);
    setChanPlatform('');
    setChanUrl('');
    setChanIconType('lucide');
    setChanIconValue('');
    setChanBorderColor('#06B6D4');
  };

  // --- CUSTOM CONTACT INFO ITEM CRUD HANDLERS ---
  const handleSaveContactItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactLabel.trim() || !contactValue.trim()) {
      triggerToast("Please fill in both label and value fields.", "err");
      return;
    }

    let updatedContacts = [...(social.contactItems || [])];
    const newContact = {
      id: editingContactId || 'cont_' + Date.now(),
      label: contactLabel.trim(),
      value: contactValue.trim(),
      icon: contactIcon || 'Phone'
    };

    if (editingContactId) {
      updatedContacts = updatedContacts.map(c => c.id === editingContactId ? newContact : c);
      triggerToast(`Contact item "${contactLabel}" updated! (Please click "Save Social Channels" below to persist)`);
    } else {
      updatedContacts.push(newContact);
      triggerToast(`Contact item "${contactLabel}" added! (Please click "Save Social Channels" below to persist)`);
    }

    setSocial({
      ...social,
      contactItems: updatedContacts
    });

    setEditingContactId(null);
    setContactLabel('');
    setContactValue('');
    setContactIcon('Phone');
  };

  const handleDeleteContactItem = (id: string) => {
    const labelName = social.contactItems?.find(c => c.id === id)?.label || "item";
    const updatedContacts = (social.contactItems || []).filter(c => c.id !== id);
    setSocial({
      ...social,
      contactItems: updatedContacts
    });
    triggerToast(`Removed "${labelName}" contact info. (Please click "Save Social Channels" below to persist)`);
  };

  const handleEditContactItem = (c: any) => {
    setEditingContactId(c.id);
    setContactLabel(c.label);
    setContactValue(c.value);
    setContactIcon(c.icon || 'Phone');
    triggerToast(`Loaded "${c.label}" to contact editor form.`);
  };

  const handleCancelContactItemEdit = () => {
    setEditingContactId(null);
    setContactLabel('');
    setContactValue('');
    setContactIcon('Phone');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // File Uploads: Photo (5)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      await ClientDB.updateAbout({ ...about, bioPhoto: base64 });
      setPhotoProgress(false);
      triggerToast("Profile photo uploaded correctly.");
      loadCMSData();
    } catch {
      setPhotoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // File Uploads: Hero Photo
  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroPhotoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setHeroPhotoProgress(false);
      triggerToast("Hero photo uploaded successfully.");
      setHero(prev => ({ ...prev, heroPhotoUrl: base64 }));
      await ClientDB.updateHero({ ...hero, heroPhotoUrl: base64 });
      loadCMSData();
    } catch {
      setHeroPhotoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  const handleRemoveHeroPhoto = () => {
    setHero(prev => ({
      ...prev,
      heroPhotoUrl: ''
    }));
    triggerToast("Hero photo removed. Please remember to click 'Save Hero Section' to apply change!");
  };

  const handleBioPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBioPhotoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setBioPhotoProgress(false);
      triggerToast("About bio photo uploaded successfully.");
      setAbout(prev => ({ ...prev, bioPhoto: base64 }));
      await ClientDB.updateAbout({ ...about, bioPhoto: base64 });
      loadCMSData();
    } catch {
      setBioPhotoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  const handleRemoveBioPhoto = () => {
    setAbout(prev => ({
      ...prev,
      bioPhoto: ''
    }));
    triggerToast("About bio photo removed. Remember to click 'Save Biography Bio' to apply change!");
  };

  // File Uploads: CV (8)
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setCvProgress(false);
      triggerToast("CV saved successfully.");
      setAbout(prev => ({ ...prev, cvUrl: base64 }));
      await ClientDB.updateAbout({ ...about, cvUrl: base64 });
      loadCMSData();
    } catch {
      setCvProgress(false);
      triggerToast("Upload failure.", 'err');
    }
  };

  // File Uploads: Header Logo
  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderLogoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setHeaderLogoProgress(false);
      triggerToast("Header logo image uploaded.");
      setFooter(prev => ({ ...prev, headerLogoImg: base64 }));
      await ClientDB.updateFooter({ ...footer, headerLogoImg: base64 });
      loadCMSData();
    } catch {
      setHeaderLogoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // File Uploads: Footer Logo
  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFooterLogoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setFooterLogoProgress(false);
      triggerToast("Footer logo image uploaded.");
      setFooter(prev => ({ ...prev, footerLogoImg: base64 }));
      await ClientDB.updateFooter({ ...footer, footerLogoImg: base64 });
      loadCMSData();
    } catch {
      setFooterLogoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // File Uploads: Favicon
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setFaviconProgress(false);
      triggerToast("Favicon dynamic asset uploaded.");
      setFooter(prev => ({ ...prev, siteFavicon: base64 }));
      await ClientDB.updateFooter({ ...footer, siteFavicon: base64 });
      loadCMSData();
    } catch {
      setFaviconProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // File Uploads: Preloader Custom Logo
  const handlePreloaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreloaderLogoProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setPreloaderLogoProgress(false);
      triggerToast("Preloader custom logo asset uploaded.");
      setFooter(prev => ({ ...prev, preloaderLogoUrl: base64 }));
      await ClientDB.updateFooter({ ...footer, preloaderLogoUrl: base64 });
      loadCMSData();
    } catch {
      setPreloaderLogoProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // File Uploads: Project Cover Image
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectImageProgress(true);
    try {
      const base64 = await fileToBase64(file);
      setProjectImageProgress(false);
      triggerToast("Project cover image uploaded successfully.");
      setNewProjThumb(base64);
    } catch {
      setProjectImageProgress(false);
      triggerToast("Upload interrupted.", 'err');
    }
  };

  // Contact Messages mark read/delete (7)
  const handleToggleMessageRead = async (id: string, readState: boolean) => {
    try {
      await ClientDB.markMessageRead(id, readState);
      loadCMSData();
    } catch {
      triggerToast("Failed to mark read state.", 'err');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await ClientDB.deleteMessage(id);
      triggerToast("Inquiry deleted from inbox.");
      loadCMSData();
    } catch {
      triggerToast("Failed to delete message.", 'err');
    }
  };

  const handleSendReplyMessage = async (id: string) => {
    if (!replyText || replyText.trim().length === 0) {
      triggerToast('Reply content cannot be empty!', 'err');
      return;
    }

    setReplyLoading(true);
    try {
      const msg = messages.find(m => m.id === id);
      if (!msg) {
        throw new Error("Message not found.");
      }

      await ClientDB.saveMessageReply(id, replyText);

      // Attempt to send a real email reply using user configured SMTP settings
      try {
        const emailSettings = {
          senderEmail,
          smtpPass,
          receiverEmail,
          enableNotifications: true
        };

        const res = await fetch('/api/send-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact',
            recipientName: msg.name,
            recipientEmail: msg.email,
            subject: msg.subject,
            originalMessage: msg.message,
            replyText: replyText,
            emailSettings
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Failed to mail client:", errData.error);
          triggerToast('Reply saved, but SMTP dispatch failed! Check your credentials.', 'err');
        } else {
          triggerToast('E-mail reply sent and logged successfully!');
        }
      } catch (mailErr) {
        console.error("Mail dispatch exception:", mailErr);
        triggerToast('Reply saved, but connection failed!', 'err');
      }

      setReplyText('');
      setActiveReplyId(null);
      loadCMSData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to reply message.', 'err');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSendReplyBooking = async (id: string) => {
    if (!replyText || replyText.trim().length === 0) {
      triggerToast('Reply content cannot be empty!', 'err');
      return;
    }

    setReplyLoading(true);
    try {
      const bObj = bookings.find(b => b.id === id);
      if (!bObj) {
        throw new Error("Booking not found.");
      }

      await ClientDB.saveBookingReply(id, replyText);

      // Attempt to send a real email reply using user configured SMTP settings
      try {
        const emailSettings = {
          senderEmail,
          smtpPass,
          receiverEmail,
          enableNotifications: true
        };

        const originalMsg = `Consultation Service: ${bObj.service}\nRequested Date: ${bObj.date}\nRequested Time Slot: ${bObj.time}\nFormat: ${bObj.meetingType}\nNotes: ${bObj.notes || 'None'}`;

        const res = await fetch('/api/send-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking',
            recipientName: bObj.name,
            recipientEmail: bObj.email,
            subject: `Your scheduled ${bObj.service} consultation details`,
            originalMessage: originalMsg,
            replyText: replyText,
            emailSettings
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Failed to mail client:", errData.error);
          triggerToast('Reply saved, but SMTP dispatch failed! Check your credentials.', 'err');
        } else {
          triggerToast('Booking update e-mail sent successfully!');
        }
      } catch (mailErr) {
        console.error("Mail dispatch exception:", mailErr);
        triggerToast('Reply saved, but connection failed!', 'err');
      }

      setReplyText('');
      setActiveBookingReplyId(null);
      loadCMSData();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to dispatch reply.', 'err');
    } finally {
      setReplyLoading(false);
    }
  };

  // Meeting Bookings (10)
  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      await ClientDB.updateBookingStatus(id, status);
      triggerToast(`Booking marked ${status}.`);
      loadCMSData();
    } catch {
      triggerToast("Update rejected.", 'err');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await ClientDB.deleteBooking(id);
      triggerToast("Booking removed.");
      loadCMSData();
    } catch {
      triggerToast("Delete rejected.", 'err');
    }
  };

  // Pricing plans updates (9)
  const handleUpdatePlanPrice = (pIdx: number, field: 'monthlyPrice' | 'annualPrice' | 'name' | 'badgeLabel' | 'colorTheme', val: any) => {
    const updatedPlans = [...pricing.plans];
    updatedPlans[pIdx] = {
      ...updatedPlans[pIdx],
      [field]: val
    };
    setPricing({ ...pricing, plans: updatedPlans });
  };

  const handleUpdatePlanFeature = (pIdx: number, featIdx: number, val: string) => {
    const updatedPlans = [...pricing.plans];
    const feats = [...updatedPlans[pIdx].features];
    feats[featIdx] = val;
    updatedPlans[pIdx] = { ...updatedPlans[pIdx], features: feats };
    setPricing({ ...pricing, plans: updatedPlans });
  };

  const handleAddPlanFeature = (pIdx: number) => {
    const updatedPlans = [...pricing.plans];
    const feats = [...updatedPlans[pIdx].features, 'New feature detail items'];
    updatedPlans[pIdx] = { ...updatedPlans[pIdx], features: feats };
    setPricing({ ...pricing, plans: updatedPlans });
  };

  const handleDeletePlanFeature = (pIdx: number, featIdx: number) => {
    const updatedPlans = [...pricing.plans];
    const feats = updatedPlans[pIdx].features.filter((_, idx) => idx !== featIdx);
    updatedPlans[pIdx] = { ...updatedPlans[pIdx], features: feats };
    setPricing({ ...pricing, plans: updatedPlans });
  };

  const handleAddPricingFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuest || !newFaqAnswer) return;

    const newItem: FAQItem = {
      id: Math.random().toString(36).substring(7),
      question: newFaqQuest,
      answer: newFaqAnswer
    };

    setPricing({
      ...pricing,
      faq: [...pricing.faq, newItem]
    });
    setNewFaqQuest('');
    setNewFaqAnswer('');
  };

  const handleDeletePricingFaq = (faqId: string) => {
    setPricing({
      ...pricing,
      faq: pricing.faq.filter(f => f.id !== faqId)
    });
  };

  const handleSavePricingPlans = () => {
    apiPUT('/api/pricing', pricing);
  };

  // Availability Updates (11)
  const handleToggleDayActive = (day: string) => {
    if (!availability) return;
    const ws = { ...availability.weeklySchedule };
    const dayName = day as keyof typeof ws;
    ws[dayName] = {
      ...ws[dayName],
      active: !ws[dayName].active
    };
    setAvailability({ ...availability, weeklySchedule: ws });
  };

  const handleUpdateDayTimes = (day: string, field: 'start' | 'end', val: string) => {
    if (!availability) return;
    const ws = { ...availability.weeklySchedule };
    const dayName = day as keyof typeof ws;
    ws[dayName] = {
      ...ws[dayName],
      [field]: val
    };
    setAvailability({ ...availability, weeklySchedule: ws });
  };

  const handleAddBlockedDate = () => {
    if (!availability || !newBlockedDate) return;
    if (availability.blockedDates.includes(newBlockedDate)) return;

    setAvailability({
      ...availability,
      blockedDates: [...availability.blockedDates, newBlockedDate]
    });
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (date: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      blockedDates: availability.blockedDates.filter(d => d !== date)
    });
  };

  const handleAddServicesOpt = () => {
    if (!availability || !newService) return;
    if (availability.services.includes(newService)) return;

    setAvailability({
      ...availability,
      services: [...availability.services, newService]
    });
    setNewService('');
  };

  const handleRemoveServicesOpt = (service: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      services: availability.services.filter(s => s !== service)
    });
  };

  const handleAddCustomSlot = () => {
    if (!availability || !customSlotDate || !customSlotTime) return;
    
    const currentCustomSlots = availability.customSlots || {};
    const existingDateSlots = currentCustomSlots[customSlotDate] || [];
    
    if (existingDateSlots.includes(customSlotTime)) return;
    
    const updatedDateSlots = [...existingDateSlots, customSlotTime].sort((a, b) => a.localeCompare(b));
    
    setAvailability({
      ...availability,
      customSlots: {
        ...currentCustomSlots,
        [customSlotDate]: updatedDateSlots
      }
    });

    setCustomSlotTime('');
  };

  const handleRemoveCustomSlot = (dateStr: string, timeStr: string) => {
    if (!availability) return;
    const currentCustomSlots = availability.customSlots || {};
    const existingDateSlots = currentCustomSlots[dateStr] || [];
    
    const updatedDateSlots = existingDateSlots.filter(t => t !== timeStr);
    const updatedCustomSlots = { ...currentCustomSlots };
    
    if (updatedDateSlots.length === 0) {
      delete updatedCustomSlots[dateStr];
    } else {
      updatedCustomSlots[dateStr] = updatedDateSlots;
    }
    
    setAvailability({
      ...availability,
      customSlots: updatedCustomSlots
    });
  };

  const handleDeleteCustomDate = (dateStr: string) => {
    if (!availability) return;
    const currentCustomSlots = availability.customSlots || {};
    const updatedCustomSlots = { ...currentCustomSlots };
    delete updatedCustomSlots[dateStr];
    
    setAvailability({
      ...availability,
      customSlots: updatedCustomSlots
    });
  };

  const handleSaveAvailabilitySettings = () => {
    if (!availability) return;
    apiPUT('/api/availability/settings', availability);
  };

  const handleSaveEmailSettings = () => {
    apiPUT('/api/email-settings', {
      senderEmail,
      smtpPass,
      receiverEmail,
      enableNotifications
    });
  };

  const handleSaveCredentials = async () => {
    if (!adminUsername.trim()) {
      triggerToast("Username cannot be empty.", "err");
      return;
    }
    if (adminPassword && adminPassword !== adminConfirmPassword) {
      triggerToast("Passwords do not match.", "err");
      return;
    }

    setUpdatingCredentials(true);
    
    try {
      await ClientDB.updateAdminCredentials(adminUsername.trim(), adminPassword.trim() || undefined);
      setUpdatingCredentials(false);
      triggerToast("Admin credentials updated successfully! Please login with your new credentials.");
      setAdminPassword('');
      setAdminConfirmPassword('');
      handleLogout();
    } catch (err: any) {
      setUpdatingCredentials(false);
      triggerToast(err.message || "Error updating credentials.", "err");
    }
  };

  const handleTestEmailSettings = async () => {
    setTestLoading(true);
    setTestLogs(null);
    setTestSuccess(null);
    try {
      const emailSettings = {
        senderEmail,
        smtpPass,
        receiverEmail,
        enableNotifications: true
      };
      
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          data: {
            name: "Portfolio SMTP Test",
            email: senderEmail,
            subject: "SMTP Setup Live Verification",
            message: "Success! This is a real SMTP verification email validating that your Gmail SMTP configuration and Google App Password on your portfolio website are functional and correct. Your contact messages and client meeting bookings will now deliver directly to your inbox!"
          },
          emailSettings
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || "Email delivery failed.");
      }

      setTestSuccess(true);
      setTestLogs(`Great news! A real SMTP verification email has been dispatched via smtp.gmail.com. Check the inbox of: ${receiverEmail}!`);
      triggerToast('Real test email dispatched successfully!');
    } catch (err: any) {
      setTestSuccess(false);
      setTestLogs(err.message || 'SMTP authentication or connection failure.');
      triggerToast('SMTP test failed. Please verify your App Password.', 'err');
    } finally {
      setTestLoading(false);
    }
  };


  // ==========================================
  // 🔐 RENDERS SECURED LOGIN PANEL
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center py-16 px-4">
        {/* Glowing Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#7C3AED]/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md glass-card border border-white/5 bg-[#1a1a2e]/80 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#06B6D4] to-[#EC4899] text-white flex items-center justify-center shadow-lg">
              <Lock size={22} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">devrobayad</h2>
            <p className="text-xs text-[#06B6D4] font-mono select-none uppercase tracking-widest font-semibold">
              Worskhops Crypt Auth
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#94A3B8]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="robayad"
                  className="w-full bg-[#0F0F1A]/90 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#94A3B8]">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0F0F1A]/90 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#94A3B8] hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <XCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] hover:brightness-110 text-white shadow-xl transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loginLoading && <Loader2 size={16} className="animate-spin" />}
              {loginLoading ? 'Authenticating Key...' : 'Verify Crypt Access'}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] text-[#94A3B8] leading-relaxed">
            Authorized administrator access keys required only. Rates limits are enforced (max 5 consecutive failures).
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 💻 RENDER CMS ADMINISTRATIVE DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-text">
      
      {/* Toast notifications panel */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-2 text-sm border font-medium ${
          toast.status === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-450 shadow-rose-500/5'
        }`}>
          {toast.status === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Control center header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">Admin CMS Dashboard</h2>
            <p className="text-xs text-[#06B6D4] font-mono font-medium">Configure portfolio components live</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-rose-500/20"
        >
          <LogOut size={13} />
          Logout Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Control Center Sidebar */}
        <div className="lg:col-span-3 glass-card border border-white/5 rounded-2xl p-4 flex flex-col space-y-1 select-none">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest pl-3 py-2 border-b border-white/5 mb-2 block">
            Settings Modules
          </span>

          {[
            { id: 'hero', label: '1. Hero & Tagline', icon: Sparkles },
            { id: 'about', label: '2. About Me', icon: UserCheck },
            { id: 'skills', label: '3. Skills List', icon: Flame },
            { id: 'projects', label: '4. Projects Box', icon: FolderGit },
            { id: 'services', label: '5. Services Offered', icon: Sparkles },
            { id: 'photo', label: '6. Profile Photo', icon: Camera },
            { id: 'social', label: '7. Social Links & Contacts', icon: Globe },
            { id: 'messages', label: '8. Messages Inbox', icon: Mail, count: unreadMsgCount },
            { id: 'cv', label: '9. CV / Resume', icon: FileText },
            { id: 'pricing', label: '10. FAQ Accordion', icon: HelpCircle },
            { id: 'bookings', label: '11. Meeting Bookings', icon: CalendarCheck, count: pendingBookingCount, highlight: true },
            { id: 'availability', label: '12. Availability Rules', icon: Clock },
            { id: 'footer', label: '13. Logo & Footer Settings', icon: FileText },
            { id: 'cursor-theme', label: '14. Interactive Cursor & Effects', icon: MousePointer },
            { id: 'counters', label: '15. Stats Counters', icon: Activity },
            { id: 'email', label: '16. Gmail SMTP Connect', icon: Mail },
            { id: 'credentials', label: '17. Admin Login & Security', icon: Lock }
          ].map((sec) => {
            const SelectedIcon = sec.icon;
            const isSel = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors focus:outline-none cursor-pointer ${
                  isSel 
                    ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/10 text-white border-l-4 border-[#06B6D4]' 
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SelectedIcon size={14} className={isSel ? 'text-[#06B6D4]' : 'text-[#94A3B8]'} />
                  <span>{sec.label}</span>
                </div>
                {sec.count !== undefined && sec.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    sec.highlight ? 'bg-orange-500/20 text-orange-400 font-bold' : 'bg-[#7C3AED]/20 text-[#06B6D4]'
                  }`}>
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COMPONENT: CMS Active Workspace */}
        <div className="lg:col-span-9 glass-card border border-white/5 rounded-2xl p-6 min-h-[60vh] flex flex-col justify-between">
          <div className="space-y-6">

            {/* SECTION 1: HERO & TAGLINE */}
            {activeSection === 'hero' && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Hero & Tagline Settings</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#94A3B8]">Heading</label>
                    <input
                      type="text"
                      value={hero.heading}
                      onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#94A3B8] block">Typewriter Dynamic Keywords (one per line)</label>
                    <textarea
                      rows={3}
                      value={hero.typewriterTexts.join('\n')}
                      onChange={(e) => setHero({ ...hero, typewriterTexts: e.target.value.split('\n').filter(Boolean) })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  {/* Hero Photo Settings Card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      🖼️ Hero Section Photo Editor
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Side: Upload / Paste controls */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#94A3B8] block">Upload Photo</label>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition hover:scale-102 flex items-center gap-2 cursor-pointer select-none">
                              <Upload size={14} className={heroPhotoProgress ? 'animate-spin' : ''} />
                              {heroPhotoProgress ? 'Uploading image...' : 'Choose PNG/JPG to upload'}
                              <input type="file" accept="image/*" onChange={handleHeroPhotoUpload} className="hidden" />
                            </label>

                            {hero.heroPhotoUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveHeroPhoto}
                                className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-450 cursor-pointer"
                              >
                                🗑️ Remove Photo
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#94A3B8]">Or Paste Photo URL</label>
                          <input
                            type="text"
                            placeholder="e.g., https://example.com/avatar.jpg"
                            value={hero.heroPhotoUrl || ''}
                            onChange={(e) => setHero({ ...hero, heroPhotoUrl: e.target.value })}
                            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Right Side: Visual Scaled Preview Frame */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0F0F1A]/80 border border-white/5 relative min-h-[140px]">
                        {hero.heroPhotoUrl ? (
                          <div className="relative group flex flex-col items-center">
                            <img
                              src={hero.heroPhotoUrl}
                              alt="Hero Preview Thumbnail"
                              className="max-h-[100px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg"
                              style={{ 
                                width: hero.heroPhotoWidth ? `${hero.heroPhotoWidth / 4}px` : 'auto', 
                                height: hero.heroPhotoHeight ? `${hero.heroPhotoHeight / 4}px` : 'auto' 
                              }}
                            />
                            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Scaled Preview (25% Size)</p>
                          </div>
                        ) : (
                          <div className="text-center space-y-1">
                            <p className="text-xs text-[#94A3B8] italic">No Hero photo uploaded/pasted.</p>
                            <p className="text-[10px] text-zinc-500">Outer space-grid will render only text column.</p>
                          </div>
                        )}
                      </div>
                    </div>



                    {/* Photo Frame Config Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/5">
                      {/* Frame Style Selection */}
                      <div className="space-y-1.5 bg-[#0F0F1A]/50 p-3 rounded-xl border border-white/5">
                        <label className="text-xs font-semibold text-[#94A3B8] block">Hero Photo Frame Style</label>
                        <select
                          value={hero.heroPhotoFrame || 'circle-premium'}
                          onChange={(e) => setHero({ ...hero, heroPhotoFrame: e.target.value as any })}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-[#06B6D4]"
                        >
                          <option value="none">None (Frameless, Borderless)</option>
                          <option value="circle-premium">Classic Premium Frame (Gradients & Vectors)</option>
                          <option value="neon-glow">Neon Glow Frame (Thin Cyan Line & Pulse Glow)</option>
                          <option value="sleek-card">Sleek Glass Card (Transparent Padded Backdrop)</option>
                        </select>
                      </div>

                      {/* Border Radius Selection */}
                      <div className="space-y-1.5 bg-[#0F0F1A]/50 p-3 rounded-xl border border-white/5">
                        <label className="text-xs font-semibold text-[#94A3B8] block">Custom Border Corner Radius</label>
                        <select
                          value={hero.heroPhotoBorderRadius || 'rounded-3xl'}
                          disabled={hero.heroPhotoFrame === 'circle-premium'}
                          onChange={(e) => setHero({ ...hero, heroPhotoBorderRadius: e.target.value as any })}
                          className={`w-full bg-[#0F0F1A] border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#06B6D4] ${
                            hero.heroPhotoFrame === 'circle-premium' ? 'text-zinc-500 cursor-not-allowed opacity-50' : 'text-zinc-300'
                          }`}
                        >
                          <option value="none">None (Sharp Corners)</option>
                          <option value="rounded-lg">Rounded Large (8px)</option>
                          <option value="rounded-xl">Rounded Extra Large (12px)</option>
                          <option value="rounded-2xl">Rounded 2XL (16px)</option>
                          <option value="rounded-3xl">Rounded 3XL (24px)</option>
                          <option value="rounded-full">Fully Circular / Capsule (Round)</option>
                        </select>
                      </div>
                    </div>

                  </div>

                </div>
                <button
                  onClick={handleSaveHero}
                  className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer"
                >
                  Save Hero Section
                </button>
              </div>
            )}

            {/* SECTION 2: ABOUT ME BIOGRAPHY */}
            {activeSection === 'about' && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">About Bio Editor</h3>
                <div className="space-y-4">
                  
                  {/* Dynamic Branding Texts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8] block">Section Eyebrow text</label>
                      <input
                        type="text"
                        value={about.aboutMeEyebrow || ''}
                        onChange={(e) => setAbout({ ...about, aboutMeEyebrow: e.target.value })}
                        placeholder="e.g. -- ABOUT ME"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8] block">Custom Title / Name</label>
                      <input
                        type="text"
                        value={about.aboutMeTitle || ''}
                        onChange={(e) => setAbout({ ...about, aboutMeTitle: e.target.value })}
                        placeholder="e.g. Robayad Hasan Jam"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8] block">Expertise capsules subtitle</label>
                      <input
                        type="text"
                        value={about.expertiseSubtitle || ''}
                        onChange={(e) => setAbout({ ...about, expertiseSubtitle: e.target.value })}
                        placeholder="e.g. Core Expertise areas:"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8] block">Methodology Pillars Title</label>
                      <input
                        type="text"
                        value={about.methodologyTitle || ''}
                        onChange={(e) => setAbout({ ...about, methodologyTitle: e.target.value })}
                        placeholder="e.g. Core Pillars of my Methodology"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#94A3B8]">Biography description paragraph</label>
                    <textarea
                      rows={6}
                      value={about.bio}
                      onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {/* About Photo Settings Card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      🖼️ About Section Photo Editor
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Side: Upload / Paste controls */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#94A3B8] block">Upload Photo</label>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition hover:scale-102 flex items-center gap-2 cursor-pointer select-none">
                              <Upload size={14} className={bioPhotoProgress ? 'animate-spin' : ''} />
                              {bioPhotoProgress ? 'Uploading image...' : 'Choose PNG/JPG to upload'}
                              <input type="file" accept="image/*" onChange={handleBioPhotoUpload} className="hidden" />
                            </label>

                            {about.bioPhoto && (
                              <button
                                type="button"
                                onClick={handleRemoveBioPhoto}
                                className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-450 cursor-pointer"
                              >
                                🗑️ Remove Photo
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#94A3B8]">Or Paste Photo URL</label>
                          <input
                            type="text"
                            placeholder="e.g., https://example.com/bio-picture.jpg"
                            value={about.bioPhoto || ''}
                            onChange={(e) => setAbout({ ...about, bioPhoto: e.target.value })}
                            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Right Side: Visual Scaled Preview Frame */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0F0F1A]/80 border border-white/5 relative min-h-[140px]">
                        {about.bioPhoto ? (
                          <div className="relative group flex flex-col items-center">
                            <img
                              src={about.bioPhoto}
                              alt="About Preview Thumbnail"
                              className="max-h-[100px] max-w-full rounded-lg object-contain border border-white/10 shadow-lg"
                              style={{ 
                                width: about.bioPhotoWidth ? `${about.bioPhotoWidth / 4}px` : 'auto', 
                                height: about.bioPhotoHeight ? `${about.bioPhotoHeight / 4}px` : 'auto' 
                              }}
                            />
                            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Scaled Preview (25% Size)</p>
                          </div>
                        ) : (
                          <div className="text-center space-y-1">
                            <p className="text-xs text-[#94A3B8] italic">No About photo uploaded/pasted.</p>
                            <p className="text-[10px] text-zinc-500">Outer space-grid will render default placeholder photo.</p>
                          </div>
                        )}
                      </div>
                    </div>



                    {/* Photo Frame Config Options for About Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/5">
                      {/* Frame Style Selection */}
                      <div className="space-y-1.5 bg-[#0F0F1A]/50 p-3 rounded-xl border border-white/5">
                        <label className="text-xs font-semibold text-[#94A3B8] block">Bio Photo Frame Style</label>
                        <select
                          value={about.bioPhotoFrame || 'circle-premium'}
                          onChange={(e) => setAbout({ ...about, bioPhotoFrame: e.target.value as any })}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-[#06B6D4]"
                        >
                          <option value="none">None (Frameless, Borderless)</option>
                          <option value="circle-premium">Classic Premium Frame (Double-glow & Border)</option>
                          <option value="neon-glow">Neon Glow Frame (Thin Cyan Line & Pulse Glow)</option>
                          <option value="sleek-card">Sleek Glass Card (Transparent Padded Backdrop)</option>
                        </select>
                      </div>

                      {/* Border Radius Selection */}
                      <div className="space-y-1.5 bg-[#0F0F1A]/50 p-3 rounded-xl border border-white/5">
                        <label className="text-xs font-semibold text-[#94A3B8] block">Custom Border Corner Radius</label>
                        <select
                          value={about.bioPhotoBorderRadius || 'rounded-[2.5rem]'}
                          disabled={about.bioPhotoFrame === 'circle-premium'}
                          onChange={(e) => setAbout({ ...about, bioPhotoBorderRadius: e.target.value as any })}
                          className={`w-full bg-[#0F0F1A] border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#06B6D4] ${
                            about.bioPhotoFrame === 'circle-premium' ? 'text-zinc-500 cursor-not-allowed opacity-50' : 'text-zinc-300'
                          }`}
                        >
                          <option value="none">None (Sharp Corners)</option>
                          <option value="rounded-lg">Rounded Large (8px)</option>
                          <option value="rounded-xl">Rounded Extra Large (12px)</option>
                          <option value="rounded-2xl">Rounded 2XL (16px)</option>
                          <option value="rounded-3xl">Rounded 3XL (24px)</option>
                          <option value="rounded-[2.5rem]">Elite Portrait Radius (40px)</option>
                          <option value="rounded-full">Fully Circular / Capsule (Round)</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Highlight Cards settings card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[#06B6D4]">
                      ✨ About Section Feature Highlights Card Manager
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]/80 leading-relaxed">
                      Customise key pillars of your expertise below. These appear as highly visual interactive cards alongside your bio!
                    </p>

                    <div className="space-y-3">
                      {(about.highlightCards || []).map((card, index) => (
                        <div key={index} className="p-3 bg-[#0F0F1A]/80 border border-white/5 rounded-xl space-y-2 relative group">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (about.highlightCards || []).filter((_, i) => i !== index);
                              setAbout({ ...about, highlightCards: updated });
                              triggerToast("Highlight card removed (Click 'Save Biography Bio' to sync changes)");
                            }}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-400 p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 transition text-xs"
                            title="Delete this highlight card"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Card #{index + 1}</div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-[#94A3B8]">Title</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const updated = [...(about.highlightCards || [])];
                                  updated[index] = { ...updated[index], title: e.target.value };
                                  setAbout({ ...about, highlightCards: updated });
                                }}
                                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                placeholder="e.g. AI Automation"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-[#94A3B8]">Icon Name (from Lucide library)</label>
                              <input
                                type="text"
                                value={card.icon}
                                onChange={(e) => {
                                  const updated = [...(about.highlightCards || [])];
                                  updated[index] = { ...updated[index], icon: e.target.value };
                                  setAbout({ ...about, highlightCards: updated });
                                }}
                                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                                placeholder="e.g. Sparkles, Globe, Code2, Flame, Layers"
                              />
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-semibold text-[#94A3B8]">Description</label>
                              <textarea
                                value={card.desc}
                                rows={2}
                                onChange={(e) => {
                                  const updated = [...(about.highlightCards || [])];
                                  updated[index] = { ...updated[index], desc: e.target.value };
                                  setAbout({ ...about, highlightCards: updated });
                                }}
                                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                                placeholder="Provide a short description of this expertise area..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(about.highlightCards || [])];
                          updated.push({ title: "New Feature", desc: "Short description of this skill card.", icon: "Sparkles" });
                          setAbout({ ...about, highlightCards: updated });
                          triggerToast("Added new highlight card placeholder!");
                        }}
                        className="w-full py-2 bg-gradient-to-r from-teal-500/10 to-[#06B6D4]/10 hover:from-teal-500/20 hover:to-[#06B6D4]/20 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} /> Add New Highlight Card
                      </button>
                    </div>
                  </div>

                </div>
                <button
                  onClick={handleSaveAbout}
                  className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer"
                >
                  Save Biography Bio
                </button>
              </div>
            )}

            {/* SECTION 3: SKILLS MANAGER */}
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Skills Manager</h3>

                {/* Add dynamic Skill */}
                <form onSubmit={handleAddSkill} className="glass-card bg-[#0F0F1A]/50 p-4 border border-white/5 rounded-xl space-y-4">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-[#06B6D4] uppercase block">
                    + Register New Skill item:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Skill name, e.g. SQL"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <select
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value as any)}
                      className="bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="AI & Agents">AI & Agents</option>
                      <option value="Tools">Tools</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Lucide Icon (e.g. Flame, Cup, Sparkles)"
                      value={newSkillIcon}
                      onChange={(e) => setNewSkillIcon(e.target.value)}
                      className="bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white bg-[#7C3AED] hover:brightness-110 text-xs font-semibold cursor-pointer"
                  >
                    Add Skill Element
                  </button>
                </form>

                {/* Skills list table */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold font-mono tracking-wider select-none text-[#94A3B8] uppercase block">
                    Current Registered Skills ({skills.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between bg-[#0F0F1A] p-3 rounded-xl border border-white/5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{skill.name}</p>
                          <p className="text-[10px] text-[#06B6D4] font-mono uppercase">{skill.category} ({skill.icon})</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-rose-450 hover:text-white rounded-lg transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: PROJECTS MANAGER */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div id="project-form-anchor" />
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Projects Deck</h3>

                {/* Create Project Dynamic Form */}
                <form onSubmit={handleAddProject} className="glass-card bg-[#0F0F1A]/55 p-4 border border-white/5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-[#EC4899] uppercase block">
                      {editingProjectId ? '✎ Edit Selected Project Info:' : '+ Add Project to Portfolio:'}
                    </span>
                    {editingProjectId && (
                      <button
                        type="button"
                        onClick={handleCancelProjectEdit}
                        className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 hover:border-rose-450 hover:bg-rose-500/10 text-rose-400 font-mono rounded"
                      >
                        Cancel Edit Mode
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400">PROJECT TITLE</label>
                      <input
                        type="text" required placeholder="Project Title"
                        value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-zinc-400">TECH LIST (COMMA SEPARATED)</label>
                        <span className="text-[9px] text-[#06B6D4] font-mono select-none">Optional: click tags below to toggle</span>
                      </div>
                      <input
                        type="text" placeholder="e.g. React JS, Tailwind CSS, Stripe API"
                        value={newProjTags} onChange={(e) => setNewProjTags(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    {/* Quick selectable Tags Deck */}
                    <div className="sm:col-span-2 space-y-3 p-4 bg-white/2 border border-white/5 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[10px] font-mono text-[#94A3B8] font-bold block">Quick Click-to-Add Tech Tags:</span>
                          <p className="text-[9px] text-[#94A3B8]/60 leading-none">Click to instantly toggle them on the active project tech list.</p>
                        </div>
                        {/* Dynamic Tag Creator */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <input
                            type="text"
                            placeholder="Add custom tag (e.g. Next.js)"
                            value={newQuickTagInput}
                            onChange={(e) => setNewQuickTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const tag = newQuickTagInput.trim();
                                if (!tag) return;
                                if (allSelectableTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                                  triggerToast("Tag already exists");
                                  return;
                                }
                                setAvailableTechTags(prev => [...prev, tag]);
                                handleToggleTag(tag);
                                setNewQuickTagInput('');
                                triggerToast(`Added custom tag: "${tag}"`);
                              }
                            }}
                            className="bg-[#0F0F1A] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#7C3AED] w-44 font-mono placeholder:text-zinc-650"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const tag = newQuickTagInput.trim();
                              if (!tag) return;
                              if (allSelectableTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                                triggerToast("Tag already exists");
                                return;
                              }
                              setAvailableTechTags(prev => [...prev, tag]);
                              handleToggleTag(tag);
                              setNewQuickTagInput('');
                              triggerToast(`Added custom tag: "${tag}"`);
                            }}
                            className="px-2.5 py-1 bg-[#7C3AED] hover:brightness-110 text-white font-bold text-[10px] rounded-lg cursor-pointer transition font-mono whitespace-nowrap"
                          >
                            + Add Tag
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allSelectableTags.map((tag) => {
                          const currentTags = newProjTags.split(',').map(t => t.trim().toLowerCase());
                          const isSelected = currentTags.includes(tag.toLowerCase());
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={`text-[10px] px-2.5 py-1 rounded border transition font-mono ${
                                isSelected
                                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#06B6D4] shadow-[0_0_8px_rgba(124,58,237,0.25)] font-bold'
                                  : 'bg-[#0F0F1A] border-white/5 text-zinc-400 hover:border-white/15'
                              }`}
                            >
                              {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400">LIVE PREVIEW LINK / CLIENT DOMAIN</label>
                      <input
                        type="text" placeholder="Live application URL (e.g. devrobayad.com)"
                        value={newProjLink} onChange={(e) => setNewProjLink(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400">SOURCE CODE PORTAL / GITHUB REPO</label>
                      <input
                        type="text" placeholder="Source repository (GitHub link)"
                        value={newProjGit} onChange={(e) => setNewProjGit(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Project Cover Image</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="text" placeholder="Thumbnail Image URL (Unsplash link or auto-filled via selector below)"
                          value={newProjThumb} onChange={(e) => setNewProjThumb(e.target.value)}
                          className="flex-grow bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                        />
                        <label className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#06B6D4] text-xs font-semibold rounded-xl text-white cursor-pointer transition">
                          <Upload size={14} className={projectImageProgress ? 'animate-spin' : ''} />
                          {projectImageProgress ? 'Uploading...' : 'Upload Custom Image'}
                          <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="hidden" />
                        </label>
                      </div>
                      {newProjThumb && (
                        <div className="flex items-center gap-3 bg-[#151528] p-2.5 rounded-xl border border-white/5 w-fit">
                          <div className="w-14 h-10 rounded overflow-hidden border border-white/10 bg-[#0F0F1A] shrink-0">
                            <img src={newProjThumb} alt="Project Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-white leading-none">Selected Cover Image</p>
                            <p className="text-[9px] font-mono text-[#94A3B8] mt-1 max-w-[250px] truncate">{newProjThumb}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400">PROJECT CORE DESCRIPTION</label>
                      <textarea
                        required placeholder="App description copy..." rows={2}
                        value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none sm:col-span-2 focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400">PUBLISHING STATUS</label>
                      <select
                        value={newProjStatus} onChange={(e) => setNewProjStatus(e.target.value as any)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      >
                        <option value="Active">Active status</option>
                        <option value="Coming Soon">Coming Soon style</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-[#7C3AED] hover:brightness-110 text-xs font-semibold cursor-pointer shadow-lg transition duration-200">
                      {editingProjectId ? 'Save Project Updates' : 'Publish Project Item'}
                    </button>
                    {editingProjectId && (
                      <button
                        type="button"
                        onClick={handleCancelProjectEdit}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Project lists with Dynamic Admin filter deck */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-[#94A3B8] uppercase block">
                      Published Deck List ({projects.length}):
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 font-mono tracking-wide">FILTER LIST BY TAG:</span>
                      {['All', 'React JS', 'WordPress Dev', 'n8n Automation', 'PHP', 'Stripe API', 'Gemini API'].map(tagOption => {
                        const isCurrentActive = adminProjectFilter === tagOption;
                        return (
                          <button
                            key={tagOption}
                            type="button"
                            onClick={() => setAdminProjectFilter(tagOption)}
                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-semibold transition border font-mono ${
                              isCurrentActive 
                                ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#06B6D4]' 
                                : 'bg-[#0F0F1A] border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {tagOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {projects
                      .filter(proj => {
                        if (adminProjectFilter === 'All') return true;
                        return proj.techTags.some(t => t.toLowerCase() === adminProjectFilter.toLowerCase());
                      })
                      .map((proj) => (
                        <div key={proj.id} className="flex items-center justify-between bg-[#0F0F1A] p-3 rounded-xl border border-white/5 hover:border-[#7C3AED]/20 transition-all duration-200 group">
                          <div className="min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white group-hover:text-[#06B6D4] transition-colors">{proj.title}</p>
                              <span className={`text-[9px] px-1.5 py-0.2 px-1 rounded-sm border ${
                                proj.status === 'Coming Soon' 
                                  ? 'bg-[#EC4899]/10 border-[#EC4899]/20 text-[#EC4899]' 
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                {proj.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8] truncate max-w-md mt-0.5">{proj.desc}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {proj.techTags.map((tag, i) => (
                                <span key={i} className="text-[8px] font-mono text-[#06B6D4] bg-white/5 border border-white/5 px-1 py-0.2 rounded font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditProjectClick(proj)}
                              className="p-1.5 hover:bg-[#06B6D4]/10 text-[#06B6D4] hover:text-[#06B6D4] rounded-lg transition"
                              title="Edit Project copy"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-455 hover:text-white rounded-lg transition"
                              title="Delete Project item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {projects.filter(proj => {
                      if (adminProjectFilter === 'All') return true;
                      return proj.techTags.some(t => t.toLowerCase() === adminProjectFilter.toLowerCase());
                    }).length === 0 && (
                      <div className="text-center py-8 text-xs text-zinc-500 bg-white/2 border border-white/5 rounded-xl font-mono">
                        No published projects matching "{adminProjectFilter}" filter tags.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES SECTION */}
            {activeSection === 'services' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">Services Offered Manager</h3>
                    <p className="text-xs text-zinc-400">Add, edit, design color gradients, and re-order portfolio services.</p>
                  </div>
                  <button
                    onClick={handleSaveServicesToDB}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  >
                    <CheckCircle2 size={14} />
                    Save Services list to DB
                  </button>
                </div>

                {/* Form Editor */}
                <form onSubmit={handleSaveServiceForm} className="glass-card bg-[#0F0F1A]/50 p-6 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold font-mono tracking-wider text-[#06B6D4] uppercase block">
                      {editingServiceId ? '✎ Edit Service Item' : '＋ Add New Service Item'}
                    </span>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={handleResetServiceForm}
                        className="text-xs text-zinc-400 hover:text-white underline"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Service Title</label>
                      <input
                        type="text"
                        required
                        value={srvTitle}
                        onChange={(e) => setSrvTitle(e.target.value)}
                        placeholder="e.g. Advanced AI Integration & Agents"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Accent Badge / Category</label>
                      <input
                        type="text"
                        value={srvBadge}
                        onChange={(e) => setSrvBadge(e.target.value)}
                        placeholder="e.g. AI & AUTOMATION"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Description text</label>
                      <textarea
                        required
                        rows={3}
                        value={srvDesc}
                        onChange={(e) => setSrvDesc(e.target.value)}
                        placeholder="End-to-end integration of LLMs like Gemini SDKs, workflow automation pipelines..."
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Booking Action Target Designation</label>
                      <input
                        type="text"
                        value={srvConsultation}
                        onChange={(e) => setSrvConsultation(e.target.value)}
                        placeholder="e.g. AI Workflow Consultation"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                      <span className="text-[9px] text-zinc-500 block leading-tight">Must match or map to your calendar option slot. Default triggers booking form preset.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lucide Icon name</label>
                      <select
                        value={srvIcon}
                        onChange={(e) => setSrvIcon(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Globe">Globe</option>
                        <option value="Database">Database</option>
                        <option value="Zap">Zap</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Flame">Flame</option>
                        <option value="Cpu">Cpu</option>
                        <option value="Code2">Code2</option>
                        <option value="GitBranch">GitBranch</option>
                        <option value="ShieldAlert">ShieldAlert</option>
                        <option value="Layers">Layers</option>
                        <option value="Lock">Lock</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Server">Server</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Activity">Activity</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Color Gradient Pattern</label>
                      <select
                        value={srvColor}
                        onChange={(e) => setSrvColor(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="from-[#7C3AED] to-[#06B6D4]">Purple to Cyan</option>
                        <option value="from-[#06B6D4] to-[#EC4899]">Cyan to Pink</option>
                        <option value="from-[#EC4899] to-[#7C3AED]">Pink to Purple</option>
                        <option value="from-[#F59E0B] to-[#7C3AED]">Amber to Purple</option>
                        <option value="from-[#10B981] to-[#06B6D4]">Emerald to Cyan</option>
                        <option value="from-[#EF4444] to-[#F59E0B]">Red to Amber</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Bullets Features list (one per line)</label>
                      <textarea
                        rows={4}
                        value={srvFeaturesText}
                        onChange={(e) => setSrvFeaturesText(e.target.value)}
                        placeholder="Interactive agents integration&#10;Custom vector databases (Pinecone, Chroma)&#10;Context window optimization features"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold cursor-pointer"
                    >
                      {editingServiceId ? 'Apply Changes locally' : '＋ Add Service locally'}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={handleResetServiceForm}
                        className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs"
                      >
                        Reset Form
                      </button>
                    )}
                  </div>
                </form>

                {/* Services List Table */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase block">
                    Current Services List ({services.length}) (Reorder, Edit, or Remove):
                  </span>
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {services.map((srv, idx) => (
                      <div key={srv.id} className="bg-[#0D0D19] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Reordering indicators */}
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveService(idx, 'up')}
                              className="p-1 hover:bg-white/5 text-zinc-500 hover:text-white rounded disabled:opacity-20"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === services.length - 1}
                              onClick={() => handleMoveService(idx, 'down')}
                              className="p-1 hover:bg-white/5 text-zinc-500 hover:text-white rounded disabled:opacity-20"
                              title="Move Down"
                            >
                              ▼
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white truncate">{srv.title}</p>
                              {srv.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-cyan-400 uppercase font-mono tracking-wider">
                                  {srv.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 leading-normal line-clamp-1 mt-0.5">{srv.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditServiceSelect(srv)}
                            className="p-2 hover:bg-sky-500/10 text-sky-400 hover:text-white rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-2 hover:bg-rose-500/10 text-rose-455 hover:text-white rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <div className="text-center py-8 text-xs text-zinc-500">
                        No custom services defined. Fallback items are displayed to website users until services are saved.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: PROFILE PIC UPLOADER */}
            {activeSection === 'photo' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Profile Avatar</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Upload a circular photo to host live on the server to represent Robayad Hasan Jam on the homepage bio card blocks. Max 5MB, JPG or PNG formats only.
                </p>

                <div className="flex items-center gap-6 pt-4">
                  <div className="w-24 h-24 rounded-full border border-white/10 overflow-hidden bg-[#1D1D35] shrink-0 select-none">
                    <img
                      src={(about as any)?.bioPhoto || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"}
                      alt="Current"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#white]/5 hover:bg-[#white]/10 border border-white/15 hover:border-[#06B6D4] text-xs font-semibold rounded-xl text-white cursor-pointer transition">
                      <Upload size={14} className={photoProgress ? 'animate-spin' : ''} />
                      {photoProgress ? 'Transmitting image...' : 'Choose PNG/JPG to upload'}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-[#94A3B8] font-mono leading-none">Accepted formats: .jpg, .png. Auto cropped.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: SOCIAL INTEGRATION CHANNELS */}
            {activeSection === 'social' && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-lg font-bold text-white">Social Channels</h3>
                  <p className="text-[#94A3B8] text-xs leading-none mt-1">Configure your primary and dynamic social platform handles.</p>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold text-[#06B6D4] uppercase tracking-wider">Primary Platforms</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">GitHub URL</label>
                      <input
                        type="text" value={social.github}
                        onChange={(e) => setSocial({ ...social, github: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">LinkedIn URL</label>
                      <input
                        type="text" value={social.linkedin}
                        onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Facebook URL</label>
                      <input
                        type="text" value={social.facebook}
                        onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Email Recipient Contact</label>
                      <input
                        type="email" value={social.email}
                        onChange={(e) => setSocial({ ...social, email: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Phone Number</label>
                      <input
                        type="text" value={social.phone || ''}
                        onChange={(e) => setSocial({ ...social, phone: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                        placeholder="e.g. +8801640785053"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Physical/Contact Address</label>
                      <input
                        type="text" value={social.address || ''}
                        onChange={(e) => setSocial({ ...social, address: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                        placeholder="e.g. Dakshin-khan, Dhaka-1230, Bangladesh"
                      />
                    </div>
                  </div>
                </div>

                {/* --- CUSTOM CONTACT CARDS SUB-MANAGER --- */}
                <div className="border-t border-white/5 pt-6 space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#06B6D4]">
                      <Phone size={14} className="text-[#06B6D4]" />
                      Custom Contact Info Cards Manager
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]/80 leading-relaxed mt-1 flex flex-col gap-1">
                      <span>Add custom contact information fields (e.g. WhatsApp, Business Email, Skype, Office Hours etc.) that display inside the client website contact tab. You can add, edit, or remove contact entries here!</span>
                      <span className="text-[#06B6D4] font-mono text-[10px] bg-[#06B6D4]/5 px-2 py-1 rounded inline-block self-start border border-[#06B6D4]/10">✨ Note: Click "Save All Channels & Links" below after making changes to persist them to the database!</span>
                    </p>
                  </div>

                  {/* List of Custom Contact Cards */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#94A3B8] font-bold block">Active Contact Info Cards:</span>
                    {(!social.contactItems || social.contactItems.length === 0) ? (
                      <p className="text-xs text-[#94A3B8] italic p-3 bg-white/2 border border-white/5 rounded-xl text-center">
                        No contact info cards declared. Drop some details using the form below!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {social.contactItems.map((c) => (
                          <div 
                            key={c.id} 
                            className="p-3 bg-[#0F0F1A]/70 border border-white/5 rounded-xl flex items-center justify-between gap-3 group relative hover:bg-[#0F0F1A]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30">
                                <IconRenderer name={c.icon} size={15} />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-zinc-400 block leading-snug">{c.label}</span>
                                <span className="text-[11px] text-white font-mono block truncate max-w-[180px]" title={c.value}>{c.value}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditContactItem(c)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/3 border border-white/5 hover:border-[#06B6D4] text-[#94A3B8] hover:text-white transition cursor-pointer"
                                title="Edit contact details"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteContactItem(c.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/3 border border-white/5 hover:border-[#EF4444] text-[#94A3B8] hover:text-red-400 transition cursor-pointer"
                                title="Remove this contact card"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form to insert / modify single contact item */}
                  <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                        {editingContactId ? '✏️ Edit Contact Entry Details' : '✨ Add New Contact Entry'}
                      </span>
                      {editingContactId && (
                        <button
                          type="button"
                          onClick={handleCancelContactItemEdit}
                          className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer font-mono"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Prebuilt Quick Contact Presets */}
                    {!editingContactId && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#94A3B8]/60 font-bold uppercase tracking-wider block">Contact Presets (Click to Auto-fill):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Work Phone', icon: 'Phone', value: '+8801XXXXXXXXX' },
                            { label: 'Secondary Email', icon: 'Mail', value: 'contact@example.com' },
                            { label: 'Office Address', icon: 'MapPin', value: 'Dhaka, Bangladesh' },
                            { label: 'WhatsApp', icon: 'MessageSquare', value: '+8801640785053' },
                            { label: 'Skype Call', icon: 'Video', value: 'live:cid.xxxxxxxxx' },
                            { label: 'Business Hours', icon: 'Clock', value: 'Sunday - Thursday (10 AM - 6 PM)' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                setContactLabel(item.label);
                                setContactValue(item.value);
                                setContactIcon(item.icon);
                                triggerToast(`Pre-filled "${item.label}" presets!`);
                              }}
                              className="px-2.5 py-1 bg-white/4 border border-white/5 hover:border-[#06B6D4] text-white text-[10px] rounded-lg transition-all font-mono hover:bg-[#06B6D4]/10 cursor-pointer"
                            >
                              +{item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name/Label of contact factor */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">Contact Label / Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Phone, Skype ID, Office Address"
                          value={contactLabel}
                          onChange={(e) => setContactLabel(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* Detail Value */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">Contact Value / Text</label>
                        <input
                          type="text"
                          placeholder="e.g. +8801640785053 or dhaka-1230"
                          value={contactValue}
                          onChange={(e) => setContactValue(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* Icon selector string */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">
                          Card Vector Icon (Lucide name)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Phone, Mail, MapPin, MessageSquare, Clock, Globe, Shield, Calendar, Sparkles"
                          value={contactIcon}
                          onChange={(e) => setContactIcon(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                        <p className="text-[10px] text-[#94A3B8]/60">
                          Capitalised standard Lucide vector keyword. Common: <span className="text-[#06B6D4]">Phone</span>, <span className="text-[#06B6D4]">Mail</span>, <span className="text-[#06B6D4]">MapPin</span>, <span className="text-[#06B6D4]">Clock</span>, <span className="text-[#06B6D4]">MessageSquare</span>, <span className="text-[#06B6D4]">Video</span>, <span className="text-[#06B6D4]">Globe</span>.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveContactItem}
                      className="w-full py-2 bg-gradient-to-r from-[#06B6D4]/30 to-[#7C3AED]/30 hover:from-[#06B6D4]/40 hover:to-[#7C3AED]/40 border border-white/10 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {editingContactId ? '💾 Save Contact Item Details' : '➕ Add Contact Item'}
                    </button>
                  </div>
                </div>

                {/* --- CUSTOM CHANNELS SUB-MANAGER --- */}
                <div className="border-t border-white/5 pt-6 space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#A78BFA]">
                      <Sparkles size={14} className="text-[#A78BFA]" />
                      Custom Extended Social Links & Site Font Icons
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]/80 leading-relaxed mt-1 flex flex-col gap-1">
                      <span>Add custom platforms (WhatsApp, Skype, Telegram, YouTube etc.) utilizing robust free Lucide vector names or Custom Site Font Classes (FontAwesome V6 is loaded!).</span>
                      <span className="text-amber-400 font-mono text-[10px] bg-amber-400/5 px-2 py-1 rounded inline-block self-start border border-amber-400/10">✨ Note: Click "Save All Channels & Links" below after making custom changes to save them to the database!</span>
                    </p>
                  </div>

                  {/* List of Custom Channels */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#94A3B8] font-bold block">Active Custom Channels:</span>
                    {(!social.customChannels || social.customChannels.length === 0) ? (
                      <p className="text-xs text-[#94A3B8] italic p-3 bg-white/2 border border-white/5 rounded-xl text-center">
                        No custom extended social channels declared yet. Use the wizard form below to build your first one!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {social.customChannels.map((c) => (
                          <div 
                            key={c.id} 
                            style={{ borderColor: `${c.borderColor || '#06B6D4'}25` }}
                            className="p-3 bg-[#0F0F1A]/70 border rounded-xl flex items-center justify-between gap-3 group relative hover:bg-[#0F0F1A]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0"
                                style={{ 
                                  backgroundColor: `${c.borderColor || '#06B6D4'}15`, 
                                  color: c.borderColor || '#06B6D4',
                                  border: `1px solid ${c.borderColor || '#06B6D4'}30`
                                }}
                              >
                                {c.iconType === 'lucide' ? (
                                  <IconRenderer name={c.iconValue} size={15} />
                                ) : (
                                  <i className={`${c.iconValue} text-xs`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-white block leading-snug">{c.platform}</span>
                                <span className="text-[10px] text-zinc-500 font-mono block truncate max-w-[160px]" title={c.url}>{c.url}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditCustomChannel(c)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/3 border border-white/5 hover:border-[#06B6D4] text-[#94A3B8] hover:text-white transition cursor-pointer"
                                title="Edit platform details"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomChannel(c.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/3 border border-white/5 hover:border-[#EF4444] text-[#94A3B8] hover:text-red-400 transition cursor-pointer"
                                title="Remove this channel"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form to insert / modify single channel */}
                  <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                        {editingChanId ? '✏️ Edit Custom Channel Details' : '✨ Add New Custom Channel'}
                      </span>
                      {editingChanId && (
                        <button
                          type="button"
                          onClick={handleCancelCustomChannelEdit}
                          className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer font-mono"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Prebuilt Quick Presets Deck option */}
                    {!editingChanId && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#94A3B8]/60 font-bold uppercase tracking-wider block">Quick Presets (Click to Auto-fill):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'WhatsApp', iconType: 'font-icon', iconValue: 'fab fa-whatsapp', color: '#25D366', placeholder: 'https://wa.me/8801XXXXXXXXX' },
                            { name: 'Telegram', iconType: 'font-icon', iconValue: 'fab fa-telegram', color: '#0088cc', placeholder: 'https://t.me/yourusername' },
                            { name: 'YouTube', iconType: 'lucide', iconValue: 'Youtube', color: '#FF0000', placeholder: 'https://youtube.com/@channel' },
                            { name: 'Instagram', iconType: 'lucide', iconValue: 'Instagram', color: '#E1306C', placeholder: 'https://instagram.com/profile' },
                            { name: 'Skype', iconType: 'font-icon', iconValue: 'fab fa-skype', color: '#00AFF0', placeholder: 'skype:username?chat' },
                            { name: 'Twitter / X', iconType: 'font-icon', iconValue: 'fab fa-x-twitter', color: '#ffffff', placeholder: 'https://x.com/username' },
                            { name: 'Pinterest', iconType: 'font-icon', iconValue: 'fab fa-pinterest-p', color: '#BD081C', placeholder: 'https://pinterest.com/username' },
                            { name: 'Phone Service', iconType: 'lucide', iconValue: 'Phone', color: '#34D399', placeholder: 'tel:+8801XXXXXXXXX' }
                          ].map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                setChanPlatform(item.name);
                                setChanUrl(item.placeholder);
                                setChanIconType(item.iconType as any);
                                setChanIconValue(item.iconValue);
                                setChanBorderColor(item.color);
                                triggerToast(`Pre-filled "${item.name}" presets!`);
                              }}
                              className="px-2.5 py-1 bg-white/4 border border-white/5 hover:border-[#06B6D4] text-white text-[10px] rounded-lg transition-all font-mono hover:bg-[#06B6D4]/10 cursor-pointer"
                            >
                              +{item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name of platform */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">Platform Name</label>
                        <input
                          type="text"
                          placeholder="e.g. WhatsApp, Discord, YouTube"
                          value={chanPlatform}
                          onChange={(e) => setChanPlatform(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">URL Address</label>
                        <input
                          type="text"
                          placeholder="e.g. https://wa.me/XXXXXXXX"
                          value={chanUrl}
                          onChange={(e) => setChanUrl(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* Icon Type Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8] block">Icon Architecture Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setChanIconType('lucide')}
                            className={`py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                              chanIconType === 'lucide'
                                ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED] font-bold'
                                : 'bg-[#0F0F1A] border-white/5 text-[#94A3B8] hover:border-white/10'
                            }`}
                          >
                            🎨 Lucide Icon
                          </button>
                          <button
                            type="button"
                            onClick={() => setChanIconType('font-icon')}
                            className={`py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                              chanIconType === 'font-icon'
                                ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4] font-bold'
                                : 'bg-[#0F0F1A] border-white/5 text-[#94A3B8] hover:border-white/10'
                            }`}
                          >
                            💬 Site Font Icon
                          </button>
                        </div>
                      </div>

                      {/* Highlights Border/Hover Color */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">Highlight/Action Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={chanBorderColor}
                            onChange={(e) => setChanBorderColor(e.target.value)}
                            className="bg-transparent border-0 cursor-pointer w-8 h-8 rounded shrink-0 p-0"
                          />
                          <input
                            type="text"
                            value={chanBorderColor}
                            onChange={(e) => setChanBorderColor(e.target.value)}
                            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Icon Value Input */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-[#94A3B8]">
                          {chanIconType === 'lucide' ? 'Lucide Icon Name' : 'Font CSS Class (e.g. FontAwesome Classes)'}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            chanIconType === 'lucide' 
                              ? "e.g. Link2, Sparkles, Youtube, Phone, PhoneCall, HelpCircle" 
                              : "e.g. fab fa-whatsapp, fas fa-phone-alt, fab fa-skype, fab fa-telegram"
                          }
                          value={chanIconValue}
                          onChange={(e) => setChanIconValue(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                        <div className="text-[10px] text-[#94A3B8]/60 leading-tight">
                          {chanIconType === 'lucide' ? (
                            <span>
                              Type any standard capitalized Lucide icon name (e.g. <span className="text-[#06B6D4]">Twitch</span>, <span className="text-[#06B6D4]">Compass</span>, <span className="text-[#06B6D4]">Globe</span>).
                            </span>
                          ) : (
                            <span>
                              Type standard FontAwesome CSS utility icons loaded on the page (e.g. <span className="text-[#06B6D4]">fab fa-whatsapp</span>, <span className="text-[#06B6D4]">fab fa-telegram</span>, <span className="text-[#06B6D4]">fas fa-envelope-open-text</span>).
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomChannel}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {editingChanId ? '💾 Update Custom Channel' : '➕ Add Custom Channel'}
                    </button>
                  </div>
                </div>

                {/* Final Persistence Button */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-mono italic select-none">
                    * Click Save below to store all channels permanently on database!
                  </p>
                  <button
                    onClick={handleSaveSocial}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.2)] ml-auto animate-pulse hover:animate-none"
                  >
                    Save All Channels & Links
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 7: MESSAGE INBOX LISTS */}
            {activeSection === 'messages' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Contact Messages Inbox</h3>
                
                {messages.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic select-none">Your inbox is completely empty.</p>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div 
                        key={m.id} 
                        className={`p-4 rounded-xl border flex flex-col space-y-2 transition-all ${
                          m.read 
                            ? 'bg-[#0F0F1A]/50 border-white/5 opacity-70' 
                            : 'bg-[#1A1A2E]/50 border-[#06B6D4]/30 shadow-[0_0_15px_rgba(6,182,212,0.04)]-glow'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div>
                            <p className="text-xs font-bold text-white">{m.name} (<a href={`mailto:${m.email}`} className="text-[#06B6D4] hover:underline font-mono">{m.email}</a>)</p>
                            <p className="text-[10px] font-mono text-[#94A3B8]">{new Date(m.createdAt).toLocaleString()}</p>
                            <p className="text-xs font-semibold text-white mt-1">Sub: {m.subject}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleMessageRead(m.id, !m.read)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase border ${
                                m.read 
                                  ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' 
                                  : 'bg-[#06B6D4]/10 border-[#06B6D4]/25 text-[#06B6D4] hover:bg-[#06B6D4]/20'
                              }`}
                            >
                              {m.read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-450 hover:text-white rounded-lg transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-[#0F0F1A]/85 p-3 rounded-lg border border-white/5 leading-relaxed shrink-0">
                          {m.message}
                        </p>

                        {m.reply && (
                          <div className="mt-2 text-xs bg-[#7C3AED]/5 border border-[#7C3AED]/20 p-3 rounded-xl text-slate-300">
                            <div className="flex items-center justify-between text-[10px] text-[#A78BFA] font-bold mb-1">
                              <span>↩️ SENT EMAIL REPLY:</span>
                              {m.replyDate && <span>{new Date(m.replyDate).toLocaleString()}</span>}
                            </div>
                            <p className="whitespace-pre-wrap">{m.reply}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-1 items-center justify-start select-none">
                          {!m.reply && activeReplyId !== m.id && (
                            <button
                              onClick={() => {
                                setActiveReplyId(m.id);
                                setReplyText('');
                              }}
                              className="text-[10px] font-bold text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 hover:border-[#06B6D4]/30"
                            >
                              ✍️ Reply to Message
                            </button>
                          )}
                          {m.reply && activeReplyId !== m.id && (
                            <button
                              onClick={() => {
                                setActiveReplyId(m.id);
                                setReplyText(m.reply || '');
                              }}
                              className="text-[10px] font-bold text-zinc-400 hover:underline flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5"
                            >
                              📝 Modify / Send Another Reply
                            </button>
                          )}
                        </div>

                        {activeReplyId === m.id && (
                          <div className="mt-2 bg-[#0A0A16] border border-white/10 rounded-2xl p-4 space-y-3">
                            <label className="text-[11px] font-bold text-[#94A3B8] block">Compose Reply (Dispitched via Gmail SMTP):</label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={4}
                              className="w-full bg-[#121224] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#06B6D4] placeholder:text-zinc-650 resize-none font-sans"
                              placeholder="Type your mail response greetings here..."
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/5"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendReplyMessage(m.id)}
                                disabled={replyLoading}
                                className="px-4 py-1.5 rounded-xl text-[10px] font-bold text-slate-900 bg-[#06B6D4] hover:brightness-110 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {replyLoading ? 'Sending...' : 'Transmit SMTP Reply Mail'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 8: CV / RESUME PDF RESOURCE UPLOADER */}
            {activeSection === 'cv' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">CV PDF File Upload</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Upload a standard PDF document containing your resume CV. This document will be compiled on the Express backend server and linked live to the "Download CV" button. PDF format only under 5M capacity.
                </p>

                <div className="flex flex-col gap-3 pt-2 select-none">
                  {(social as any).cvPath && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl max-w-sm">
                      <CheckCircle2 size={15} />
                      <span>Saved File: {(social as any).cvPath.split('/').pop()}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-xs font-bold rounded-xl text-white cursor-pointer transition shadow-lg hover:brightness-110">
                      <Upload size={15} className={cvProgress ? 'animate-spin' : ''} />
                      {cvProgress ? 'Uploading PDF...' : 'Choose PDF to upload'}
                      <input type="file" accept="application/pdf" onChange={handleCvUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: PRICING PLANS & FAQS MANAGEMENTS */}
            {activeSection === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex justify-between items-center select-none">
                  <span>FAQ & Pricing Tiers Editor</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8]">Enable Annual:</span>
                    <input
                      type="checkbox" checked={pricing.annualEnabled}
                      onChange={(e) => setPricing({ ...pricing, annualEnabled: e.target.checked })}
                      className="w-4 h-4 cursor-pointer accent-[#7C3AED]"
                    />
                  </div>
                </h3>

                {/* Plan parameters */}
                <div className="space-y-6">
                  {pricing.plans.map((p, pIdx) => (
                    <div key={p.id || pIdx} className="glass-card bg-[#0F0F1A]/40 p-5 rounded-2xl border border-white/5 space-y-4">
                      <span className="text-[10px] font-bold font-mono tracking-wider text-[#06B6D4] uppercase block">
                        Tier {pIdx + 1}: {p.name} Settings
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#94A3B8]">Plan Name</label>
                          <input
                            type="text" value={p.name}
                            onChange={(e) => handleUpdatePlanPrice(pIdx, 'name', e.target.value)}
                            className="w-full bg-[#0F0F1A] border border-[#ffffff]/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#94A3B8]">Monthly Price ($)</label>
                          <input
                            type="text" value={p.monthlyPrice}
                            onChange={(e) => handleUpdatePlanPrice(pIdx, 'monthlyPrice', e.target.value)}
                            className="w-full bg-[#0F0F1A] border border-[#ffffff]/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#94A3B8]">Annual Price ($)</label>
                          <input
                            type="text" value={p.annualPrice}
                            onChange={(e) => handleUpdatePlanPrice(pIdx, 'annualPrice', e.target.value)}
                            className="w-full bg-[#0F0F1A] border border-[#ffffff]/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#94A3B8]">Theme Accent</label>
                          <select
                            value={p.colorTheme}
                            onChange={(e) => handleUpdatePlanPrice(pIdx, 'colorTheme', e.target.value)}
                            className="w-full bg-[#0F0F1A] border border-[#ffffff]/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="cyan">Cyan Accent</option>
                            <option value="purple">Purple Accent</option>
                            <option value="pink">Pink Accent</option>
                          </select>
                        </div>
                      </div>

                      {/* Edit features line */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">Include Features:</label>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {p.features.map((feat, featIdx) => (
                            <div key={featIdx} className="flex items-center gap-2">
                              <input
                                type="text" value={feat}
                                onChange={(e) => handleUpdatePlanFeature(pIdx, featIdx, e.target.value)}
                                className="flex-grow bg-[#0F0F1A] border border-[#ffffff]/5 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                              />
                              <button
                                type="button" onClick={() => handleDeletePlanFeature(pIdx, featIdx)}
                                className="p-1 hover:bg-slate-350 text-rose-455 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button" onClick={() => handleAddPlanFeature(pIdx)}
                          className="text-[10px] font-bold text-[#06B6D4] hover:underline"
                        >
                          + Add Feature Row
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* FAQ section item list */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider select-none">FAQ Accordion List</h4>
                  
                  {/* Create FAQ item */}
                  <form onSubmit={handleAddPricingFaq} className="glass-card bg-[#0F0F1A]/50 p-4 border border-white/5 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold text-[#06B6D4] uppercase block">+ Add FAQ Item:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text" required placeholder="FAQ Question?" value={newFaqQuest}
                        onChange={(e) => setNewFaqQuest(e.target.value)}
                        className="bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text" required placeholder="FAQ Answer explanation..." value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        className="bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="px-5 py-2 rounded-xl text-white bg-[#7C3AED] hover:brightness-110 text-xs font-semibold cursor-pointer">
                      Publish FAQ Row
                    </button>
                  </form>

                  {/* FAQ list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pricing.faq.map((faq) => (
                      <div key={faq.id} className="flex items-center justify-between bg-[#0F0F1A] p-3 rounded-xl border border-white/5">
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-bold text-white truncate">{faq.question}</p>
                          <p className="text-[10px] text-[#94A3B8] truncate">{faq.answer}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePricingFaq(faq.id)}
                          className="p-1 shrink-0 text-rose-455 hover:bg-rose-500/10 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={handleSavePricingPlans}
                    className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer shadow-lg shadow-[#7C3AED]/20"
                  >
                    Save All Pricing & FAQs Changes
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 10: MEETING BOOKINGS */}
            {activeSection === 'bookings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Consultation Bookings Scheduler</h3>
                
                {bookings.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic select-none">No digital bookings have been registered yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                    {bookings.map((b) => {
                      const isPen = b.status === 'Pending';
                      const isCon = b.status === 'Confirmed';
                      const isCan = b.status === 'Cancelled';
                      const isCom = b.status === 'Completed';

                      // Badge rendering
                      let badgeStyle = 'bg-orange-500/15 text-orange-400 border-orange-500/20';
                      if (isCon) badgeStyle = 'bg-emerald-500/15 text-emerald-405 border-emerald-500/20';
                      if (isCan) badgeStyle = 'bg-rose-500/15 text-rose-455 border-rose-500/20';
                      if (isCom) badgeStyle = 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/20';

                      return (
                        <div key={b.id} className="p-4 rounded-xl border border-white/5 bg-[#0F0F1A]/60 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                            <div>
                              <p className="text-xs font-bold text-white leading-none flex items-center gap-2">
                                <span>{b.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${badgeStyle}`}>
                                  {b.status}
                                </span>
                              </p>
                              <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5"><a href={`mailto:${b.email}`} className="text-[#06B6D4] hover:underline">{b.email}</a></p>
                            </div>

                            {/* Booking Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 select-none">
                              {isPen && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                    className="px-2.5 py-1 text-[9px] font-bold text-slate-900 bg-emerald-400 hover:brightness-110 rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 size={10} />
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                    className="px-2.5 py-1 text-[9px] font-bold text-white bg-rose-600 hover:brightness-110 rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <XCircle size={10} />
                                    Cancel
                                  </button>
                                </>
                              )}
                              {isCon && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                  className="px-2.5 py-1 text-[9px] font-bold text-slate-900 bg-[#06B6D4] hover:brightness-110 rounded-lg cursor-pointer"
                                >
                                  Mark Complete
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1.5 hover:bg-rose-500/10 text-rose-455 hover:text-white rounded-lg transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-[#05050B] p-2.5 rounded-lg border border-white/5 text-[10px] font-semibold text-slate-300 font-mono leading-none">
                            <p><strong>Service:</strong> {b.service}</p>
                            <p><strong>Date:</strong> {b.date}</p>
                            <p><strong>Time:</strong> {b.time}</p>
                            <p><strong>Format:</strong> {b.meetingType}</p>
                          </div>

                          {b.notes && (
                            <p className="text-[10px] text-[#94A3B8] leading-relaxed italic bg-white/5 p-2 rounded border border-white/5">
                              "{b.notes}"
                            </p>
                          )}

                          {b.reply && (
                            <div className="mt-2 text-xs bg-[#06B6D4]/5 border border-[#06B6D4]/20 p-3 rounded-xl text-slate-300">
                              <div className="flex items-center justify-between text-[10px] text-[#22D3EE] font-bold mb-1">
                                <span>↩️ SENT BOOKING EMAIL UPDATE:</span>
                                {b.replyDate && <span>{new Date(b.replyDate).toLocaleString()}</span>}
                              </div>
                              <p className="whitespace-pre-wrap text-slate-350">{b.reply}</p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-1 items-center justify-start select-none">
                            {!b.reply && activeBookingReplyId !== b.id && (
                              <button
                                onClick={() => {
                                  setActiveBookingReplyId(b.id);
                                  setReplyText('');
                                }}
                                className="text-[10px] font-bold text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 hover:border-[#06B6D4]/30"
                              >
                                📧 Send Mail Update
                              </button>
                            )}
                            {b.reply && activeBookingReplyId !== b.id && (
                              <button
                                onClick={() => {
                                  setActiveBookingReplyId(b.id);
                                  setReplyText(b.reply || '');
                                }}
                                className="text-[10px] font-bold text-zinc-400 hover:underline flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5"
                              >
                                📝 Edit / Send Another Email
                              </button>
                            )}
                          </div>

                          {activeBookingReplyId === b.id && (
                            <div className="mt-2 bg-[#0A0A16] border border-white/10 rounded-2xl p-4 space-y-3">
                              <label className="text-[11px] font-bold text-[#94A3B8] block">Compose Booking Instructions / Update Mail (Gmail SMTP):</label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                className="w-full bg-[#121224] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#06B6D4] placeholder:text-zinc-650 resize-none font-sans"
                                placeholder="Type updates, venue links, custom meet credentials, or reschedule updates here..."
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setActiveBookingReplyId(null)}
                                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/5"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSendReplyBooking(b.id)}
                                  disabled={replyLoading}
                                  className="px-4 py-1.5 rounded-xl text-[10px] font-bold text-slate-900 bg-[#06B6D4] hover:brightness-110 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {replyLoading ? 'Sending...' : 'Transmit SMTP Update Mail'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 11: AVAILABILITY RULES */}
            {activeSection === 'availability' && availability && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Calendar Availability Rules</h3>

                {/* Weekly hour schedules */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Weekly Consultation Hours:</span>
                  
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {Object.keys(availability.weeklySchedule).map((day) => {
                      const dayConf = availability.weeklySchedule[day as keyof typeof availability.weeklySchedule];
                      return (
                        <div key={day} className="flex flex-wrap items-center justify-between gap-4 bg-[#0F0F1A] border border-[#ffffff]/5 p-2.5 rounded-xl">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox" checked={dayConf.active}
                              onChange={() => handleToggleDayActive(day)}
                              className="w-4 h-4 rounded cursor-pointer accent-[#06B6D4]"
                            />
                            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">{day}</span>
                          </label>

                          {dayConf.active && (
                            <div className="flex items-center gap-2 select-none">
                              <input
                                type="time" value={dayConf.start}
                                onChange={(e) => handleUpdateDayTimes(day, 'start', e.target.value)}
                                className="bg-[#050510] border border-white/10 rounded px-2 py-1 text-xs text-white"
                              />
                              <span className="text-xs text-[#94A3B8]">to</span>
                              <input
                                type="time" value={dayConf.end}
                                onChange={(e) => handleUpdateDayTimes(day, 'end', e.target.value)}
                                className="bg-[#050510] border border-white/10 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Constants limits durations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Durations Slot</label>
                    <select
                      value={availability.slotDuration}
                      onChange={(e) => setAvailability({ ...availability, slotDuration: Number(e.target.value) as any })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Buffer Offset (min)</label>
                    <select
                      value={availability.bufferTime}
                      onChange={(e) => setAvailability({ ...availability, bufferTime: Number(e.target.value) as any })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value={0}>0 Buffer</option>
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Max Bookings/Day</label>
                    <input
                      type="number" value={availability.maxBookingsPerDay}
                      onChange={(e) => setAvailability({ ...availability, maxBookingsPerDay: Number(e.target.value) })}
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-mono"
                    />
                  </div>
                </div>

                {/* Double arrays: services options & blocked dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  
                  {/* Block specific dates */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Block Specific Calendar Dates:</span>
                    <div className="flex gap-2 select-none">
                      <input
                        type="date" value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="bg-[#0f0f1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-333 truncate"
                      />
                      <button
                        type="button" onClick={handleAddBlockedDate}
                        className="px-4 py-2 bg-[#7C3AED] text-white text-xs font-semibold rounded-xl"
                      >
                        Block
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {availability.blockedDates.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 border border-rose-500/25 text-rose-400 font-mono text-[9px] font-bold rounded-lg mb-1">
                          {d}
                          <button type="button" onClick={() => handleRemoveBlockedDate(d)} className="text-rose-400 hover:text-white pb-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Catalog */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Service Catalog Catalog:</span>
                    <div className="flex gap-2">
                      <input
                        type="text" value={newService} placeholder="Service name..."
                        onChange={(e) => setNewService(e.target.value)}
                        className="flex-grow bg-[#0f0f1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="button" onClick={handleAddServicesOpt}
                        className="px-4 py-2 bg-[#06B6D4] text-slate-900 text-xs font-bold rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {availability.services.map((s) => (
                        <div key={s} className="flex items-center justify-between text-[11px] font-medium bg-[#0f0f1f]/50 p-1.5 rounded-lg border border-white/5">
                          <span className="truncate">{s}</span>
                          <button type="button" onClick={() => handleRemoveServicesOpt(s)} className="text-rose-455 hover:text-white px-1">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Visual Section: Specific Date & Time Slots (Availability Overrides) */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-[#06B6D4]" />
                    <span>Dynamic Calendar overrides (Specific Date & Time Slots)</span>
                  </h4>
                  
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Set specific operational hours and slots for individual dates. Setting custom slots for a date will override weekly rules and allow fine-grained appointment scheduling for that date. Weekend dates can also be opened here.
                  </p>

                  <div className="glass-card bg-[#0F0F1A]/50 p-4 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5 select-none">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase block">Select Target Date</label>
                      <input
                        type="date"
                        value={customSlotDate}
                        onChange={(e) => setCustomSlotDate(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-semibold font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 select-none">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase block">Designate Time Slot</label>
                      <input
                        type="time"
                        value={customSlotTime}
                        onChange={(e) => setCustomSlotTime(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="w-full py-2.5 bg-[#7C3AED] hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#7C3AED]/20 cursor-pointer transition-all duration-200"
                    >
                      <Plus size={14} />
                      Add Slot Opening
                    </button>
                  </div>

                  {/* Configured Overrides list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Currently Configured Overrides:</span>
                    
                    {!availability.customSlots || Object.keys(availability.customSlots).length === 0 ? (
                      <div className="text-center p-6 border border-dashed border-white/5 bg-white/[0.01] rounded-2xl text-[#94A3B8] text-xs leading-relaxed italic">
                        No specific single-date time slots configured. Your weekly scheduling rules are currently in full effect.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-1">
                        {Object.entries(availability.customSlots).map(([dateStr, times]) => (
                          <div key={dateStr} className="glass-card bg-[#0F0F1A] border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-2 animate-pulse">
                                <Calendar size={14} className="text-[#06B6D4]" />
                                <span className="text-xs font-bold text-white font-mono">{dateStr}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomDate(dateStr)}
                                className="text-rose-455 hover:text-white p-1 hover:bg-white/5 rounded-lg transition"
                                title="Delete entire date override"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {(times as string[]).map((t) => (
                                <span 
                                  key={t} 
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#C084FC] text-[10px] font-semibold font-mono"
                                >
                                  {t}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSlot(dateStr, t)}
                                    className="text-[#C084FC] hover:text-white font-black hover:bg-white/5 rounded-full w-3.5 h-3.5 flex items-center justify-center pb-0.5"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={handleSaveAvailabilitySettings}
                    className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer"
                  >
                    Save Calendar Rules & Catalogs
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 12: FOOTER CUSTOMIZATION */}
            {activeSection === 'footer' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Header/Footer Logo & Branding Customize</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Modify the display parameters of the application header/footer branding directly in the CMS database. Changes reflect instantly upon saving.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Header Logo Image Upload */}
                    <div className="space-y-1.5 sm:col-span-2 p-4 bg-[#151528]/50 border border-white/5 rounded-xl">
                      <span className="text-xs font-bold text-[#06B6D4] block">Header Logo Image (Top Navbar)</span>
                      <p className="text-[11px] text-[#94A3B8] leading-tight mb-3">Upload an image to represent your branding logo in the top Navigation Bar. If left empty, the logo text fallback below is used.</p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-12 px-4 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center justify-center font-mono text-[10px] text-zinc-400 w-full sm:w-auto min-w-[150px] overflow-hidden truncate">
                          {footer.headerLogoImg ? (
                            <img src={footer.headerLogoImg} alt="Header Preview" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            "No custom image logo"
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#06B6D4] text-xs font-semibold rounded-xl text-white cursor-pointer transition select-none">
                            <Upload size={14} className={headerLogoProgress ? 'animate-spin' : ''} />
                            {headerLogoProgress ? 'Uploading...' : 'Choose Logo Image'}
                            <input type="file" accept="image/*" onChange={handleHeaderLogoUpload} className="hidden" />
                          </label>
                          {footer.headerLogoImg && (
                            <button
                              type="button"
                              onClick={() => setFooter({ ...footer, headerLogoImg: "" })}
                              className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 hover:text-white text-xs font-medium rounded-xl transition"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Logo Image Upload */}
                    <div className="space-y-1.5 sm:col-span-2 p-4 bg-[#151528]/50 border border-white/5 rounded-xl">
                      <span className="text-xs font-bold text-[#06B6D4] block">Footer Logo Image (Bottom Footer)</span>
                      <p className="text-[11px] text-[#94A3B8] leading-tight mb-3">Upload an image to represent your branding logo in the bottom Footer section. If left empty, the logo text fallback below is used.</p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-12 px-4 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center justify-center font-mono text-[10px] text-zinc-400 w-full sm:w-auto min-w-[150px] overflow-hidden truncate">
                          {footer.footerLogoImg ? (
                            <img src={footer.footerLogoImg} alt="Footer Preview" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            "No custom image logo"
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#06B6D4] text-xs font-semibold rounded-xl text-white cursor-pointer transition select-none">
                            <Upload size={14} className={footerLogoProgress ? 'animate-spin' : ''} />
                            {footerLogoProgress ? 'Uploading...' : 'Choose Logo Image'}
                            <input type="file" accept="image/*" onChange={handleFooterLogoUpload} className="hidden" />
                          </label>
                          {footer.footerLogoImg && (
                            <button
                              type="button"
                              onClick={() => setFooter({ ...footer, footerLogoImg: "" })}
                              className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 hover:text-white text-xs font-medium rounded-xl transition"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Logo text / Brand label fallback</label>
                      <input
                        type="text"
                        value={footer.logoText}
                        onChange={(e) => setFooter({ ...footer, logoText: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="devrobayad"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Copyright Text (Without year prefix)</label>
                      <input
                        type="text"
                        value={footer.copyrightText}
                        onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="Robayad Hasan Jam. All rights reserved."
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Developer text / Titles label</label>
                      <input
                        type="text"
                        value={footer.developerText}
                        onChange={(e) => setFooter({ ...footer, developerText: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="Web Developer & AI Agent Developer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Developer URL Text Label</label>
                      <input
                        type="text"
                        value={footer.developerUrlLabel}
                        onChange={(e) => setFooter({ ...footer, developerUrlLabel: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="devrobayad.com"
                      />
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-semibold text-[#94A3B8]">Developer Website Link URL</label>
                      <input
                        type="text"
                        value={footer.developerUrl}
                        onChange={(e) => setFooter({ ...footer, developerUrl: e.target.value })}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="https://devrobayad.com"
                      />
                    </div>

                    {/* Website Title & Favicon Customizer */}
                    <div className="space-y-2 sm:col-span-2 p-4 bg-[#7C3AED]/5 border border-[#7C3AED]/20 rounded-xl mt-4 font-sans">
                      <span className="text-xs font-bold text-[#06B6D4] block">Website Tab Identity & Favicon Metadata</span>
                      <p className="text-[11px] text-[#94A3B8] leading-tight mb-3">Configure custom high-level browser tab branding metadata instantly cached on user entry loops.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#94A3B8]">Website Browser Title</label>
                          <input
                            type="text"
                            value={footer.siteTitle || ""}
                            onChange={(e) => setFooter({ ...footer, siteTitle: e.target.value })}
                            className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                            placeholder="Robayad Hasan Jam - Portfolio"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#94A3B8]">Browser Favicon Graphic</label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="h-10 px-3 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center gap-2 font-mono text-[10px] text-zinc-400 min-w-[120px] max-w-[170px] overflow-hidden truncate">
                              {footer.siteFavicon ? (
                                <>
                                  <img src={footer.siteFavicon} alt="Favicon Preview" className="h-5 w-5 object-contain bg-white/5 rounded p-0.5" referrerPolicy="no-referrer" />
                                  <span className="text-[9px] text-[#94A3B8] truncate">{footer.siteFavicon.split('/').pop()}</span>
                                </>
                              ) : (
                                "Default Icon"
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#06B6D4] text-[11px] font-semibold rounded-xl text-white cursor-pointer transition select-none">
                                <Upload size={13} className={faviconProgress ? 'animate-spin' : ''} />
                                {faviconProgress ? 'Uploading...' : 'Upload Icon'}
                                <input type="file" accept="image/x-icon,image/png,image/jpeg,image/svg+xml" onChange={handleFaviconUpload} className="hidden" />
                              </label>
                              {footer.siteFavicon && (
                                <button
                                  type="button"
                                  onClick={() => setFooter({ ...footer, siteFavicon: "" })}
                                  className="px-2.5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-white text-[11px] font-medium rounded-xl transition"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Footer Custom Links Manager */}
                    <div className="space-y-3 sm:col-span-2 p-5 bg-[#1C1C30]/60 border border-white/10 rounded-2xl mt-4 font-sans">
                      <div>
                        <span className="text-sm font-bold text-[#06B6D4] block">Dynamic Footer Links Ecosystem</span>
                        <p className="text-[11px] text-[#94A3B8] leading-tight mt-1">
                          Manage fully customizable footer links dynamically! Add, edit, remove, and reorder links that appear at the center of your page footer.
                        </p>
                      </div>

                      {/* Inputs row */}
                      <div className="bg-[#0F0F1A]/80 p-4 border border-white/5 rounded-xl space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">
                          {editingFooterLinkId ? '✏️ Edit Link Details' : '➕ Add Custom Link'}
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Link Label (e.g. Portfolio)</label>
                            <input
                              type="text"
                              value={newFooterLinkLabel}
                              onChange={(e) => setNewFooterLinkLabel(e.target.value)}
                              placeholder="e.g. Portfolio"
                              className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Link Destination URL (e.g. #projects or https://...)</label>
                            <input
                              type="text"
                              value={newFooterLinkUrl}
                              onChange={(e) => setNewFooterLinkUrl(e.target.value)}
                              placeholder="e.g. #projects or https://link..."
                              className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          {editingFooterLinkId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFooterLinkId(null);
                                setNewFooterLinkLabel('');
                                setNewFooterLinkUrl('');
                              }}
                              className="px-3 py-1.5 bg-zinc-700/55 hover:bg-zinc-650 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAddFooterLink}
                            className="px-4 py-1.5 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-slate-900 text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            {editingFooterLinkId ? 'Update Link' : 'Add to List'}
                          </button>
                        </div>
                      </div>

                      {/* Link list representation */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">
                          Current Footer Links ({footer.customLinks?.length || 0})
                        </span>

                        {(!footer.customLinks || footer.customLinks.length === 0) ? (
                          <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-[#94A3B8]">
                            No custom links defined. Default links will be seeded automatically.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                            {footer.customLinks.map((link, idx) => (
                              <div
                                key={link.id}
                                className="flex items-center justify-between p-3 bg-[#131322] border border-white/5 hover:border-white/10 rounded-xl group transition"
                              >
                                <div className="min-w-0 pr-4">
                                  <span className="text-xs font-bold text-white block truncate">{link.label}</span>
                                  <span className="text-[10px] font-mono text-[#06B6D4] block truncate">{link.url}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Order buttons */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFooterLink(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Move up"
                                    className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFooterLink(idx, 'down')}
                                    disabled={idx === footer.customLinks!.length - 1}
                                    title="Move down"
                                    className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                  
                                  {/* Action buttons */}
                                  <button
                                    type="button"
                                    onClick={() => handleEditFooterLink(link)}
                                    title="Edit Link"
                                    className="p-1.5 bg-[#06B6D4]/10 border border-[#06B6D4]/20 hover:border-[#06B6D4] text-[#06B6D4] hover:text-white rounded transition cursor-pointer"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFooterLink(link.id)}
                                    title="Delete Link"
                                    className="p-1.5 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white rounded transition cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={handleSaveFooter}
                    className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    Save Branding & Identity Settings
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 14: INTERACTIVE CURSOR AND PRELOADER CUSTOMIZATION */}
            {activeSection === 'cursor-theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Website Cursor & Preloader Animation Effects</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
                    Separate from logo & footer settings, configure a highly interactive visitor-side browsing theme including custom mouse pointers and screen preloader animations.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Website Custom Mouse Cursor settings */}
                  <div className="space-y-3 p-5 bg-[#151528]/50 border border-white/5 rounded-2xl font-sans">
                    <span className="text-sm font-bold text-[#06B6D4] block flex items-center gap-2">
                      <MousePointer size={16} className="text-[#06B6D4]" />
                      Website Hover Cursor Theme
                    </span>
                    <p className="text-[11px] text-[#94A3B8] leading-tight mb-4">
                      Choose a custom responsive mouse pointer style for desktop visitors to make the navigation live and aesthetically outstanding.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {[
                        { id: 'system', name: 'System default', desc: 'Standard browser pointer' },
                        { id: 'neon', name: 'Neon Glow Ring', desc: 'Glowing responsive cyan ring' },
                        { id: 'magnetic', name: 'Magnetic Tracker', desc: 'Sleek white dot with orbit trail' },
                        { id: 'retro', name: 'Hacker Terminal', desc: 'Green vintage command block' }
                      ].map((cOpt) => (
                        <button
                          key={cOpt.id}
                          type="button"
                          onClick={() => setFooter({ ...footer, cursorStyle: cOpt.id as any })}
                          className={`p-3.5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                            (footer.cursorStyle || 'system') === cOpt.id
                              ? 'bg-[#06B6D4]/10 border-[#06B6D4] text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                              : 'bg-slate-900/40 border-white/5 text-[#94A3B8] hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-[11px] font-bold block mb-1 text-white">{cOpt.name}</span>
                          <span className="text-[9px] text-[#64748B] block leading-tight">{cOpt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Page Preloader Customizer settings */}
                  <div className="space-y-4 p-5 bg-[#0A0A1F]/80 border border-white/10 rounded-2xl font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-bold text-[#06B6D4] block flex items-center gap-2">
                          <Activity size={15} className="text-[#06B6D4] animate-pulse" />
                          Page Preloader Settings & Animation Engine
                        </span>
                        <p className="text-[11px] text-[#94A3B8] leading-tight mt-1">
                          Configure a highly polished dynamic loading animation screen seen by visitors on first entry and fresh reloads.
                        </p>
                      </div>
                      
                      <div className="mt-3 sm:mt-0 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#94A3B8]">Status:</span>
                        <button
                          type="button"
                          onClick={() => setFooter({ ...footer, preloaderEnabled: !footer.preloaderEnabled })}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all duration-300 cursor-pointer ${
                            footer.preloaderEnabled !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-white/5'
                          }`}
                        >
                          {footer.preloaderEnabled !== false ? '● ACTIVE' : '○ DISABLED'}
                        </button>
                      </div>
                    </div>

                    {footer.preloaderEnabled !== false && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                        {/* Options Form panel */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* Option 2: Preloader style */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#94A3B8] block">Select Preloader Animation Theme</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {[
                                { id: 'cyber-core', name: 'Cybernetic Core', desc: 'glowing futuristic multi-ring rings' },
                                { id: 'quantum-pulse', name: 'Quantum Pulse', desc: 'ambient soft glow with breathing logo' },
                                { id: 'hacker-terminal', name: 'Hacker Terminal', desc: 'vintage neon shell logs compiling site' },
                                { id: 'neon-shimmer', name: 'Neon Shimmer', desc: 'sleek horizontal loading progress glow' },
                                { id: 'custom-logo-spin', name: '3D Custom Logo Spin', desc: 'perspective rotating logo card with orbits' }
                              ].map((pOpt) => (
                                <button
                                  key={pOpt.id}
                                  type="button"
                                  onClick={() => setFooter({ ...footer, preloaderType: pOpt.id as any })}
                                  className={`p-3 rounded-xl border text-left transition duration-250 select-none cursor-pointer ${
                                    (footer.preloaderType || 'cyber-core') === pOpt.id
                                      ? 'bg-[#06B6D4]/10 border-[#06B6D4] text-white shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                                      : 'bg-slate-900/50 border-white/5 text-[#94A3B8] hover:border-white/10 hover:text-white'
                                  }`}
                                >
                                  <span className="text-xs font-bold block mb-0.5 text-white">{pOpt.name}</span>
                                  <span className="text-[9px] text-[#64748B] block leading-tight">{pOpt.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Option 3: Hold duration */}
                          <div className="space-y-1.5 bg-white/[0.01] p-3 border border-white/5 rounded-xl">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#94A3B8]">Loader Hold Duration Limit</span>
                              <span className="text-[#06B6D4] font-mono font-bold">
                                {footer.preloaderDuration ? (footer.preloaderDuration / 1000).toFixed(1) : '1.5'} seconds
                              </span>
                            </div>
                            <input
                              type="range"
                              min="500"
                              max="5000"
                              step="100"
                              value={footer.preloaderDuration !== undefined ? footer.preloaderDuration : 1500}
                              onChange={(e) => setFooter({ ...footer, preloaderDuration: Number(e.target.value) })}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
                            />
                          </div>

                          {/* Option 4: Preloader logo */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#94A3B8] block">Upload Preloader Logo</label>
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                              <div className="flex-1 bg-[#0F0F1A] border border-white/10 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-mono text-[10px] text-zinc-400 overflow-hidden truncate">
                                {footer.preloaderLogoUrl ? (
                                  <div className="flex items-center gap-2 max-w-full">
                                    <img src={footer.preloaderLogoUrl} alt="Preloader Logo" className="w-6 h-6 object-contain rounded bg-white/5" referrerPolicy="no-referrer" />
                                    <span className="text-[9px] text-[#94A3B8] truncate">{footer.preloaderLogoUrl.split('/').pop()}</span>
                                  </div>
                                ) : (
                                  <span>Falls back to site logo or text initial monogram</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#06B6D4] text-[11px] font-semibold rounded-xl text-white cursor-pointer transition select-none">
                                  <Upload size={13} className={preloaderLogoProgress ? 'animate-spin' : ''} />
                                  {preloaderLogoProgress ? 'Uploading...' : 'Upload Logo'}
                                  <input type="file" accept="image/*" onChange={handlePreloaderLogoUpload} className="hidden" />
                                </label>
                                {footer.preloaderLogoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setFooter({ ...footer, preloaderLogoUrl: "" })}
                                    className="px-2.5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-white text-[11px] font-medium rounded-xl transition cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Autofill triggers */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="text-[9px] text-[#64748B] flex items-center">Autofill:</span>
                              {footer.headerLogoImg && (
                                <button
                                  type="button"
                                  onClick={() => setFooter({ ...footer, preloaderLogoUrl: footer.headerLogoImg })}
                                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] text-[#94A3B8] hover:text-white transition cursor-pointer"
                                >
                                  Copy Header Logo
                                </button>
                              )}
                              {footer.siteFavicon && (
                                <button
                                  type="button"
                                  onClick={() => setFooter({ ...footer, preloaderLogoUrl: footer.siteFavicon })}
                                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] text-[#94A3B8] hover:text-white transition cursor-pointer"
                                >
                                  Copy Web Favicon
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Live render preview container card */}
                        <div className="lg:col-span-5 flex flex-col justify-between border border-white/5 rounded-2xl bg-black/40 p-4 font-sans text-center">
                          <div className="text-left space-y-1">
                            <span className="text-xs font-bold text-white block">Interactive Live Preview Panel</span>
                            <p className="text-[10px] text-[#94A3B8] leading-tight">
                              Live-render preview of the chosen style before committing settings.
                            </p>
                          </div>

                          {/* Mini Sandbox Simulator viewport */}
                          <div className="relative h-44 w-full border border-white/5 bg-[#05050C] rounded-xl overflow-hidden flex flex-col items-center justify-center p-3 mt-3">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4]/30 to-transparent" />
                            
                            {/* Cyber Core */}
                            {(footer.preloaderType || 'cyber-core') === 'cyber-core' && (
                              <div className="flex flex-col items-center space-y-2.5 relative z-10 w-full">
                                <div className="relative w-14 h-14 flex items-center justify-center">
                                  <div className="absolute inset-0 rounded-full border border-dashed border-[#7C3AED]/30 animate-[spin_8s_linear_infinite]" />
                                  <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#06B6D4] border-b-[#7C3AED] animate-[spin_1.5s_linear_infinite]" />
                                  <div className="absolute w-7 h-7 rounded-full bg-[#0D0D19] border border-white/10 flex items-center justify-center text-[7px] text-[#06B6D4] font-bold animate-pulse">
                                    CPU
                                  </div>
                                </div>
                                <span className="font-mono text-[7px] text-[#A78BFA] tracking-[0.2em] font-medium uppercase">ACTIVE DRIVE CORE</span>
                              </div>
                            )}

                            {/* Quantum Pulse */}
                            {(footer.preloaderType || 'cyber-core') === 'quantum-pulse' && (
                              <div className="flex flex-col items-center space-y-2 relative z-10 text-center w-full">
                                <div className="absolute w-24 h-24 rounded-full bg-[#7C3AED]/5 filter blur-lg animate-pulse" />
                                <div className="relative bg-[#0F0F23] p-2 rounded-xl border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.15)] flex items-center justify-center animate-pulse">
                                  <Sparkles className="text-[#06B6D4]" size={14} />
                                </div>
                                <span className="font-mono text-[7px] text-[#06B6D4] tracking-widest uppercase mt-2">Quantum Stream</span>
                              </div>
                            )}

                            {/* Hacker Terminal */}
                            {(footer.preloaderType || 'cyber-core') === 'hacker-terminal' && (
                              <div className="w-full max-w-[160px] bg-[#030307]/90 border border-emerald-500/20 rounded p-2 font-mono text-[6px] text-emerald-400 space-y-1 relative z-10 text-left">
                                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-0.5">
                                  <span className="text-[5px] text-emerald-600 font-bold uppercase">DB_SYNC_INDEX</span>
                                </div>
                                <div className="space-y-0.5 leading-none text-emerald-300">
                                  <div>&gt; mount diagnostic: ok</div>
                                  <div>&gt; connecting API datastore: ok</div>
                                  <div>&gt; render views: successful</div>
                                  <span className="inline-block w-0.5 h-1.5 bg-emerald-450 animate-pulse" />
                                </div>
                              </div>
                            )}

                            {/* Neon Shimmer */}
                            {(footer.preloaderType || 'cyber-core') === 'neon-shimmer' && (
                              <div className="flex flex-col items-center space-y-2.5 relative z-10 w-full px-5">
                                <div className="relative p-2 bg-[#0B0B14] rounded-full border border-white/10 flex items-center justify-center animate-spin">
                                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-r-[#06B6D4] border-l-[#7C3AED]" />
                                  <div className="w-4 h-4 bg-[#121226] rounded-full" />
                                </div>
                                <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden relative">
                                  <div className="absolute h-full left-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] w-2/3 animate-[pulse_1s_infinite]" />
                                </div>
                              </div>
                            )}

                            {/* Custom Logo Spin */}
                            {(footer.preloaderType || 'cyber-core') === 'custom-logo-spin' && (
                              <div className="flex flex-col items-center space-y-2 relative z-10 w-full">
                                <div className="w-10 h-10 relative flex items-center justify-center animate-[bounce_2s_infinite]">
                                  <div className="absolute inset-0 rounded-full bg-[#06B6D4]/10 filter blur" />
                                  <div className="w-8 h-8 bg-[#0E0E1F] border border-white/10 rounded-xl flex items-center justify-center font-bold text-[7px] text-[#06B6D4]">
                                    LOGO
                                  </div>
                                </div>
                                <span className="text-[6px] text-[#A78BFA] uppercase tracking-widest font-mono">3D Spin Active</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-3.5 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold tracking-wider font-mono hover:text-[#06B6D4] uppercase rounded-xl transition cursor-pointer"
                          >
                            🔄 Test Live Site Reload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={handleSaveFooter}
                    className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    Save Interactive Cursor & effects Theme
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC STATS COUNTERS CUSTOMIZATION */}
            {activeSection === 'counters' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Dynamic Intro Stats Counters</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
                    Modify the bold visual statistics counters rendered on the homepage right below the hero introduction banner. Use bold, brief values (e.g., <code className="text-[#06B6D4] font-mono">120+</code>, <code className="text-[#06B6D4] font-mono">250+</code>, <code className="text-[#06B6D4] font-mono">99%</code>) and descriptive, literal labels.
                  </p>
                </div>

                <form onSubmit={handleSaveCounters} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {editingCounters.map((counter, idx) => (
                      <div key={counter.id || idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 hover:border-[#06B6D4]/30 transition duration-200 relative">
                        <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                          Stat #{idx + 1}
                        </span>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                            Statistic Value (Bold Text)
                          </label>
                          <input
                            type="text"
                            required
                            value={counter.value || ''}
                            onChange={(e) => {
                              const updated = [...editingCounters];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setEditingCounters(updated);
                            }}
                            placeholder="e.g. 120+ or 355K"
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                            Label / Title Description
                          </label>
                          <input
                            type="text"
                            required
                            value={counter.label || ''}
                            onChange={(e) => {
                              const updated = [...editingCounters];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setEditingCounters(updated);
                            }}
                            placeholder="e.g. Happy Customers"
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingCounters.length === 0 && (
                    <div className="text-center py-6 text-[#94A3B8] text-xs">
                      No counters initialized yet. Refetching or wait a second...
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-1.5"
                    >
                      Save Stats Counters
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (counters && counters.length > 0) {
                          setEditingCounters(counters);
                          triggerToast("Reverted to saved database stats.", "success");
                        }
                      }}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 cursor-pointer transition-all"
                    >
                      Reset Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION 14: GMAIL SMTP INTEGRATION */}
            {activeSection === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Gmail SMTP Integration</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
                    Connect your portfolio web app directly to your Gmail inbox. When configured, any client interest via "Send a Message" or calendar appointment booking will automatically notify your email inbox instantly.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-[#7C3AED]/10 border border-blue-500/20 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    How to configure and get a Gmail App Password:
                  </h4>
                  <ol className="text-xs text-[#94A3B8] space-y-2 list-decimal pl-4 leading-relaxed">
                    <li>Open your Google Workspace / Google Account settings portal (<a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-[#06B6D4] underline hover:text-white">myaccount.google.com</a>).</li>
                    <li>Ensure <strong>2-Step Verification</strong> is enabled inside your security tab.</li>
                    <li>Search or navigate to the <strong className="text-white">App Passwords</strong> page.</li>
                    <li>Select App as <strong className="text-white">"Other (Custom)"</strong>, name it "Portfolio CRM Integration", and click <strong className="text-white">Generate</strong>.</li>
                    <li>Google will display a golden 16-character App Password (like <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-[#06B6D4]">abcd efgh ijkl mnop</code>). Copy this password and paste it below!</li>
                  </ol>
                </div>

                <div className="glass-card bg-[#151528]/50 border border-white/5 rounded-2xl p-6 space-y-6">
                  {/* Toggle Notification status */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-white block">Email Dispatch Services</span>
                      <p className="text-xs text-[#94A3B8]">Toggle whether the backend should transmit live notification emails to you.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enableNotifications} 
                        onChange={(e) => setEnableNotifications(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06B6D4]" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Sender Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Sender Gmail Account (Mail Service Address)</label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="devrobayad.info@gmail.com"
                      />
                      <p className="text-[10px] text-zinc-500">The Gmail account used to authenticate and send out emails.</p>
                    </div>

                    {/* App Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Sender Gmail App Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono tracking-widest"
                          placeholder="•••• •••• •••• ••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-[11px] font-semibold"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500">The 16-character App Password generated from Google settings.</p>
                    </div>

                    {/* Receiver Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Receiving Notifications Inbox (Your Inbox Email)</label>
                      <input
                        type="email"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="robayed.info@gmail.com"
                      />
                      <p className="text-[10px] text-zinc-500">This is where all user contact details & calendar booking summaries will land safely.</p>
                    </div>
                  </div>

                  {/* Connection Tester console */}
                  <div className="border border-white/5 bg-[#0A0A16] rounded-2xl p-4 space-y-3">
                    <span className="text-xs font-bold text-white block">Connection Diagnostics Tool</span>
                    <p className="text-[11px] text-[#94A3B8]">Validate your SMTP app password directly before applying. Clicking below will send a diagnostic secure greeting card to your inbox address instantly.</p>
                    
                    {testLogs && (
                      <div className={`text-xs p-3.5 rounded-xl font-mono leading-relaxed border ${
                        testSuccess 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/5 border-rose-500/15 text-rose-400'
                      }`}>
                        <strong>Logs:</strong> {testLogs}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={testLoading}
                      onClick={handleTestEmailSettings}
                      className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#7C3AED] rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                    >
                      {testLoading ? 'Dispatched Testing Packet...' : 'Test Connection Status'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveEmailSettings}
                    className="px-6 py-2.5 bg-[#06B6D4] text-slate-900 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    Save SMTP Configuration
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 15: SECURITY & ADMIN CREDENTIALS */}
            {activeSection === 'credentials' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Admin Security & Profile</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
                    Manage your Admin Panel login profile. You can change your administrator username and secure authentication password from this module.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    ⚠️ Developer Notice & Reselling Safety
                  </h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    If you are preparing to sell, deliver, or transfer this application codebase to a user or client, configure temporary default credentials (demo username and simple password) before handing over the files. The new administrator can then log in and securely change these credentials to their private, secret keys instantly.
                  </p>
                  <p className="text-xs text-amber-500/80 font-mono font-bold leading-relaxed">
                    ✨ Note: For enhanced security and verification, successfully updating your login credentials will automatically sign you out. Please sign back in with your newly updated credentials.
                  </p>
                </div>

                <div className="glass-card bg-[#151528]/50 border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                    {/* Username */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Administrator Username / Login ID</label>
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                        placeholder="Admin username e.g. robayad"
                      />
                      <p className="text-[10px] text-zinc-500 font-sans">Case sensitive. Used to authenticate at the terminal gate.</p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">New Private Password (Leave blank to keep current)</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono"
                        placeholder="••••••••"
                      />
                      <p className="text-[10px] text-zinc-500 font-sans">Only input if you want to alter the present portal pass code.</p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Confirm New Password</label>
                      <input
                        type="password"
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono"
                        placeholder="••••••••"
                      />
                      <p className="text-[10px] text-zinc-500 font-sans">Must exactly match the field value to the left.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    type="button"
                    disabled={updatingCredentials}
                    onClick={handleSaveCredentials}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] text-white rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {updatingCredentials ? 'Updating Terminal Security...' : 'Save & Update Admin Credentials'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
