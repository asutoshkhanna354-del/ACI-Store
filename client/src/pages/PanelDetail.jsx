import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export default function PanelDetail() {
  const { id } = useParams();
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { formatPrice, t } = useCurrency();
  const navigate = useNavigate();
  const galleryRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    setPanel(null);
    setActiveMedia(0);
    setSelectedDuration('');
    setLoading(true);
    apiFetch(`/store/panels/${id}`)
      .then(data => {
        setPanel(data);
        const durations = getPanelDurations(data);
        if (durations.length > 0) setSelectedDuration(durations[0].key);
      })
      .catch(() => { toast.error('Panel not found'); setPanel(null); })
      .finally(() => setLoading(false));
  }, [id]);

  const getPanelDurations = (p) => {
    if (!p) return [];
    const durations = [];
    const hidden = p.hidden_durations || {};
    const fixedDays = [
      { key: '1day', days: 1, label: t('day1'), priceField: 'price_1day' },
      { key: '7day', days: 7, label: t('days7'), priceField: 'price_7day' },
      { key: '30day', days: 30, label: t('days30'), priceField: 'price_30day' },
      { key: '60day', days: 60, label: t('days60'), priceField: 'price_60day' },
    ];
    fixedDays.forEach(fd => {
      if (hidden[fd.key]) return;
      const price = parseFloat(p[fd.priceField]);
      if (price > 0) durations.push({ key: fd.key, days: fd.days, label: fd.label, price });
    });
    const customPrices = p.custom_prices || {};
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

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedDuration) { toast.error('Select a duration'); return; }
    addToCart(panel, selectedDuration);
    toast.success(`${panel.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedDuration) { toast.error('Select a duration'); return; }
    addToCart(panel, selectedDuration);
    navigate('/checkout');
  };

  const media = panel?.images || [];
  const totalMedia = media.length;
  const safeActiveMedia = activeMedia < totalMedia ? activeMedia : 0;

  const goToMedia = (idx) => {
    if (idx >= 0 && idx < totalMedia) setActiveMedia(idx);
  };

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && safeActiveMedia < totalMedia - 1) goToMedia(safeActiveMedia + 1);
      if (diff < 0 && safeActiveMedia > 0) goToMedia(safeActiveMedia - 1);
    }
    setTouchStart(null);
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="empty-state"><h3>Loading...</h3></div></div>;
  if (!panel) return <div className="container" style={{ padding: '60px 20px' }}><div className="empty-state"><h3>Panel not found</h3></div></div>;

  const durations = getPanelDurations(panel);
  const selectedDur = durations.find(d => d.key === selectedDuration) || durations[0];
  const currentMedia = media[safeActiveMedia];
  const platformLabel = panel.platform === 'ios' ? '🍎 iOS' : panel.platform === 'android' ? '🤖 Android' : panel.platform === 'pc' ? '💻 PC' : panel.platform === 'ipad' ? '📱 iPadOS' : '📱 Both';

  return (
    <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <button onClick={() => navigate('/store')} className="btn btn-outline btn-sm" style={{ marginBottom: '20px' }}>
        ← Back to Store
      </button>

      <div className="panel-detail-layout">
        <div className="panel-detail-gallery">
          <div
            className="panel-detail-main-media"
            ref={galleryRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {totalMedia === 0 || !currentMedia ? (
              <div className="panel-detail-placeholder">📦</div>
            ) : currentMedia.media_type === 'video' ? (
              <video
                key={currentMedia.filename}
                src={`/uploads/${currentMedia.filename}`}
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', background: '#000' }}
              />
            ) : (
              <img
                src={`/uploads/${currentMedia.filename}`}
                alt={panel.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
              />
            )}

            {totalMedia > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-arrow-left"
                  onClick={() => goToMedia(safeActiveMedia - 1)}
                  disabled={safeActiveMedia === 0}
                >‹</button>
                <button
                  className="gallery-arrow gallery-arrow-right"
                  onClick={() => goToMedia(safeActiveMedia + 1)}
                  disabled={safeActiveMedia === totalMedia - 1}
                >›</button>
              </>
            )}

            <div className="gallery-counter">{safeActiveMedia + 1} / {totalMedia || 1}</div>
          </div>

          {totalMedia > 1 && (
            <div className="panel-detail-thumbnails">
              {media.map((m, idx) => (
                <div
                  key={m.id}
                  className={`panel-detail-thumb ${safeActiveMedia === idx ? 'active' : ''}`}
                  onClick={() => setActiveMedia(idx)}
                >
                  {m.media_type === 'video' ? (
                    <div className="thumb-video-indicator">
                      <video src={`/uploads/${m.filename}`} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="thumb-play-icon">▶</span>
                    </div>
                  ) : (
                    <img src={`/uploads/${m.filename}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-detail-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="platform-badge" style={{ position: 'static' }}>{platformLabel}</span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '20px' }}>✓ In Stock</span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>{panel.name}</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>{panel.section_name}</p>

          {selectedDur && (
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)', margin: '16px 0' }}>
              {formatPrice(selectedDur.price)}
            </p>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Select Duration</p>
            {durations.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No purchasable durations available for this panel.</p>
            ) : (
              <select
                value={selectedDuration}
                onChange={e => setSelectedDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '2px solid var(--accent)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  appearance: 'auto'
                }}
              >
                {durations.map(d => (
                  <option key={d.key} value={d.key}>
                    {d.label} — {formatPrice(d.price)} — In Stock
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: '700' }}
              onClick={handleBuyNow}
              disabled={!selectedDur}
            >
              Buy Now
            </button>
            <button
              className="btn btn-outline btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', fontWeight: '600' }}
              onClick={handleAddToCart}
              disabled={!selectedDur}
            >
              {t('addToCart')}
            </button>
          </div>

          {panel.features && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Features</p>
              <div className="panel-features" style={{ flexWrap: 'wrap' }}>
                {panel.features.split(',').map((f, i) => <span key={i}>{f.trim()}</span>)}
              </div>
            </div>
          )}

          {panel.description && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{panel.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
