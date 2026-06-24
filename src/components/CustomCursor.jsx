import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    let lastParticle = 0;

    const createParticle = (x, y) => {
      // Create DOM element for particle
      const particle = document.createElement("span");
      particle.className = "cursor-particle";
      // Offset so the particle comes out from the tip/tail
      particle.style.left = (x + 8) + "px";
      particle.style.top = (y + 12) + "px";
      
      const particleColors = [
        "#a855f7",
        "#ec4899",
        "#22d3ee",
        "#3b82f6",
        "#f97316"
      ];
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      particle.style.background = color;
      particle.style.boxShadow = `0 0 8px ${color}, 0 0 18px ${color}`;
      particle.style.color = color; // For currentColor drop-shadow

      document.body.appendChild(particle);

      // Remove after animation to prevent memory leaks
      setTimeout(() => {
        particle.remove();
      }, 700);
    };

    const move = (e) => {
      // 1. Hide custom cursor if hovering over input, textarea, or contenteditable
      const target = e.target;
      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
        
      if (isInput) {
        if (cursorRef.current) cursorRef.current.style.opacity = '0';
        return; // Don't spawn particles or track position
      } else {
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
      }

      // 2. Arrow instantly tracks exact coordinate
      requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      });

      // 3. Spawn particles
      if (Date.now() - lastParticle > 35) {
        // limit particles
        if (document.querySelectorAll('.cursor-particle').length < 20) {
          createParticle(e.clientX, e.clientY);
        }
        lastParticle = Date.now();
      }
    };

    window.addEventListener("mousemove", move, { passive: true });

    // Hover effects
    const onEnter = () => {
      cursorRef.current?.classList.add('cursor-hover');
    };
    const onLeave = () => {
      cursorRef.current?.classList.remove('cursor-hover');
    };

    // Attach hover to interactive elements
    const attachHover = () => {
      const targets = document.querySelectorAll('a, button, [role="button"], input, [class*="card"]');
      targets.forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    attachHover();

    // Use a mutation observer to handle dynamically added elements
    const observer = new MutationObserver(() => {
      attachHover();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
      // Remove event listeners
      const targets = document.querySelectorAll('a, button, [role="button"], input, [class*="card"]');
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor-arrow-wrapper">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="premium-arrow-svg">
        <defs>
          <linearGradient id="magic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glass-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7c3aed" floodOpacity="0.4" />
          </filter>
        </defs>
        <path 
          d="M3 3 L12 24 L15 16 L23 13 L3 3Z" 
          fill="url(#magic-gradient)" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinejoin="round"
          filter="url(#glass-shadow)"
        />
      </svg>
    </div>
  );
};

export default CustomCursor;
