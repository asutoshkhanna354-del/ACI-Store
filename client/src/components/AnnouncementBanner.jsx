import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const typeStyles = {
  news: { icon: '📰', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  discount: { icon: '🏷️', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  event: { icon: '🎉', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  alert: { icon: '🔔', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  custom: { icon: '📢', bg: 'var(--accent-light)', border: 'var(--accent-glow)', color: 'var(--accent)' }
};

export default function AnnouncementBanner() {
  const { bannerData } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!bannerData || !bannerData.enabled || dismissed) return null;

  const type = bannerData.type || 'custom';
  const style = typeStyles[type] || typeStyles.custom;
  const customColor = bannerData.color || style.color;

  return (
    <div style={{
      position: 'relative', zIndex: 50,
      background: type === 'custom' && bannerData.color ? `${bannerData.color}12` : style.bg,
      backdropFilter: 'blur(16px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
      borderBottom: `1px solid ${type === 'custom' && bannerData.color ? `${bannerData.color}30` : style.border}`,
      padding: '10px 16px',
      animation: 'slideDown 0.4s ease'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{style.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {bannerData.title && (
            <strong style={{ fontSize: '13px', color: customColor, display: 'block', marginBottom: '2px' }}>
              {bannerData.title}
            </strong>
          )}
          <p style={{ fontSize: '12px', color: '#c0bfd8', margin: 0, lineHeight: '1.4' }}>
            {bannerData.text}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8e8ca8',
            fontSize: '14px', cursor: 'pointer', padding: '4px 8px', flexShrink: 0, lineHeight: 1,
            borderRadius: '6px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
