import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../api';

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
);

export default function Home() {
  const { storeSettings } = useTheme();
  const settings = storeSettings || {};
  const [stats, setStats] = useState({ panels: 0, sections: 0 });
  const { t } = useCurrency();
  const [supportOpen, setSupportOpen] = useState(false);
  const [latestFiles, setLatestFiles] = useState([]);

  useEffect(() => {
    apiFetch('/store/panels').then(p => {
      setStats(prev => ({ ...prev, panels: p.length }));
    }).catch(() => {});
    apiFetch('/store/sections').then(s => {
      setStats(prev => ({ ...prev, sections: s.length }));
    }).catch(() => {});
    apiFetch('/store/panel-files').then(files => {
      setLatestFiles((files || []).slice(0, 6));
    }).catch(() => {});
  }, []);

  const hasTelegram = !!settings.telegram_support;
  const hasWhatsapp = !!settings.whatsapp_support;
  const hasAnySupport = hasTelegram || hasWhatsapp;
  const getWhatsappUrl = () => {
    if (!settings.whatsapp_support) return '#';
    return settings.whatsapp_support.startsWith('http') ? settings.whatsapp_support : `https://wa.me/${settings.whatsapp_support.replace(/[^0-9]/g, '')}`;
  };

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>{settings.store_name || 'FF Panel'}</h1>
        <p>{settings.store_description || t('defaultDesc')}</p>
        <div className="hero-buttons">
          <Link to="/store" className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 28px', width: '100%', justifyContent: 'center' }}>
            {t('browseStore')} →
          </Link>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <Link to="/register" className="btn btn-outline" style={{ fontSize: '15px', padding: '14px 0', flex: 1, justifyContent: 'center' }}>
              {t('createAccount')}
            </Link>
            <button
              className="btn btn-outline"
              style={{ fontSize: '15px', padding: '14px 0', flex: 1, justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: hasAnySupport ? 'var(--accent-light)' : 'transparent', opacity: hasAnySupport ? 1 : 0.5 }}
              onClick={() => hasAnySupport && setSupportOpen(true)}
            >
              {t('supportBtn')}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <h3>{stats.panels}+</h3>
            <p>{t('panelsAvailable')}</p>
          </div>
          <div className="stat-item">
            <h3>{stats.sections}</h3>
            <p>{t('categories')}</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>{t('support')}</p>
          </div>
          <div className="stat-item">
            <h3>iOS/Android</h3>
            <p>{t('bothPlatforms')}</p>
          </div>
        </div>
      </div>

      {settings.announcement && (
        <div className="container mt-3">
          <div className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
            <p style={{ color: 'var(--warning)', fontWeight: '600', fontSize: '14px' }}>📢 {settings.announcement}</p>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(135deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('whyChoose')} {settings.store_name || 'FF Panel'}?
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '14px' }}>
          {t('weProvide')}
        </p>

        <div className="grid-3">
          {[
            { icon: '🎯', title: t('premiumQuality'), desc: t('premiumQualityDesc') },
            { icon: '⚡', title: t('instantDelivery'), desc: t('instantDeliveryDesc') },
            { icon: '🛡️', title: t('safeSecure'), desc: t('safeSecureDesc') },
            { icon: '📱', title: t('multiPlatform'), desc: t('multiPlatformDesc') },
            { icon: '💬', title: t('support247'), desc: t('support247Desc') },
            { icon: '💰', title: t('bestPrices'), desc: t('bestPricesDesc') },
          ].map((item, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', animationDelay: `${i * 0.5}s` }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', filter: 'drop-shadow(0 0 10px var(--accent-glow))' }}>{item.icon}</div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '700' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {latestFiles.length > 0 && (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(135deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Latest Panels
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>
            Download the latest panel files
          </p>
          <div className="grid-3">
            {latestFiles.map(f => (
              <div key={f.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{f.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{f.panel_name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>v{f.version}</p>
                <a href={`/api/store/panel-files/${f.id}/download`} className="btn btn-sm btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Download
                </a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/panels" className="btn btn-outline btn-sm">View All Panels →</Link>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(12,12,24,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '48px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-light), transparent)', animation: 'breathe 4s ease-in-out infinite' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', position: 'relative' }}>
          {t('readyToStart')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px', fontSize: '14px', position: 'relative' }}>
          {t('readyToStartDesc')}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>
            {t('getStartedFree')}
          </Link>
          <Link to="/store" className="btn btn-outline" style={{ fontSize: '15px', padding: '14px 28px' }}>
            {t('browseStore')}
          </Link>
        </div>
      </div>

      {supportOpen && createPortal(
        <div className="support-modal-overlay" onClick={() => setSupportOpen(false)}>
          <div className="support-modal" onClick={e => e.stopPropagation()}>
            <div className="support-modal-header">
              <span>{t('supportBtn')}</span>
              <button className="support-modal-close" onClick={() => setSupportOpen(false)}>✕</button>
            </div>
            <div className="support-modal-body">
              {hasTelegram && (
                <a href={settings.telegram_support} target="_blank" rel="noopener noreferrer" className="support-modal-item telegram" onClick={() => setSupportOpen(false)}>
                  <TelegramIcon /> Telegram
                </a>
              )}
              {hasWhatsapp && (
                <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="support-modal-item whatsapp" onClick={() => setSupportOpen(false)}>
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
