import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, clearToken, apiFetch } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiFetch('/auth/me')
        .then(u => { setUserState(u); setUser(u); })
        .catch(() => { clearToken(); setUserState(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  };

  const register = async (username, email, password, telegram_username) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, telegram_username })
    });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
