import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getToken } from '../../api';
import toast from 'react-hot-toast';

const presetColors = [
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Teal', hex: '#14b8a6' },
];

const particleOptions = [
  { value: 'none', label: 'None', icon: '🚫' },
  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'snow', label: 'Snow', icon: '❄️' },
  { value: 'bubbles', label: 'Bubbles', icon: '🫧' },
  { value: 'stars', label: 'Stars', icon: '✨' },
  { value: 'sparkles', label: 'Sparkles', icon: '💫' },
  { value: 'matrix', label: 'Matrix', icon: '🟩' },
];

const bannerTypes = [
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'discount', label: 'Discount', icon: '🏷️' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'alert', label: 'Alert', icon: '🔔' },
  { value: 'custom', label: 'Custom', icon: '📢' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: '', store_description: '', announcement: '', telegram_support: ''
  });
  const [themeColor, setThemeColor] = useState('#a855f7');
  const [particleEffect, setParticleEffect] = useState('none');
  const [banner, setBanner] = useState({ enabled: false, type: 'news', title: '', text: '', color: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [brandingUploading, setBrandingUploading] = useState(false);
  const logoRef = useRef(null);
  const faviconRef = useRef(null);
  const bannerImgRef = useRef(null);

  useEffect(() => {
    apiFetch('/admin/settings').then(s => {
      setSettings(prev => ({ ...prev, ...s }));
      if (s.theme_color) setThemeColor(s.theme_color);
      if (s.particle_effect) setParticleEffect(s.particle_effect);
      if (s.banner_data) {
        try { setBanner(prev => ({ ...prev, ...JSON.parse(s.banner_data) })); } catch {}
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...settings,
        theme_color: themeColor,
        particle_effect: particleEffect,
        banner_data: JSON.stringify(banner)
      };
      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Settings saved! Changes are now live for all customers.');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const uploadBranding = async (type, inputRef) => {
    if (!inputRef.current?.files?.[0]) return toast.error('Select a file');
    setBrandingUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', inputRef.current.files[0]);
      fd.append('type', type);
      const token = getToken();
      const res = await fetch('/api/admin/upload-branding', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast.success(`${type} uploaded`);
      setSettings(prev => ({ ...prev, [`branding_${type}`]: data.filename }));
    } catch (err) { toast.error(err.message); }
    finally { setBrandingUploading(false); }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'branding', label: 'Branding', icon: '🖼️' },
    { id: 'theme', label: 'Theme', icon: '🎨' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'banner', label: 'Banner', icon: '📢' },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">Store Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Configure your store appearance and features</p>

      <div className="tabs" style={{ marginBottom: '24px' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '700px' }}>
        {activeTab === 'general' && (
          <>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>General</h3>
              <div className="input-group">
                <label>Store Name</label>
                <input type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Store Description</label>
                <textarea value={settings.store_description} onChange={e => setSettings({...settings, store_description: e.target.value})} rows={3} />
              </div>
              <div className="input-group">
                <label>Announcement (shown on home page)</label>
                <input type="text" value={settings.announcement} onChange={e => setSettings({...settings, announcement: e.target.value})} placeholder="Leave empty to hide" />
              </div>
            </div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>Support & Reseller</h3>
              <div className="input-group">
                <label>Telegram Support Link</label>
                <input type="text" value={settings.telegram_support} onChange={e => setSettings({...settings, telegram_support: e.target.value})} placeholder="https://t.me/yourusername" />
              </div>
              <div className="input-group">
                <label>WhatsApp Support (number or link)</label>
                <input type="text" value={settings.whatsapp_support || ''} onChange={e => setSettings({...settings, whatsapp_support: e.target.value})} placeholder="https://wa.me/911234567890 or +911234567890" />
              </div>
              <div className="input-group">
                <label>Telegram Reseller Signup Link</label>
                <input type="text" value={settings.telegram_reseller_link} onChange={e => setSettings({...settings, telegram_reseller_link: e.target.value})} placeholder="https://t.me/yourusername" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'branding' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Store Branding</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Upload custom logo, favicon, and homepage banner. Default logo is used as fallback.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Store Logo</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <img src={settings.branding_logo ? `/uploads/${settings.branding_logo}` : '/store-logo.jpeg'} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input ref={logoRef} type="file" accept="image/*" style={{ marginBottom: '8px', fontSize: '13px' }} />
                  <button className="btn btn-sm btn-primary" disabled={brandingUploading} onClick={() => uploadBranding('logo', logoRef)}>
                    {brandingUploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Favicon</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {settings.branding_favicon && <img src={`/uploads/${settings.branding_favicon}`} alt="Favicon" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border)' }} />}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input ref={faviconRef} type="file" accept="image/*" style={{ marginBottom: '8px', fontSize: '13px' }} />
                  <button className="btn btn-sm btn-primary" disabled={brandingUploading} onClick={() => uploadBranding('favicon', faviconRef)}>
                    {brandingUploading ? 'Uploading...' : 'Upload Favicon'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Homepage Banner</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {settings.branding_banner && <img src={`/uploads/${settings.branding_banner}`} alt="Banner" style={{ width: '120px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input ref={bannerImgRef} type="file" accept="image/*" style={{ marginBottom: '8px', fontSize: '13px' }} />
                  <button className="btn btn-sm btn-primary" disabled={brandingUploading} onClick={() => uploadBranding('banner', bannerImgRef)}>
                    {brandingUploading ? 'Uploading...' : 'Upload Banner'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Website Color Theme</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Choose a color theme for your entire website. All customers will see this color.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Preset Colors
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetColors.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setThemeColor(c.hex)}
                    title={c.name}
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: c.hex, border: themeColor === c.hex ? '3px solid white' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: themeColor === c.hex ? `0 0 20px ${c.hex}60` : 'none',
                      transform: themeColor === c.hex ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Custom Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={themeColor}
                  onChange={e => setThemeColor(e.target.value)}
                  style={{ width: '60px', height: '44px', padding: '2px', cursor: 'pointer', borderRadius: '10px' }}
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setThemeColor(e.target.value); }}
                  style={{ flex: 1 }}
                  placeholder="#a855f7"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Preview</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 16px', borderRadius: '8px', background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, color: 'white', fontWeight: '600', fontSize: '13px' }}>
                  Primary Button
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '8px', border: `2px solid ${themeColor}`, color: themeColor, fontWeight: '600', fontSize: '13px' }}>
                  Outline Button
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '8px', background: `${themeColor}18`, color: themeColor, fontWeight: '600', fontSize: '13px' }}>
                  Badge
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Particle Effects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Add cool animated particle effects to the website background. Visible to all customers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {particleOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setParticleEffect(opt.value)}
                  style={{
                    padding: '16px 12px', borderRadius: '12px', border: '2px solid',
                    borderColor: particleEffect === opt.value ? themeColor : 'var(--border)',
                    background: particleEffect === opt.value ? `${themeColor}15` : 'var(--bg-input)',
                    cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center',
                    boxShadow: particleEffect === opt.value ? `0 0 20px ${themeColor}30` : 'none'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{opt.icon}</div>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: particleEffect === opt.value ? themeColor : 'var(--text-secondary)'
                  }}>{opt.label}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p style={{ fontSize: '12px', color: '#f59e0b' }}>
                Effects are subtle and won't interfere with usability. They auto-disable for users who prefer reduced motion.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'banner' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Promotional Banner</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Show a special banner to all customers for news, discounts, or events.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Enable Banner</span>
              <button
                onClick={() => setBanner({ ...banner, enabled: !banner.enabled })}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px',
                  background: banner.enabled ? themeColor : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.3s', marginLeft: 'auto'
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '10px',
                  background: 'white', position: 'absolute', top: '3px',
                  left: banner.enabled ? '25px' : '3px', transition: 'left 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>

            {banner.enabled && (
              <>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Banner Type
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {bannerTypes.map(bt => (
                    <button
                      key={bt.value}
                      onClick={() => setBanner({ ...banner, type: bt.value })}
                      style={{
                        padding: '8px 14px', borderRadius: '8px', border: '1px solid',
                        borderColor: banner.type === bt.value ? themeColor : 'var(--border)',
                        background: banner.type === bt.value ? `${themeColor}15` : 'transparent',
                        color: banner.type === bt.value ? themeColor : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s'
                      }}
                    >
                      {bt.icon} {bt.label}
                    </button>
                  ))}
                </div>

                <div className="input-group">
                  <label>Banner Title (optional)</label>
                  <input type="text" value={banner.title} onChange={e => setBanner({ ...banner, title: e.target.value })} placeholder="e.g. Special Offer!" />
                </div>

                <div className="input-group">
                  <label>Banner Text</label>
                  <input type="text" value={banner.text} onChange={e => setBanner({ ...banner, text: e.target.value })} placeholder="e.g. Get 50% off on all panels this weekend!" />
                </div>

                {banner.type === 'custom' && (
                  <div className="input-group">
                    <label>Custom Color (optional)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="color" value={banner.color || '#a855f7'} onChange={e => setBanner({ ...banner, color: e.target.value })} style={{ width: '60px', height: '44px', padding: '2px', cursor: 'pointer', borderRadius: '10px' }} />
                      <input type="text" value={banner.color || ''} onChange={e => setBanner({ ...banner, color: e.target.value })} placeholder="#a855f7" style={{ flex: 1 }} />
                    </div>
                  </div>
                )}

                {banner.text && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Preview</p>
                    <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>
                        {bannerTypes.find(b => b.value === banner.type)?.icon}
                      </span>
                      <div>
                        {banner.title && <strong style={{ fontSize: '13px', color: themeColor, display: 'block' }}>{banner.title}</strong>}
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{banner.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </AdminLayout>
  );
}
