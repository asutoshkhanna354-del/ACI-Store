import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useCurrency();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      toast.success('Welcome back!');
      navigate(user.is_admin ? '/admin' : '/store');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '440px', padding: '60px 20px' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>{t('loginTitle')}</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>{t('signIn')}</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('username')}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('username')} required />
          </div>
          <div className="input-group">
            <label>{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password')} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? '...' : t('login')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {t('dontHaveAccount')} <Link to="/register" className="text-accent" style={{ fontWeight: '600' }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}
