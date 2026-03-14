import { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Store() {
  const [sections, setSections] = useState([]);
  const [panels, setPanels] = useState([]);
  const [activeSection, setActiveSection] = useState('all');
  const [activePlatform, setActivePlatform] = useState('all');
  const [selectedDurations, setSelectedDurations] = useState({});
  const { formatPrice, t } = useCurrency();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/store/sections').then(setSections).catch(() => {});
    apiFetch('/store/panels').then(setPanels).catch(() => {});
  }, []);

  const filteredPanels = panels.filter(p => {
    const sectionMatch = activeSection === 'all' || p.section_id === parseInt(activeSection);
    let platformMatch = activePlatform === 'all';
    if (!platformMatch) {
      if (activePlatform === 'ios') platformMatch = p.platform === 'ios' || p.platform === 'both';
      else if (activePlatform === 'ipad') platformMatch = p.platform === 'ipad' || p.platform === 'both';
      else platformMatch = p.platform === activePlatform;
    }
    return sectionMatch && platformMatch;
  });

  const groupedPanels = {};
  filteredPanels.forEach(p => {
    const key = p.section_name || 'Other';
    if (!groupedPanels[key]) groupedPanels[key] = [];
    groupedPanels[key].push(p);
  });

  const getPanelDurations = (panel) => {
    const durations = [];
    const hidden = panel.hidden_durations || {};
    const fixedDays = [
      { key: '1day', days: 1, label: t('day1'), priceField: 'price_1day' },
      { key: '7day', days: 7, label: t('days7'), priceField: 'price_7day' },
      { key: '30day', days: 30, label: t('days30'), priceField: 'price_30day' },
      { key: '60day', days: 60, label: t('days60'), priceField: 'price_60day' },
    ];
    fixedDays.forEach(fd => {
      if (hidden[fd.key]) return;
      const price = parseFloat(panel[fd.priceField]);
      if (price > 0) durations.push({ key: fd.key, days: fd.days, label: fd.label, price });
    });
    const customPrices = panel.custom_prices || {};
    Object.entries(customPrices).forEach(([days, data]) => {
      const dKey = `${days}day`;
      if (hidden[dKey]) return;
      const price = parseFloat(data.price);
      if (price > 0) {
        const d = parseInt(days);
        durations.push({ key: dKey, days: d, label: `${d} ${d === 1 ? 'Day' : 'Days'}`, price });
      }
    });
    durations.sort((a, b) => a.days - b.days);
    return durations;
  };

  const getSelectedDuration = (panelId, durations) => {
    return selectedDurations[panelId] || (durations.length > 0 ? durations[0].key : '');
  };

  const selectDuration = (panelId, key) => {
    setSelectedDurations(prev => ({ ...prev, [panelId]: key }));
  };

  const handleBuy = (panel, durKey) => {
    if (!user) { navigate('/login'); return; }
    if (!durKey) { toast.error('Select a duration'); return; }
    addToCart(panel, durKey);
    navigate('/checkout');
  };

  const icons = { 'Headshot Panels': '🎯', 'Magic Bullet Panels': '🔮', 'ESP Panels': '👁️', 'Fluorite Keys': '🔑' };

  return (
    <div className="container fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="page-title">{t('store')}</h1>
      <p className="page-subtitle">{t('browseOurPremium')}</p>

      <div className="tabs" style={{ marginBottom: '12px' }}>
        {[
          { key: 'all', icon: '🎮', label: t('all') },
          { key: 'ios', icon: '🍎', label: 'iOS' },
          { key: 'android', icon: '🤖', label: 'Android' },
          { key: 'pc', icon: '💻', label: 'PC' },
          { key: 'ipad', icon: '📱', label: 'iPadOS' },
        ].map(p => (
          <button key={p.key} className={`tab ${activePlatform === p.key ? 'active' : ''}`} onClick={() => setActivePlatform(p.key)}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab ${activeSection === 'all' ? 'active' : ''}`} onClick={() => setActiveSection('all')}>{t('all')}</button>
        {sections.map(s => (
          <button key={s.id} className={`tab ${activeSection === String(s.id) ? 'active' : ''}`} onClick={() => setActiveSection(String(s.id))}>
            {s.name}
          </button>
        ))}
      </div>

      {Object.keys(groupedPanels).length === 0 ? (
        <div className="empty-state">
          <h3>{t('noPanelsAvailable')}</h3>
          <p>{t('checkBackLater')}</p>
        </div>
      ) : (
        Object.entries(groupedPanels).map(([sectionName, sectionPanels]) => (
          <div key={sectionName} style={{ marginBottom: '40px' }}>
            <h2 className="section-title">{icons[sectionName] || '📦'} {sectionName}</h2>
            <div className="grid-3">
              {sectionPanels.map(panel => {
                const panelDurations = getPanelDurations(panel);
                const selKey = getSelectedDuration(panel.id, panelDurations);
                const selDur = panelDurations.find(d => d.key === selKey) || panelDurations[0];
                const firstImage = panel.images?.find(i => i.media_type !== 'video') || panel.images?.[0];
                const showDurations = panelDurations;
                return (
                  <div key={panel.id} className="panel-card">
                    <div className="panel-card-img" onClick={() => navigate(`/panel/${panel.id}`)} style={{ cursor: 'pointer', ...(firstImage ? { backgroundImage: `url(/uploads/${firstImage.filename})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                      {!firstImage && <span>{icons[panel.section_name] || '📦'}</span>}
                      <span className="platform-badge">
                        {panel.platform === 'ios' ? '🍎 iOS' : panel.platform === 'android' ? '🤖 Android' : panel.platform === 'pc' ? '💻 PC' : panel.platform === 'ipad' ? '📱 iPadOS' : '📱 Both'}
                      </span>
                    </div>
                    <div className="panel-card-body">
                      <h3>{panel.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{panel.description}</p>
                      {selDur && (
                        <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', margin: '8px 0 4px' }}>
                          {formatPrice(selDur.price)}
                        </p>
                      )}

                      {showDurations.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {showDurations.map(d => (
                            <button
                              key={d.key}
                              onClick={() => selectDuration(panel.id, d.key)}
                              style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                                border: selKey === d.key ? '2px solid var(--accent)' : '1px solid var(--border)',
                                background: selKey === d.key ? 'var(--accent-light)' : 'var(--bg-input)',
                                color: selKey === d.key ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '6px' }}
                        onClick={() => handleBuy(panel, selKey)}
                      >
                        Buy Now
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => navigate(`/panel/${panel.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
