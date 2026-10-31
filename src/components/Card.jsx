import './Card.css';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { Stars } from './ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import { timeAgo, initials } from '../utils';
import { useCurrency } from '../context/CurrencyContext';

export default function Card({ l, faved, onToggleFav }) {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { price } = useCurrency();

  const toggle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return nav('/login', { state: { from: `/properties/${l.id}` } });
    if (user.role !== 'user') return toast('Only user accounts can save favorites.', 'err');
    try {
      faved ? await api.removeFavorite(l.id) : await api.addFavorite(l.id);
      onToggleFav?.(l.id, !faved);
      toast(faved ? 'Removed from favorites' : 'Saved to favorites');
    } catch (err) { toast(err.message, 'err'); }
  };

  return (
    <Link to={`/properties/${l.id}`} className="card">
      <div className="card-img">
        <img src={l.images[0]} alt={l.title} loading="lazy" />
        <div className="badges">
          {l.featured && <span className="badge featured">Featured</span>}
          <span className={`badge ${l.mode === 'sale' ? 'for-sale' : 'for-rent'}`}>{l.category === 'hotel' ? 'Hotel' : l.mode === 'sale' ? 'For sale' : 'For rent'}</span>
        </div>
        <button className={`bookmark ${faved ? 'on' : ''}`} onClick={toggle} aria-label={faved ? 'Remove from favorites' : 'Save to favorites'}>
          <Icon name="heart" size={16} fill={faved} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-title">{l.title}</div>
        <div className="card-location"><Icon name="pin" size={13} /> {l.address}</div>
        <div className="card-price">{price(l)}</div>
        <div className="card-features">
          {l.category === 'hotel' ? (
            <><span>{l.stars ? <Stars n={l.stars} /> : 'Hotel'}</span><span><Icon name="users" size={14} /> {l.guests} guests</span><span><Icon name="area" size={14} /> {l.sqft} sqft</span></>
          ) : (
            <><span><Icon name="bed" size={14} /> {l.beds} beds</span><span><Icon name="bath" size={14} /> {l.baths} baths</span><span><Icon name="area" size={14} /> {l.sqft} sqft</span></>
          )}
        </div>
        <div className="card-footer">
          <span className="rating"><Icon name="star" size={13} fill /> {l.rating.toFixed(1)}</span>
          <div className="footer-right">
            <div className="avatar">{l.business?.avatar ? <img src={l.business.avatar} alt="" className="avatar-img" /> : initials(l.business?.businessName)}</div>
            <span className="time">{timeAgo(l.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
