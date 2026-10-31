import './Auth.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useDocTitle } from '../hooks';
import { useCities } from '../hooks';

export default function BusinessRegister() {
  useDocTitle('Register your business');
  const [f, setF] = useState({ businessName: '', businessType: 'agency', name: '', email: '', phone: '', city: '', password: '' });
  const cities = useCities();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await api.registerBusiness(f); setDone(true); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  if (done) return (
    <div className="auth-wrap"><div className="form-card auth center">
      <h1>Request received</h1>
      <p>Thanks, <b>{f.businessName}</b>! The website admin will review your business. You can log in as soon as it is approved.</p>
      <Link className="btn primary" to="/">Back to home</Link>
    </div></div>
  );

  return (
    <div className="auth-wrap">
      <form className="form-card auth wide" onSubmit={submit}>
        <h1>List your homes or hotels</h1>
        <p className="muted">Create a business account. Our team confirms it before you can log in and publish.</p>
        {err && <div className="alert err" role="alert">{err}</div>}
        <div className="row2">
          <label>Business name<input required value={f.businessName} onChange={up('businessName')} /></label>
          <label>Business type<select value={f.businessType} onChange={up('businessType')}><option value="agency">Real estate agency / owner</option><option value="hotel">Hotel</option></select></label>
        </div>
        <div className="row2">
          <label>Contact person<input required value={f.name} onChange={up('name')} /></label>
          <label>Phone<input required value={f.phone} onChange={up('phone')} /></label>
        </div>
        <div className="row2">
          <label>Email<input type="email" required value={f.email} onChange={up('email')} /></label>
          <label>City<select required value={f.city} onChange={up('city')}><option value="">Choose…</option>{cities.map((c) => <option key={c.id}>{c.name}</option>)}</select></label>
        </div>
        <label>Password<input type="password" required minLength="6" value={f.password} onChange={up('password')} /></label>
        <button className="btn primary full" disabled={busy}>{busy ? 'Sending…' : 'Send for approval'}</button>
        <p className="switch">Already approved? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
