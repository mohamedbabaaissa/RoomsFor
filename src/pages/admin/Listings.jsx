import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, ConfirmButton, Empty } from '../../components/ui';
import { useCurrency } from '../../context/CurrencyContext';

export default function Listings() {
  useDocTitle('Listings');
  const toast = useToast();
  const { price } = useCurrency();
  const { data, loading, error, reload } = useAsync(api.adminListings);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const run = async (fn, msg) => { try { await fn(); toast(msg); reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <>
      <PageHeader title="Listings" subtitle="Feature, hide or remove listings from any business." />
      {data.length === 0 ? <Empty title="No listings" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th></th><th>Title</th><th>Business</th><th>Type</th><th>Price</th><th>Status</th><th></th></tr></thead>
          <tbody>{data.map((l) => (
            <tr key={l.id}>
              <td><img className="thumb" src={l.images[0]} alt="" /></td>
              <td><Link to={`/properties/${l.id}`}><b>{l.title}</b></Link><div className="muted">{l.city}{l.featured ? ' · ★ featured' : ''}</div></td>
              <td>{l.business?.businessName}</td>
              <td>{l.category} · {l.mode}</td><td>{price(l)}</td><td><StatusBadge status={l.status} /></td>
              <td className="actions">
                <FeatureBtn l={l} run={run} />
                {l.status === 'published' ? <button className="btn sm outline" onClick={() => run(() => api.adminSetListingStatus(l.id, 'blocked'), 'Listing blocked')}>Block</button>
                  : <button className="btn sm primary" onClick={() => run(() => api.adminSetListingStatus(l.id, 'published'), 'Listing published')}>Publish</button>}
                <ConfirmButton onConfirm={() => run(() => api.adminDeleteListing(l.id), 'Listing deleted')}>Delete</ConfirmButton>
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}

function FeatureBtn({ l, run }) {
  // featured flag is sent together with the (unchanged) status
  return <button className="btn sm ghost" onClick={() => run(() => api.adminSetListingStatus(l.id, l.status, !l.featured), l.featured ? 'Removed from featured' : 'Marked as featured')}>{l.featured ? 'Unfeature' : 'Feature'}</button>;
}
