import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { FooterData } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  footer: FooterData | null;
}

export default function Navbar({ activeTab, setActiveTab, footer }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-card border-b border-white/5 py-3 shadow-lg backdrop-blur-md bg-[#0F0F1A]/80' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex-shrink-0 cursor-pointer hover:brightness-110 transition-all duration-300 flex items-center"
          >
            {footer?.headerLogoImg ? (
              <img 
                src={footer.headerLogoImg} 
                alt="Logo" 
                className="h-10 w-auto object-contain max-w-[180px]" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent">
                {footer?.logoText || "devrobayad"}
              </span>
            )}
          </div>
 
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-[#06B6D4] font-semibold' 
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.65)]" />
                  )}
                </button>
              );
            })}
          </div>
 
          {/* Mobile hamburger button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 transition-colors focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-card border-t border-white/5 py-4 px-4 bg-[#0F0F1A]/95 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/10 text-[#06B6D4] border-l-4 border-[#06B6D4]' 
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
