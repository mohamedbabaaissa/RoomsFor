import './AgentCard.css';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { initials } from '../utils';

/** A business profile card. Clicking it opens Properties filtered to that business. */
export default function AgentCard({ a, featured = false }) {
  return (
    <Link to={`/properties?businessId=${a.id}`} className={`agent-card ${featured ? 'featured' : ''}`}>
      <div className="agent-photo">
        {a.avatar ? <img src={a.avatar} alt={a.name} loading="lazy" /> : <span className="agent-initials">{initials(a.businessName || a.name)}</span>}
      </div>
      <div className="agent-body">
        <span className="agent-name">{a.name}</span>
        <span className="agent-role">{a.businessName}{a.city ? ` · ${a.city}` : ''}</span>
        {a.bio && <p className="agent-bio">{a.bio}</p>}
        <span className="agent-link">{a.listings} listing{a.listings === 1 ? '' : 's'} <Icon name="arrowR" size={14} /></span>
      </div>
    </Link>
  );
}
