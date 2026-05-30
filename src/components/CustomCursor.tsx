import React, { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  styleType?: 'system' | 'neon' | 'magnetic' | 'retro';
}

export default function CustomCursor({ styleType = 'system' }: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Keep track of current mouse position and target positions
  const mouseCoords = useRef({ x: 0, y: 0 });
  const ringCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (styleType === 'system') {
      document.documentElement.classList.remove('custom-cursor-active');
      return;
    }

    // Add CSS class to hide real cursor on fine pointer devices (desktops)
    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    // Detect if hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Dynamic animation loop for outer ring smoothing
    let animationFrameId: number;
    const updateCursor = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;

      if (dot) {
        // Dot moves instantly with the mouse
        dot.style.transform = `translate3d(${mouseCoords.current.x}px, ${mouseCoords.current.y}px, 0) translate3d(-50%, -50%, 0)`;
      }

      if (ring) {
        // Outer ring smoothly interpolates with ease-out inertia
        const ease = styleType === 'retro' ? 0.4 : 0.15; // retro reacts tighter
        ringCoords.current.x += (mouseCoords.current.x - ringCoords.current.x) * ease;
        ringCoords.current.y += (mouseCoords.current.y - ringCoords.current.y) * ease;

        ring.style.transform = `translate3d(${ringCoords.current.x}px, ${ringCoords.current.y}px, 0) translate3d(-50%, -50%, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [styleType, isVisible]);

  if (styleType === 'system' || !isVisible) {
    return null;
  }

  // Neon Cursor Layout
  if (styleType === 'neon') {
    return (
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[999999]">
        {/* Glow outer ring */}
        <div
          ref={ringRef}
          className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#06B6D4] opacity-50 bg-cyan-500/10 transition-all duration-150 ease-out flex items-center justify-center pointer-events-none"
          style={{
            transform: 'translate3d(-100px, -100px, 0)',
            width: isHovered ? '48px' : isClicked ? '24px' : '32px',
            height: isHovered ? '48px' : isClicked ? '24px' : '32px',
            borderColor: isHovered ? '#EC4899' : '#06B6D4',
            boxShadow: isHovered ? '0 0 16px rgba(236, 72, 153, 0.6)' : '0 0 12px rgba(6, 182, 212, 0.4)',
          }}
        />
        {/* Core center micro dot */}
        <div
          ref={dotRef}
          className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none"
          style={{
            transform: 'translate3d(-100px, -100px, 0)',
            backgroundColor: isHovered ? '#EC4899' : '#0284C7',
            boxShadow: isHovered ? '0 0 8px #EC4899' : '0 0 8px #06B6D4',
          }}
        />
      </div>
    );
  }

  // Magnetic Dot Loop
  if (styleType === 'magnetic') {
    return (
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[999999]">
        {/* Elegant soft circle wrapper trailing */}
        <div
          ref={ringRef}
          className="fixed top-0 left-0 rounded-full border-2 border-white/30 pointer-events-none transition-all duration-200 ease-out"
          style={{
            transform: 'translate3d(-100px, -100px, 0)',
            width: isHovered ? '56px' : isClicked ? '20px' : '40px',
            height: isHovered ? '56px' : isClicked ? '20px' : '40px',
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            borderColor: isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          }}
        />
        {/* Tiny clean state-less focus dot */}
        <div
          ref={dotRef}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none"
          style={{
            transform: 'translate3d(-100px, -100px, 0)',
          }}
        />
      </div>
    );
  }

  // Retro Command Terminal Pulse Block
  if (styleType === 'retro') {
    return (
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[999999]">
        {/* Outlined hacker bracket wrapper */}
        <div
          ref={ringRef}
          className="fixed top-0 left-0 border border-[#22C55E]/40 pointer-events-none flex items-center justify-center transition-all duration-100"
          style={{
            width: isHovered ? '32px' : '20px',
            height: isHovered ? '32px' : '20px',
            transform: 'translate3d(-100px, -100px, 0)',
          }}
        />
        {/* Core blinking green cursor block */}
        <div
          ref={dotRef}
          className="fixed top-0 left-0 bg-[#22C55E]/80 animate-pulse pointer-events-none"
          style={{
            width: isHovered ? '12px' : '6px',
            height: isHovered ? '12px' : '6px',
            transform: 'translate3d(-100px, -100px, 0)',
            boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)',
          }}
        />
      </div>
    );
  }

  return null;
}
