import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { PageHeader, Spinner, ErrorBox, StatusBadge, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

export default function Bookings() {
  useDocTitle('Bookings');
  const { fmt } = useCurrency();
  const { data, loading, error, reload } = useAsync(api.adminBookings);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Bookings & requests" subtitle="Everything users sent to businesses (read-only)." />
      {data.length === 0 ? <Empty title="No bookings yet" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Listing</th><th>User</th><th>Business</th><th>Type</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{data.map((b) => (
            <tr key={b.id}><td><b>{b.listing?.title || '(deleted)'}</b></td><td>{b.user?.name}<div className="muted">{b.user?.email}</div></td><td>{b.business?.businessName}</td>
              <td>{b.kind === 'inquiry' ? 'Inquiry' : 'Booking'}</td><td>{b.checkIn ? `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}` : '—'}</td><td>{b.total ? fmt(b.total, b.currency) : '—'}</td><td><StatusBadge status={b.status} /></td></tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
