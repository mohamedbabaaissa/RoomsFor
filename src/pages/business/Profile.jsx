import './Profile.css';
import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocTitle, useCities } from '../../hooks';
import { PageHeader } from '../../components/ui';
import { fileToDataUrl, initials } from '../../utils';

export default function Profile() {
  useDocTitle('Business profile');
  const { user, setUser } = useAuth();
  const toast = useToast();
  const cities = useCities();
  const [f, setF] = useState({ name: user.name, businessName: user.businessName || '', phone: user.phone || '', city: user.city || '', bio: user.bio || '', avatar: user.avatar || '' });
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    try { setF({ ...f, avatar: await fileToDataUrl(file, 480, 0.8) }); } catch { toast('Could not read that image', 'err'); }
  };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { setUser(await api.updateProfile(f)); toast('Profile saved. It is now shown on the website.'); } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Business profile" subtitle="This is the card visitors see on the home page. Clicking it shows all your properties." />
      <div className="profile-grid">
        <form className="form-card" onSubmit={submit}>
          <div className="avatar-edit">
            <div className="avatar-preview">{f.avatar ? <img src={f.avatar} alt="" /> : <span>{initials(f.businessName || f.name)}</span>}</div>
            <div className="avatar-actions">
              <label className="btn sm outline">Upload photo<input type="file" accept="image/*" hidden onChange={pick} /></label>
              {f.avatar && <button type="button" className="btn sm ghost" onClick={() => setF({ ...f, avatar: '' })}>Remove</button>}
              <small className="muted">Your face or your logo. Square works best.</small>
            </div>
          </div>
          <div className="row2">
            <label>Your name<input required value={f.name} onChange={up('name')} /></label>
            <label>Business name<input required value={f.businessName} onChange={up('businessName')} /></label>
          </div>
          <div className="row2">
            <label>Phone<input value={f.phone} onChange={up('phone')} /></label>
            <label>City<select value={f.city} onChange={up('city')}><option value="">—</option>{cities.map((c) => <option key={c.id}>{c.name}</option>)}</select></label>
          </div>
          <label>About you / your business<textarea rows="4" maxLength="600" value={f.bio} onChange={up('bio')} placeholder="Tell visitors who you are and what you offer." /></label>
          <label>Email (login)<input value={user.email} disabled /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>

        <div>
          <p className="muted preview-label">Preview (how visitors see you)</p>
          <div className="agent-card preview">
            <div className="agent-photo">{f.avatar ? <img src={f.avatar} alt="" /> : <span className="agent-initials">{initials(f.businessName || f.name)}</span>}</div>
            <div className="agent-body">
              <span className="agent-name">{f.name}</span>
              <span className="agent-role">{f.businessName}{f.city ? ` · ${f.city}` : ''}</span>
              {f.bio && <p className="agent-bio">{f.bio}</p>}
              <span className="agent-link">Your listings →</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
