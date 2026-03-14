import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export default function ResellerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { storeSettings } = useTheme();
  const navigate = useNavigate();

  const ss = storeSettings || {};
  const hasTelegram = !!(ss.telegram_reseller_link || ss.telegram_support);
  const hasWhatsapp = !!ss.whatsapp_support;
  const telegramLink = ss.telegram_reseller_link || ss.telegram_support || '';
  const getWhatsappUrl = () => {
    if (!ss.whatsapp_support) return '#';
    return ss.whatsapp_support.startsWith('http') ? ss.whatsapp_support : `https://wa.me/${ss.whatsapp_support.replace(/[^0-9]/g, '')}`;
  };

  useEffect(() => {
    const existing = localStorage.getItem('ff_reseller_token');
    if (existing) navigate('/reseller');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/reseller/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('ff_reseller_token', data.token);
      localStorage.setItem('ff_reseller', JSON.stringify(data.reseller));
      toast.success('Welcome back!');
      navigate('/reseller');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🤝</div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Reseller Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in with your reseller credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter reseller username" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border)', textAlign: 'center', position: 'relative' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
            Interested in becoming a reseller?
          </p>
          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex' }}
            onClick={() => setContactOpen(!contactOpen)}
          >
            Contact Admin
          </button>
          {contactOpen && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {hasTelegram && (
                <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: 'rgba(0,136,204,0.15)', color: '#0088cc', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setContactOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              )}
              {hasWhatsapp && (
                <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setContactOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {!hasTelegram && !hasWhatsapp && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No contact links set yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
