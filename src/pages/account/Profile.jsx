import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocTitle } from '../../hooks';
import { PageHeader } from '../../components/ui';

export default function Profile() {
  useDocTitle('Profile');
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { setUser(await api.updateProfile(f)); toast('Profile saved'); } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Profile" subtitle="Your contact details." />
      <form className="form-card" onSubmit={submit}>
        <label>Full name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Email<input value={user.email} disabled /></label>
        <label>Phone<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
    </>
  );
}
