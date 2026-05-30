import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Facebook, Mail, Edit } from 'lucide-react';
import { SocialLinks, FooterData } from '../types';
import IconRenderer from './IconRenderer';

interface FooterProps {
  social: SocialLinks | null;
  footer: FooterData | null;
  setActiveTab: (tab: string) => void;
}

export default function Footer({ social, footer, setActiveTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const logoText = footer?.logoText || "devrobayad";
  const copyrightText = footer?.copyrightText || "Robayad Hasan Jam. All rights reserved.";
  const developerText = footer?.developerText || "Web Developer & AI Agent Developer";
  const developerUrlLabel = footer?.developerUrlLabel || "devrobayad.com";
  const developerUrl = footer?.developerUrl || "https://devrobayad.com";

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('admin_token');
      setIsAdmin(!!token);
    };

    checkToken();
    const interval = setInterval(checkToken, 2000);
    window.addEventListener('focus', checkToken);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkToken);
    };
  }, []);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <footer className="relative mt-24">
      {/* Dynamic gradient top line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] opacity-75" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          {/* Logo brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="cursor-pointer hover:brightness-110 transition-all duration-300 flex items-center"
          >
            {footer?.footerLogoImg ? (
              <img 
                src={footer.footerLogoImg} 
                alt="Footer Logo" 
                className="h-10 w-auto object-contain max-w-[180px]" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899] bg-clip-text text-transparent">
                {logoText}
              </span>
            )}
          </div>

          {/* Center Links & Social */}
          <div className="flex flex-col items-center gap-4">
            {/* Custom Footer Links */}
            {footer?.customLinks && footer.customLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#94A3B8] font-medium">
                {footer.customLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    onClick={(e) => {
                      if (link.url.startsWith('#')) {
                        e.preventDefault();
                        const tabId = link.url.replace('#', '');
                        handleNavClick(tabId);
                      }
                    }}
                    className="hover:text-[#06B6D4] transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Social icons */}
            <div className="flex items-center justify-center space-x-4">
              {social?.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#06B6D4] text-[#94A3B8] hover:text-[#06B6D4] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-350"
                >
                  <Github size={18} />
                </a>
              )}
              {social?.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#7C3AED] text-[#94A3B8] hover:text-[#7C3AED] hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all duration-350"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#EC4899] text-[#94A3B8] hover:text-[#EC4899] hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-350"
                >
                  <Facebook size={18} />
                </a>
              )}
              {social?.email && (
                <a
                  href={`mailto:${social.email}`}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-white text-[#94A3B8] hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-350"
                >
                  <Mail size={18} />
                </a>
              )}

              {/* Custom Dynamic Social Channels (Lucide & Font Icons) */}
              {social?.customChannels && social.customChannels.map((channel) => {
                const borderCol = channel.borderColor || '#06B6D4';
                return (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#94A3B8] transition-all duration-350"
                    onMouseOver={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = borderCol;
                      el.style.boxShadow = `0 0 15px ${borderCol}40`;
                      el.style.color = borderCol;
                    }}
                    onMouseOut={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(255,255,255,0.1)';
                      el.style.boxShadow = 'none';
                      el.style.color = '#94A3B8';
                    }}
                  >
                    {channel.iconType === 'lucide' ? (
                      <IconRenderer name={channel.iconValue} size={18} />
                    ) : (
                      <i className={`${channel.iconValue} text-sm`} />
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright text */}
          <div className="text-center md:text-right text-xs text-[#94A3B8]">
            <p>© {currentYear} {copyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
