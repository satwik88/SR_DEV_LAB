import React from 'react';
import { createRoot } from 'react-dom/client';
import { PullCord } from '/js/vendor/pullcord.esm.js';

const el = React.createElement;

function PullCordWrapper() {
  const [dark, setDark] = React.useState(() => {
    return window.__isDark ? window.__isDark() : false;
  });

  React.useEffect(() => {
    // Create an observer to watch the HTML data-theme attribute, so we stay in sync if the theme button is clicked
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark !== isDark) setDark(isDark);
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, [dark]);

  const toggle = () => {
    // Trigger the site's existing theme toggle logic
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.click();
    } else if (window.__applyTheme) {
      const nextDark = !dark;
      window.__applyTheme(nextDark);
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
      setDark(nextDark);
    }
  };

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return el(PullCord, {
    onPull: toggle,
    pulled: !dark, // when it is light, the cord is pulled up (dark = false -> pulled = true)
    ariaLabel: "Toggle theme",
    noEntrance: REDUCED,
    config: { gravity: 1250, damping: 0.94, iterations: 20, stretchMax: 26 }
  });
}

const container = document.getElementById("pullcord-root");
if (container) {
  const root = createRoot(container);
  root.render(el(PullCordWrapper));
}
