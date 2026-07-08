import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    let lastParticle = 0;

    let mouseX = 0;
    let mouseY = 0;
    let prevX = 0;
    let prevY = 0;
    let frameId = null;

    const createParticle = (x, y) => {
      // Create DOM element for particle
      const particle = document.createElement("span");
      particle.className = "cursor-particle";
      
      const particleColors = [
        "#a855f7",
        "#ec4899",
        "#22d3ee",
        "#3b82f6",
        "#f97316"
      ];
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      particle.style.background = color;
      particle.style.boxShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
      particle.style.color = color; // For currentColor drop-shadow

      particle.style.setProperty('--x', (x + 6) + "px");
      particle.style.setProperty('--y', (y + 9) + "px");

      document.body.appendChild(particle);

      // Remove after animation to prevent memory leaks
      setTimeout(() => {
        particle.remove();
      }, 700);
    };

    const move = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // 1. Hide custom cursor if hovering over input, textarea, or contenteditable
      const target = e.target;
      const isInput = 
        target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable);
        
      if (cursorRef.current) {
        cursorRef.current.style.opacity = isInput ? '0' : '1';
      }

      if (!frameId) {
        frameId = requestAnimationFrame(updateCursor);
      }
    };

    const updateCursor = () => {
      frameId = null;

      // 2. Arrow instantly tracks exact coordinate
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // 3. Spawn particles only when moving
      const hasMoved = mouseX !== prevX || mouseY !== prevY;
      if (hasMoved) {
        prevX = mouseX;
        prevY = mouseY;

        if (Date.now() - lastParticle > 60) {
          // limit particles
          if (document.querySelectorAll('.cursor-particle').length < 12) {
            const target = document.elementFromPoint(mouseX, mouseY);
            const isInput = target && (
              target.tagName === 'INPUT' || 
              target.tagName === 'TEXTAREA' || 
              target.isContentEditable
            );
            if (!isInput) {
              createParticle(mouseX, mouseY);
              lastParticle = Date.now();
            }
          }
        }
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
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
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
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="premium-arrow-svg">
        <defs>
          <linearGradient id="magic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glass-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.3" />
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
