import { useState } from 'react';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, Tabs, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

export default function Bookings() {
  useDocTitle('Requests');
  const { fmt } = useCurrency();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const { data, loading, error, reload } = useAsync(api.bizBookings);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const rows = tab === 'all' ? data : data.filter((b) => b.status === tab);
  const count = (s) => data.filter((b) => b.status === s).length;
  const set = async (b, status) => { try { await api.bizSetBookingStatus(b.id, status); toast(status === 'confirmed' ? 'Confirmed' : 'Declined'); reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <>
      <PageHeader title="Requests & bookings" subtitle="Confirm or decline what users send you." />
      <Tabs value={tab} onChange={setTab} items={[['pending', 'Pending', count('pending')], ['confirmed', 'Confirmed', count('confirmed')], ['declined', 'Declined', count('declined')], ['cancelled', 'Cancelled', count('cancelled')], ['all', 'All', data.length]]} />
      {rows.length === 0 ? <Empty title="Nothing here" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Listing</th><th>Guest</th><th>Type</th><th>Dates</th><th>Total</th><th>Note</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((b) => (
            <tr key={b.id}>
              <td><b>{b.listing?.title}</b></td>
              <td>{b.user?.name}<div className="muted">{b.user?.email}{b.user?.phone ? <><br />{b.user.phone}</> : null}</div></td>
              <td>{b.kind === 'inquiry' ? 'Inquiry' : `Booking · ${b.guests} guest(s)`}</td>
              <td>{b.checkIn ? `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}` : '—'}</td><td>{b.total ? fmt(b.total, b.currency) : '—'}</td>
              <td className="note">{b.message || '—'}</td><td><StatusBadge status={b.status} /></td>
              <td className="actions">{b.status === 'pending' && <><button className="btn sm primary" onClick={() => set(b, 'confirmed')}>Confirm</button><button className="btn sm danger" onClick={() => set(b, 'declined')}>Decline</button></>}</td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
