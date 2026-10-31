import './Contact.css';
import { useState } from 'react';
import { api } from '../api';
import { useDocTitle } from '../hooks';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';

export default function Contact() {
  useDocTitle('Contact');
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.sendContact(f); toast(r.message); setF({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };
  return (
    <div className="container page">
      <h1 className="page-title">Contact us</h1>
      <div className="contact-grid">
        <div className="contact-info">
          <div><Icon name="mail" /> support@roomsforrentals.com</div>
          <div><Icon name="phone" /> +971 4 555 0100</div>
          <div><Icon name="pin" /> Business Bay, Dubai, UAE</div>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="row2"><label>Name<input required value={f.name} onChange={up('name')} /></label><label>Email<input required type="email" value={f.email} onChange={up('email')} /></label></div>
          <label>Subject<input value={f.subject} onChange={up('subject')} /></label>
          <label>Message<textarea required rows="5" value={f.message} onChange={up('message')} /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        </form>
      </div>
    </div>
  );
}
