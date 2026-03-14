import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ThemeContext = createContext();
const CACHE_KEY = 'ff_theme_cache';

function hexToHSL(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyThemeColor(hex) {
  const { h, s, l } = hexToHSL(hex);
  const root = document.documentElement;
  root.style.setProperty('--accent', `hsl(${h}, ${s}%, ${l}%)`);
  root.style.setProperty('--accent-hover', `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.max(l - 8, 20)}%)`);
  root.style.setProperty('--accent-dark', `hsl(${h}, ${Math.min(s + 15, 100)}%, ${Math.max(l - 15, 15)}%)`);
  root.style.setProperty('--accent-light', `hsla(${h}, ${s}%, ${l}%, 0.12)`);
  root.style.setProperty('--accent-glow', `hsla(${h}, ${s}%, ${l}%, 0.25)`);
  root.style.setProperty('--accent-glow-strong', `hsla(${h}, ${s}%, ${l}%, 0.4)`);
  root.style.setProperty('--border-glow', `hsla(${h}, ${s}%, ${l}%, 0.2)`);
  root.style.setProperty('--gradient-purple', `linear-gradient(135deg, hsl(${h}, ${s}%, ${l}%) 0%, hsl(${h}, ${Math.min(s + 15, 100)}%, ${Math.max(l - 15, 15)}%) 50%, hsl(${h}, ${Math.min(s + 20, 100)}%, ${Math.max(l - 20, 10)}%) 100%)`);
}

function getCachedSettings() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

function cacheSettings(settings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {}
}

const cached = getCachedSettings();
if (cached?.theme_color) {
  applyThemeColor(cached.theme_color);
}
if (cached?.store_name) {
  document.title = `${cached.store_name} - Premium Panels Store`;
}

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColor] = useState(cached?.theme_color || '#a855f7');
  const [particleEffect, setParticleEffect] = useState(cached?.particle_effect || 'none');
  const [bannerData, setBannerData] = useState(() => {
    if (cached?.banner_data) {
      try {
        const bd = JSON.parse(cached.banner_data);
        if (bd?.enabled) return bd;
      } catch {}
    }
    return null;
  });
  const [storeName, setStoreName] = useState(cached?.store_name || '');
  const [storeSettings, setStoreSettings] = useState(cached || null);
  const [loaded, setLoaded] = useState(!!cached);

  useEffect(() => {
    apiFetch('/store/settings').then(s => {
      cacheSettings(s);
      setStoreSettings(s);
      if (s.theme_color) {
        setThemeColor(s.theme_color);
        applyThemeColor(s.theme_color);
      }
      if (s.particle_effect) setParticleEffect(s.particle_effect);
      if (s.store_name) {
        setStoreName(s.store_name);
        document.title = `${s.store_name} - Premium Panels Store`;
      }
      if (s.banner_data) {
        try {
          const bd = JSON.parse(s.banner_data);
          if (bd?.enabled) setBannerData(bd);
          else setBannerData(null);
        } catch {}
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  return (
    <ThemeContext.Provider value={{ themeColor, particleEffect, bannerData, storeName, storeSettings, loaded }}>
      {loaded ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
