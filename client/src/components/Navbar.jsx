import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import Logo from './Logo';

const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { currency, setCurrency, language, setLanguage, CURRENCIES, LANGUAGES, currencyInfo, t } = useCurrency();
  const { storeName: themeStoreName, storeSettings } = useTheme();
  const location = useLocation();
  const storeName = themeStoreName || 'FF Panel';
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const currRef = useRef(null);
  const langRef = useRef(null);
  const supportRef = useRef(null);

  const ss = storeSettings || {};
  const hasTelegram = !!ss.telegram_support;
  const hasWhatsapp = !!ss.whatsapp_support;
  const hasAnySupport = hasTelegram || hasWhatsapp;
  const getWhatsappUrl = () => {
    if (!ss.whatsapp_support) return '#';
    return ss.whatsapp_support.startsWith('http') ? ss.whatsapp_support : `https://wa.me/${ss.whatsapp_support.replace(/[^0-9]/g, '')}`;
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (currRef.current && !currRef.current.contains(e.target)) setCurrencyOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (supportRef.current && !supportRef.current.contains(e.target)) setSupportOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isActive = (path) => location.pathname === path ? 'active-link' : '';
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Logo size={28} /> <span>{storeName}</span>
        </Link>

        <div className="navbar-selectors">
          <div className="selector-dropdown" ref={currRef}>
            <button className="selector-btn" onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}>
              {currencyInfo.symbol} {currency}
            </button>
            {currencyOpen && (
              <div className="selector-menu">
                <div className="selector-menu-title">{t('currency')}</div>
                {CURRENCIES.map(c => (
                  <button key={c.code} className={`selector-item ${currency === c.code ? 'active' : ''}`}
                    onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}>
                    <span className="selector-item-symbol">{c.symbol}</span>
                    <span>{c.code}</span>
                    <span className="selector-item-name">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="selector-dropdown" ref={langRef}>
            <button className="selector-btn" onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}>
              {currentLang.flag} {currentLang.code.toUpperCase()}
            </button>
            {langOpen && (
              <div className="selector-menu">
                <div className="selector-menu-title">{t('language')}</div>
                {LANGUAGES.map(l => (
                  <button key={l.code} className={`selector-item ${language === l.code ? 'active' : ''}`}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}>
                    <span className="selector-item-symbol">{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="selector-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
        {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')}>{t('home')}</Link>
          <Link to="/store" className={isActive('/store')}>{t('store')}</Link>
          <Link to="/panels" className={isActive('/panels')}>Panels</Link>
          <Link to="/reseller-login" className={isActive('/reseller-login')}>Reseller</Link>
          {user ? (
            <>
              <Link to="/cart" className={isActive('/cart')}>
                {t('cart')} {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </Link>
              <Link to="/my-orders" className={isActive('/my-orders')}>{t('myOrders')}</Link>
              {user.is_admin && <Link to="/admin" className={isActive('/admin')}>{t('admin')}</Link>}
              <button onClick={() => { logout(); closeMenu(); }} style={{ color: 'var(--danger)' }}>{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>{t('login')}</Link>
              <Link to="/register" className={isActive('/register')}>{t('register')}</Link>
            </>
          )}
          <div className="nav-support-wrapper" ref={supportRef}>
            <button className="nav-support-btn" onClick={() => setSupportOpen(!supportOpen)}>
              {t('supportBtn')}
            </button>
            {supportOpen && (
              <div className="nav-support-dropdown">
                {hasTelegram && (
                  <a href={ss.telegram_support} target="_blank" rel="noopener noreferrer" className="nav-support-item telegram" onClick={() => { setSupportOpen(false); closeMenu(); }}>
                    <TelegramIcon /> Telegram
                  </a>
                )}
                {hasWhatsapp && (
                  <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="nav-support-item whatsapp" onClick={() => { setSupportOpen(false); closeMenu(); }}>
                    <WhatsAppIcon /> WhatsApp
                  </a>
                )}
                {!hasAnySupport && (
                  <span className="nav-support-item" style={{ opacity: 0.5, cursor: 'default', color: 'var(--text-muted)' }}>No links set</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
