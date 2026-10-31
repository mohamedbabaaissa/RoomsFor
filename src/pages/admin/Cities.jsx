import './Cities.css';
import { useState } from 'react';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, ConfirmButton, Empty } from '../../components/ui';
import { fileToDataUrl } from '../../utils';

const BLANK = { id: null, name: '', image: '' };

export default function Cities() {
  useDocTitle('Cities');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(api.cities);
  const [f, setF] = useState(BLANK);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    try { setF({ ...f, image: await fileToDataUrl(file, 420, 0.8) }); } catch { toast('Could not read that image', 'err'); }
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      f.id ? await api.adminUpdateCity(f.id, f) : await api.adminCreateCity(f);
      toast(f.id ? 'Place updated' : 'Place added to the home page'); setF(BLANK); reload();
    } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };
  const del = async (c) => { try { await api.adminDeleteCity(c.id); toast('Place removed'); if (f.id === c.id) setF(BLANK); reload(); } catch (err) { toast(err.message, 'err'); } };

  return (
    <>
      <PageHeader title="Places (round cards)" subtitle="The round cards in “Explore our listing” on the home page. Only you can change them." />
      <div className="cities-admin">
        <form className="panel city-form" onSubmit={save}>
          <h2>{f.id ? 'Edit place' : 'Add a new place'}</h2>
          <div className="city-pic">{f.image ? <img src={f.image} alt="" /> : <span>{f.name ? f.name[0] : '+'}</span>}</div>
          <div className="city-pic-actions">
            <label className="btn sm outline">{f.image ? 'Change photo' : 'Add photo'}<input type="file" accept="image/*" hidden onChange={pick} /></label>
            {f.image && <button type="button" className="btn sm ghost" onClick={() => setF({ ...f, image: '' })}>Remove</button>}
          </div>
          <label>Place name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Algiers" /></label>
          <div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : f.id ? 'Save changes' : 'Add place'}</button>{f.id && <button type="button" className="btn ghost" onClick={() => setF(BLANK)}>Cancel</button>}</div>
          <small className="muted">Businesses can only pick from these places when they add a property.</small>
        </form>

        <section>
          {data.length === 0 ? <Empty title="No places yet">Add your first place on the left.</Empty> : (
            <div className="city-admin-grid">
              {data.map((c) => (
                <div key={c.id} className={`city-admin ${f.id === c.id ? 'on' : ''}`}>
                  <div className="city-pic sm">{c.image ? <img src={c.image} alt={c.name} /> : <span>{c.name[0]}</span>}</div>
                  <b>{c.name}</b><span className="muted">{c.count} listing{c.count === 1 ? '' : 's'}</span>
                  <div className="actions"><button className="btn sm outline" onClick={() => { setF({ id: c.id, name: c.name, image: c.image }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><ConfirmButton onConfirm={() => del(c)} message="Delete?">Delete</ConfirmButton></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
