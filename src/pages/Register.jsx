import './Auth.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocTitle } from '../hooks';

export default function Register() {
  useDocTitle('Create account');
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register(f); nav('/account', { replace: true }); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap">
      <form className="form-card auth" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">Book homes and hotels, save favorites and contact sellers.</p>
        {err && <div className="alert err" role="alert">{err}</div>}
        <label>Full name<input required value={f.name} onChange={up('name')} /></label>
        <label>Email<input type="email" required value={f.email} onChange={up('email')} /></label>
        <label>Phone (optional)<input value={f.phone} onChange={up('phone')} /></label>
        <label>Password<input type="password" required minLength="6" value={f.password} onChange={up('password')} /></label>
        <button className="btn primary full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
        <p className="switch">Want to list properties? <Link to="/business/register">Register a business</Link></p>
      </form>
    </div>
  );
}
