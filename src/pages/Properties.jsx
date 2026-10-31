import './Properties.css';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync, useDocTitle, useCities } from '../hooks';
import ListingGrid from '../components/ListingGrid';
import { Spinner, ErrorBox, Empty } from '../components/ui';
import { useCurrency } from '../context/CurrencyContext';
import { initials } from '../utils';

export default function Properties() {
  useDocTitle('Properties');
  const [sp, setSp] = useSearchParams();
  const cities = useCities();
  const { currency, convert } = useCurrency();
  const { data: agents } = useAsync(api.agents);
  const get = (k) => sp.get(k) || '';
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const params = Object.fromEntries(['q', 'category', 'mode', 'city', 'beds', 'minPrice', 'maxPrice', 'sort', 'page', 'businessId'].map((k) => [k, get(k)]));
  params.limit = 9;
  // prices typed by the visitor are in their chosen currency; the API compares in USD
  ['minPrice', 'maxPrice'].forEach((k) => { if (params[k]) params[k] = convert(params[k], currency, 'USD').toFixed(2); });
  const agent = agents?.find((a) => a.id === get('businessId'));
  const LABELS = { q: (v) => `“${v}”`, category: (v) => (v === 'hotel' ? 'Hotels' : 'Homes'), mode: (v) => (v === 'sale' ? 'For sale' : 'For rent / stay'), city: (v) => v, beds: (v) => `${v}+ beds`, minPrice: (v) => `From ${v} ${currency}`, maxPrice: (v) => `Up to ${v} ${currency}`, businessId: () => `By ${agent?.businessName || 'this business'}` };
  const chips = Object.keys(LABELS).filter((k) => get(k));
  const { data, loading, error, reload } = useAsync(() => api.listings(params), [sp.toString()]);

  return (
    <div className="container page">
      <h1 className="page-title">Properties</h1>
      <div className="filters">
        <input placeholder="Search…" defaultValue={get('q')} key={get('q')} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} onBlur={(e) => e.target.value !== get('q') && set('q', e.target.value)} />
        <select value={get('category')} onChange={(e) => set('category', e.target.value)} aria-label="Type">
          <option value="">Homes & hotels</option><option value="home">Homes</option><option value="hotel">Hotels</option>
        </select>
        <select value={get('mode')} onChange={(e) => set('mode', e.target.value)} aria-label="Rent or sale">
          <option value="">Rent & sale</option><option value="rent">For rent / stay</option><option value="sale">For sale</option>
        </select>
        <select value={get('city')} onChange={(e) => set('city', e.target.value)} aria-label="City">
          <option value="">All cities</option>{cities.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={get('beds')} onChange={(e) => set('beds', e.target.value)} aria-label="Bedrooms">
          <option value="">Any beds</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
        </select>
        <input type="number" min="0" placeholder={`Min price (${currency})`} value={get('minPrice')} onChange={(e) => set('minPrice', e.target.value)} />
        <input type="number" min="0" placeholder={`Max price (${currency})`} value={get('maxPrice')} onChange={(e) => set('maxPrice', e.target.value)} />
        <select value={get('sort')} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
          <option value="">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option>
        </select>
      </div>

      {chips.length > 0 && (
        <div className="active-filters" aria-label="Active filters">
          {chips.map((k) => <button key={k} className="filter-chip" onClick={() => set(k, '')} aria-label={`Remove filter ${LABELS[k](get(k))}`}>{LABELS[k](get(k))} <span aria-hidden="true">×</span></button>)}
          <button className="filter-clear" onClick={() => setSp({})}>Remove all filters</button>
        </div>
      )}

      {agent && (
        <div className="biz-banner">
          <div className="biz-avatar">{agent.avatar ? <img src={agent.avatar} alt="" /> : initials(agent.businessName)}</div>
          <div className="biz-info"><b>{agent.businessName}</b><span>{agent.name}{agent.city ? ` · ${agent.city}` : ''}</span>{agent.bio && <p>{agent.bio}</p>}</div>
          <div className="biz-contact">{agent.phone && <a className="btn sm outline" href={`tel:${agent.phone}`}>Call</a>}{agent.email && <a className="btn sm outline" href={`mailto:${agent.email}`}>Email</a>}<button className="btn sm primary" onClick={() => set('businessId', '')}>Show all properties</button></div>
        </div>
      )}

      {loading ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? (
        <Empty title="No properties match your filters">Try removing a filter or searching another city.</Empty>
      ) : (
        <>
          <p className="result-count">{data.total} result{data.total === 1 ? '' : 's'}</p>
          <ListingGrid items={data.items} />
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn outline" disabled={data.page <= 1} onClick={() => set('page', data.page - 1)}>Previous</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn outline" disabled={data.page >= data.pages} onClick={() => set('page', data.page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
