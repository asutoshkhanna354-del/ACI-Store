import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', telegram_username: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useCurrency();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.telegram_username);
      toast.success('Account created!');
      navigate('/store');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '440px', padding: '60px 20px' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>{t('registerTitle')}</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>{t('signUp')}</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('username')}</label>
            <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder={t('username')} required />
          </div>
          <div className="input-group">
            <label>{t('email')}</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder={t('email')} required />
          </div>
          <div className="input-group">
            <label>{t('password')}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={t('password')} required minLength={6} />
          </div>
          <div className="input-group">
            <label>{t('telegram')}</label>
            <input type="text" value={form.telegram_username} onChange={e => setForm({...form, telegram_username: e.target.value})} placeholder="@username" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? '...' : t('register')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {t('alreadyHaveAccount')} <Link to="/login" className="text-accent" style={{ fontWeight: '600' }}>{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
