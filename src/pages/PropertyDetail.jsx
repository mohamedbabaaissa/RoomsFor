import './PropertyDetail.css';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync, useDocTitle } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import { Spinner, ErrorBox, Stars } from '../components/ui';
import { todayISO, dayDiff } from '../utils';
import { useCurrency } from '../context/CurrencyContext';

function BookingBox({ l }) {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const { fmt, price } = useCurrency();
  const [f, setF] = useState({ checkIn: '', checkOut: '', guests: 1, message: '' });
  const [busy, setBusy] = useState(false);
  const sale = l.mode === 'sale';
  const nights = f.checkIn && f.checkOut ? dayDiff(f.checkIn, f.checkOut) : 0;
  const total = nights > 0 ? (l.priceUnit === 'night' ? nights * l.price : Math.max(1, Math.ceil(nights / 30)) * l.price) : 0;
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: loc.pathname } });
    setBusy(true);
    try {
      await api.createBooking({ listingId: l.id, ...f });
      toast(sale ? 'Request sent to the seller.' : 'Booking request sent!');
      nav('/account');
    } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };

  if (user && user.role !== 'user') return <aside className="book-box"><p className="muted">You are logged in as <b>{user.role}</b>. Use a normal user account to book or contact sellers.</p></aside>;

  return (
    <form className="book-box" onSubmit={submit}>
      <div className="card-price big">{price(l)}</div>
      {sale ? (
        <>
          <p className="muted">Interested? Send a message and the seller will contact you to arrange a visit.</p>
          <label>Your message<textarea rows="4" value={f.message} onChange={up('message')} placeholder="I would like to visit this property…" /></label>
        </>
      ) : (
        <>
          <div className="row2">
            <label>Check-in<input type="date" min={todayISO()} value={f.checkIn} onChange={up('checkIn')} required /></label>
            <label>Check-out<input type="date" min={f.checkIn || todayISO()} value={f.checkOut} onChange={up('checkOut')} required /></label>
          </div>
          <label>Guests<input type="number" min="1" max={l.guests} value={f.guests} onChange={up('guests')} /></label>
          <label>Note (optional)<textarea rows="2" value={f.message} onChange={up('message')} /></label>
          {nights > 0 && <div className="total-line"><span>{l.priceUnit === 'night' ? `${fmt(l.price, l.currency)} × ${nights} night${nights > 1 ? 's' : ''}` : `${Math.max(1, Math.ceil(nights / 30))} month(s)`}</span><b>{fmt(total, l.currency)}</b></div>}
        </>
      )}
      <button className="btn primary full" disabled={busy}>{busy ? 'Sending…' : !user ? 'Log in to continue' : sale ? 'Contact seller' : 'Request booking'}</button>
      {!sale && <small className="muted">You will not be charged now. The business confirms your request.</small>}
    </form>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { data: l, loading, error, reload } = useAsync(() => api.listing(id), [id]);
  const [idx, setIdx] = useState(0);
  useDocTitle(l?.title);
  if (loading) return <Spinner />;
  if (error) return <div className="container page"><ErrorBox error={error} onRetry={reload} /><p className="center"><Link to="/properties">← Back to properties</Link></p></div>;

  return (
    <div className="container page">
      <Link to="/properties" className="back">← All properties</Link>
      <div className="detail-grid">
        <div>
          <div className="gallery">
            <img className="main" src={l.images[idx]} alt={l.title} />
            {l.images.length > 1 && <div className="thumbs">{l.images.map((src, i) => <button key={i} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)}><img src={src} alt={`Photo ${i + 1}`} /></button>)}</div>}
          </div>
          <div className="detail-head">
            <div>
              <div className="badges inline">
                {l.featured && <span className="badge featured">Featured</span>}
                <span className={`badge ${l.mode === 'sale' ? 'for-sale' : 'for-rent'}`}>{l.category === 'hotel' ? 'Hotel' : l.mode === 'sale' ? 'For sale' : 'For rent'}</span>
              </div>
              <h1>{l.title}</h1>
              <div className="card-location"><Icon name="pin" size={14} /> {l.address}</div>
            </div>
            <div className="rating big"><Icon name="star" size={16} fill /> {l.rating.toFixed(1)} {l.stars && <Stars n={l.stars} />}</div>
          </div>
          <div className="facts">
            {l.category === 'home' && <><div><Icon name="bed" /><b>{l.beds}</b> Bedrooms</div><div><Icon name="bath" /><b>{l.baths}</b> Bathrooms</div></>}
            <div><Icon name="area" /><b>{l.sqft}</b> sqft</div>
            <div><Icon name="users" /><b>{l.guests}</b> Guests</div>
          </div>
          <h3>About this place</h3>
          <p className="desc">{l.description}</p>
          <h3>Amenities</h3>
          <ul className="amenities">{l.amenities.map((a) => <li key={a}><Icon name="check" size={16} /> {a}</li>)}</ul>
          {l.business && (
            <div className="seller">
              <div className="avatar lg">{l.business.avatar ? <img src={l.business.avatar} alt="" className="avatar-img" /> : l.business.businessName?.[0]}</div>
              <div><b>{l.business.businessName}</b><div className="muted">Approved business · {l.business.phone}</div></div>
              <Link className="btn outline" to={`/properties?businessId=${l.business.id}`}>All their listings</Link>
            </div>
          )}
        </div>
        <BookingBox l={l} />
      </div>
    </div>
  );
}
