import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import AboutTab from './components/AboutTab';
import SkillsTab from './components/SkillsTab';
import ProjectsTab from './components/ProjectsTab';
import ServicesTab from './components/ServicesTab';
import ContactTab from './components/ContactTab';
import FaqSection from './components/FaqSection';
import BookingConfirmed from './components/BookingConfirmed';
import AdminPanel from './components/AdminPanel';
import AllProjectsPage from './components/AllProjectsPage';
import AllServicesPage from './components/AllServicesPage';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import { HeroData, AboutData, Skill, Project, SocialLinks, FooterData, PricingState, Booking, ServiceItem, CounterItem } from './types';
import { Terminal, Cpu, Loader2, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ClientDB } from './lib/db';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [preSelectedService, setPreSelectedService] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // --- PUBLIC CORE DATASETS ---
  const [hero, setHero] = useState<HeroData | null>(null);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [social, setSocial] = useState<SocialLinks | null>(null);
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [pricing, setPricing] = useState<PricingState | null>(null);
  const [counters, setCounters] = useState<CounterItem[] | null>(null);

  // loading state managers
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [timeMinElapsed, setTimeMinElapsed] = useState<boolean>(false);
  const [preloaderActive, setPreloaderActive] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Initial datasets loader
  const fetchPublicPayloads = async () => {
    try {
      const data = await ClientDB.loadAllData();

      setHero(data.hero);
      setAbout(data.about);
      setSkills(data.skills);
      setProjects(data.projects);
      setServices(data.services);
      setSocial(data.social);
      setFooter(data.footer || null);
      setPricing(data.pricing);
      setCounters(data.counters || null);
      setDataFetched(true);

      // Fast-pass preloader if disabled
      if (data.footer && data.footer.preloaderEnabled === false) {
        setTimeMinElapsed(true);
        setPreloaderActive(false);
      }
    } catch (error) {
      console.warn("Retrying public database load...", error);
      // Wait and re-fetch to protect against early server connection lags
      setTimeout(fetchPublicPayloads, 2000);
    }
  };

  useEffect(() => {
    fetchPublicPayloads();
  }, []);

  // Set the timer based on the footer preloader settings
  useEffect(() => {
    let duration = 1500;
    if (footer) {
      if (footer.preloaderEnabled === false) {
        setTimeMinElapsed(true);
        return;
      }
      duration = footer.preloaderDuration !== undefined ? footer.preloaderDuration : 1500;
    }
    const timer = setTimeout(() => {
      setTimeMinElapsed(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [footer]);

  // Synchronize document title and favicon dynamically as configured from site settings
  useEffect(() => {
    if (footer) {
      if (footer.siteTitle) {
        document.title = footer.siteTitle;
      }
      if (footer.siteFavicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = footer.siteFavicon;
      }
    }
  }, [footer]);

  // Sync tab hash routing to URL hashes to support direct URL navigations (e.g. /#projects, /#admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && ['home', 'about', 'skills', 'projects', 'services', 'contact', 'admin', 'all-projects', 'all-services'].includes(hash)) {
        setActiveTab(hash);
        if (!['admin', 'booking-confirmed', 'all-projects', 'all-services'].includes(hash)) {
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 200);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Initial load
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash selectively to maintain router references and smooth scroll to section
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (['booking-confirmed', 'admin', 'all-projects', 'all-services'].includes(tabId)) {
      window.location.hash = tabId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = tabId === 'home' ? '' : `#${tabId}`;
      setTimeout(() => {
        const element = document.getElementById(tabId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Dynamic Scroll Spy to highlight Navbar active elements on manual scroll
  useEffect(() => {
    if (['admin', 'booking-confirmed', 'all-projects', 'all-services'].includes(activeTab)) return;

    const sections = ['home', 'about', 'skills', 'projects', 'services', 'faq', 'contact'];
    let timeoutId: any = null;

    const handleScrollSpy = () => {
      // Small debounce
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY + 200; // offset for the fixed navbar

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              if (activeTab !== section) {
                // Update local state without programmatically scrolling again
                setActiveTab(section);
              }
              break;
            }
          }
        }
      }, 30);
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  // Monitor scrolling to toggle Scroll-to-Top visibility
  useEffect(() => {
    const handleScrollVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScrollVisibility);
    return () => window.removeEventListener('scroll', handleScrollVisibility);
  }, []);

  const handleBookingSuccess = (bookingDetails: Booking) => {
    setConfirmedBooking(bookingDetails);
    handleTabChange('booking-confirmed');
  };

  // ==========================================
  // 💻 RENDER CORE PORTFOLIO APPLICATION
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#F8FAFC] flex flex-col justify-between w-full overflow-x-hidden">
      
      {/* Dynamic Customizable Preloader Overlay with premium exit motions */}
      {preloaderActive && (
        <Preloader 
          footer={footer} 
          isLoading={!(dataFetched && timeMinElapsed)} 
          onFinished={() => setPreloaderActive(false)} 
        />
      )}
      
      {/* Interactive Custom Mouse cursor animations and trail options (system/neon/magnetic/retro) */}
      <CustomCursor styleType={footer?.cursorStyle || 'system'} />
      
      {dataFetched && (
        <>
          {/* Dynamic Navigation Header */}
          <Navbar activeTab={activeTab} setActiveTab={handleTabChange} footer={footer} />

      {/* Primary Tab Viewport and shell space */}
      <main className="flex-grow">
        
        {/* Render all landing page sections sequentially if on the main portfolio view */}
        {!['admin', 'booking-confirmed', 'all-projects', 'all-services'].includes(activeTab) && (
          <div className="space-y-0">
            <motion.section 
              id="home" 
              className="scroll-mt-20 pt-28"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <HomeTab hero={hero} about={about} counters={counters} setActiveTab={handleTabChange} />
            </motion.section>

            <motion.section 
              id="about" 
              className="scroll-mt-20 border-t border-white/5 py-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <AboutTab about={about} social={social} />
            </motion.section>

            <motion.section 
              id="skills" 
              className="scroll-mt-20 border-t border-white/5 py-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <SkillsTab skills={skills} />
            </motion.section>

            <motion.section 
              id="projects" 
              className="scroll-mt-20 border-t border-white/5 py-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectsTab 
                projects={projects} 
                limit={6}
                onViewAll={() => handleTabChange('all-projects')}
              />
            </motion.section>

            <motion.section 
              id="services" 
              className="scroll-mt-20 border-t border-white/5 py-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServicesTab 
                services={services || []}
                setActiveTab={handleTabChange} 
                setPreSelectedService={setPreSelectedService} 
                limit={6}
                onViewAll={() => handleTabChange('all-services')}
              />
            </motion.section>

            <motion.section 
              id="faq" 
              className="scroll-mt-20 border-t border-white/5 py-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <FaqSection faq={pricing?.faq} />
            </motion.section>

            <motion.section 
              id="contact" 
              className="scroll-mt-20 border-t border-white/5 py-12 pb-24"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <ContactTab 
                social={social} 
                preSelectedService={preSelectedService}
                setPreSelectedService={setPreSelectedService}
                onBookingSuccess={handleBookingSuccess}
              />
            </motion.section>
          </div>
        )}

        {/* Dedicated view for all projects page */}
        {activeTab === 'all-projects' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pt-28"
          >
            <AllProjectsPage 
              projects={projects} 
              onBack={() => handleTabChange('home')} 
            />
          </motion.div>
        )}

        {/* Dedicated view for all services page */}
        {activeTab === 'all-services' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pt-28"
          >
            <AllServicesPage 
              services={services} 
              onBack={() => handleTabChange('home')} 
              setActiveTab={handleTabChange}
              setPreSelectedService={setPreSelectedService}
            />
          </motion.div>
        )}

        {/* Dedicated view for booking success */}
        {activeTab === 'booking-confirmed' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pt-28"
          >
            <BookingConfirmed 
              booking={confirmedBooking} 
              setActiveTab={handleTabChange} 
            />
          </motion.div>
        )}

        {/* Dedicated view for admin backend CMS */}
        {activeTab === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pt-28"
          >
            <AdminPanel onLogout={() => handleTabChange('home')} onDataChange={fetchPublicPayloads} />
          </motion.div>
        )}

      </main>

          {/* Dynamic Navigation Footer */}
          <Footer footer={footer} social={social} setActiveTab={handleTabChange} />

          {/* Scroll to top floating action button */}
          {showScrollTop && (
            <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-3.5 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-full text-slate-950 font-bold hover:scale-110 active:scale-95 shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] cursor-pointer transition-all duration-300 flex items-center justify-center border border-white/20"
                title="Scroll to Top"
              >
                <ArrowUp size={18} className="text-white" strokeWidth={3} />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
