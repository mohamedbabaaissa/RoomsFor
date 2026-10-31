import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner } from '../../components/ui';
import { AMENITIES, fileToDataUrl } from '../../utils';
import { useCities } from '../../hooks';
import { CURRENCIES } from '../../context/CurrencyContext';

const EMPTY = { title: '', category: 'home', mode: 'rent', city: '', currency: 'USD', address: '', price: '', priceUnit: 'month', beds: 1, baths: 1, sqft: 500, guests: 2, stars: 3, amenities: [], description: '', images: [] };

export default function ListingEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  useDocTitle(id ? 'Edit listing' : 'New listing');
  const [f, setF] = useState(EMPTY);
  const cities = useCities();
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    api.bizListings().then((all) => { const l = all.find((x) => x.id === id); l ? setF({ ...EMPTY, ...l }) : nav('/business/listings'); }).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) return <Spinner />;
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sale = f.mode === 'sale', hotel = f.category === 'hotel';
  const toggleAm = (a) => setF({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] });
  const addFiles = async (e) => {
    const files = [...e.target.files].slice(0, 6);
    try { const urls = await Promise.all(files.map((x) => fileToDataUrl(x))); setF((s) => ({ ...s, images: [...s.images, ...urls].slice(0, 8) })); }
    catch { toast('Could not read that image', 'err'); }
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      id ? await api.bizUpdateListing(id, f) : await api.bizCreateListing(f);
      toast(id ? 'Listing updated' : 'Listing published'); nav('/business/listings');
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title={id ? 'Edit listing' : 'New listing'} subtitle="Homes and hotels, for rent or for sale." />
      <form className="form-card wide" onSubmit={submit}>
        {err && <div className="alert err" role="alert">{err}</div>}
        <label>Title<input required value={f.title} onChange={up('title')} placeholder="e.g. Sunny 2BR apartment near the beach" /></label>
        <div className="row3">
          <label>What is it?<select value={f.category} onChange={up('category')}><option value="home">Home / apartment</option><option value="hotel">Hotel</option></select></label>
          <label>Offer<select value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value, priceUnit: e.target.value === 'sale' ? 'once' : f.category === 'hotel' ? 'night' : 'month' })}><option value="rent">{hotel ? 'Rooms per night' : 'For rent'}</option><option value="sale">For sale</option></select></label>
          <label>City<select required value={f.city} onChange={up('city')}><option value="">Choose…</option>{cities.map((c) => <option key={c.id}>{c.name}</option>)}</select></label>
        </div>
        <label>Area / address<input value={f.address} onChange={up('address')} placeholder="Downtown, Dubai, UAE" /></label>
        <div className="row3">
          <label>Price<input required type="number" min="1" value={f.price} onChange={up('price')} /></label>
          <label>Currency<select value={f.currency} onChange={up('currency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          {!sale && <label>Per<select value={f.priceUnit} onChange={up('priceUnit')}><option value="night">Night</option><option value="month">Month</option></select></label>}
        </div>
        <small className="muted">Visitors see this price converted to their own currency (USD, EUR or DZD) using the rates set by the website admin.</small>
        <div className="row3">
          <label>Max guests<input type="number" min="1" value={f.guests} onChange={up('guests')} /></label>
          {!hotel && <><label>Bedrooms<input type="number" min="0" value={f.beds} onChange={up('beds')} /></label><label>Bathrooms<input type="number" min="0" value={f.baths} onChange={up('baths')} /></label></>}
          {hotel && <label>Stars<select value={f.stars} onChange={up('stars')}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></label>}
          <label>Size (sqft)<input type="number" min="0" value={f.sqft} onChange={up('sqft')} /></label>
        </div>
        <label>Description<textarea rows="4" value={f.description} onChange={up('description')} /></label>
        <fieldset><legend>Amenities</legend><div className="chips">{AMENITIES.map((a) => <label key={a} className={`chip ${f.amenities.includes(a) ? 'on' : ''}`}><input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggleAm(a)} />{a}</label>)}</div></fieldset>
        <fieldset><legend>Photos (up to 8)</legend>
          <div className="photo-row">
            {f.images.map((src, i) => <div className="photo" key={i}><img src={src} alt="" /><button type="button" aria-label="Remove photo" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })}>×</button></div>)}
            {f.images.length < 8 && <label className="photo add">+ Add<input type="file" accept="image/*" multiple hidden onChange={addFiles} /></label>}
          </div>
          <small className="muted">If you add none, a default photo is used.</small>
        </fieldset>
        <div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Publish listing'}</button><button type="button" className="btn ghost" onClick={() => nav('/business/listings')}>Cancel</button></div>
      </form>
    </>
  );
}
