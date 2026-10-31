import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, ConfirmButton, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

export default function MyBookings() {
  useDocTitle('My bookings');
  const { fmt } = useCurrency();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(api.myBookings);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const cancel = async (id) => { try { await api.cancelBooking(id); toast('Cancelled'); reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <>
      <PageHeader title="My bookings" subtitle="Your stays, rentals and inquiries." />
      {data.length === 0 ? <Empty title="No bookings yet" action={<Link className="btn primary" to="/properties">Browse properties</Link>}>Find a home or a hotel and send your first request.</Empty> : (
        <ul className="booking-list">{data.map((b) => (
          <li key={b.id} className="panel booking">
            <img src={b.listing?.image} alt="" />
            <div className="grow">
              <Link to={`/properties/${b.listing?.id}`}><b>{b.listing?.title}</b></Link>
              <div className="muted">{b.listing?.city} · {b.kind === 'inquiry' ? 'Inquiry to seller' : `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)} · ${b.guests} guest(s)`}</div>
              {b.total && <div><b>{fmt(b.total, b.currency)}</b></div>}
            </div>
            <div className="side"><StatusBadge status={b.status} />
              {['pending', 'confirmed'].includes(b.status) && <ConfirmButton onConfirm={() => cancel(b.id)} message="Cancel?">Cancel</ConfirmButton>}</div>
          </li>))}</ul>
      )}
    </>
  );
}
