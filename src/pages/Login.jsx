import './Auth.css';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { useDocTitle } from '../hooks';
import { USE_MOCK } from '../api/config';

const DEMOS = [
  ['Admin', 'admin@rfr.com', 'admin123'],
  ['Business', 'hotels@palmcollection.com', 'business123'],
  ['Business (pending)', 'info@desertnest.com', 'business123'],
  ['User', 'user@rfr.com', 'user123'],
];

export default function Login({ admin = false }) {
  useDocTitle(admin ? 'Admin login' : 'Log in');
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const from = loc.state?.from;
  const destFor = (u) => (from && (from.startsWith(homeFor(u.role)) || (u.role === 'user' && from.startsWith('/properties'))) ? from : homeFor(u.role));
  if (user) return <Navigate to={destFor(user)} replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const u = await login(f.email, f.password);
      nav(destFor(u), { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="form-card auth" onSubmit={submit}>
        <h1>{admin ? 'Website admin' : 'Welcome back'}</h1>
        <p className="muted">{admin ? 'Sign in to manage the platform.' : 'Log in as a user or as an approved business.'}</p>
        {err && <div className="alert err" role="alert">{err}</div>}
        <label>Email<input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <button className="btn primary full" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        {!admin && <p className="switch">New here? <Link to="/register">Create a user account</Link> · <Link to="/business/register">Register a business</Link></p>}
        {USE_MOCK && (
          <div className="demo-box">
            <small>Demo accounts (dummy data) — click to fill:</small>
            <div>{DEMOS.filter(([n]) => !admin || n === 'Admin').map(([n, e, p]) => <button type="button" key={n} onClick={() => setF({ email: e, password: p })}>{n}</button>)}</div>
          </div>
        )}
      </form>
    </div>
  );
}
