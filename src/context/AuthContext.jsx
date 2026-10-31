import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { getToken, setToken } from '../api/http';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const homeFor = (role) => (role === 'admin' ? '/admin' : role === 'business' ? '/business' : '/account');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.token); setUser(res.user); return res.user;
  }, []);
  const register = useCallback(async (data) => {
    const res = await api.register(data);
    setToken(res.token); setUser(res.user); return res.user;
  }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
