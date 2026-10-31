import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, ConfirmButton, Empty } from '../../components/ui';
import { useCurrency } from '../../context/CurrencyContext';

export default function Listings() {
  useDocTitle('My listings');
  const toast = useToast();
  const { price } = useCurrency();
  const { data, loading, error, reload } = useAsync(api.bizListings);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const run = async (fn, msg) => { try { await fn(); toast(msg); reload(); } catch (e) { toast(e.message, 'err'); } };
  const toggle = (l) => run(() => api.bizUpdateListing(l.id, { ...l, status: l.status === 'published' ? 'hidden' : 'published' }), l.status === 'published' ? 'Listing hidden' : 'Listing published');
  return (
    <>
      <PageHeader title="My listings" subtitle="Homes and hotels you rent or sell."><Link to="/business/listings/new" className="btn primary">+ New listing</Link></PageHeader>
      {data.length === 0 ? <Empty title="No listings yet" action={<Link className="btn primary" to="/business/listings/new">Create your first listing</Link>}>Add a home or a hotel to start receiving requests.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th></th><th>Title</th><th>Type</th><th>Price</th><th>Status</th><th></th></tr></thead>
          <tbody>{data.map((l) => (
            <tr key={l.id}>
              <td><img className="thumb" src={l.images[0]} alt="" /></td>
              <td><b>{l.title}</b><div className="muted">{l.address}</div></td>
              <td>{l.category} · {l.mode === 'sale' ? 'for sale' : 'for rent'}</td><td>{price(l)}</td><td><StatusBadge status={l.status} /></td>
              <td className="actions">
                <Link className="btn sm outline" to={`/business/listings/${l.id}/edit`}>Edit</Link>
                {l.status !== 'blocked' && <button className="btn sm ghost" onClick={() => toggle(l)}>{l.status === 'published' ? 'Hide' : 'Publish'}</button>}
                <ConfirmButton onConfirm={() => run(() => api.bizDeleteListing(l.id), 'Listing deleted')}>Delete</ConfirmButton>
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
