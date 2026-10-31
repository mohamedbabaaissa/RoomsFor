import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatCard, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

export default function Overview() {
  useDocTitle('Admin overview');
  const toast = useToast();
  const { fmt } = useCurrency();
  const { data: s, loading, error, reload } = useAsync(api.adminStats);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const act = async (id, status) => {
    try { await api.adminSetBusinessStatus(id, status); toast(status === 'approved' ? 'Business approved. They can log in now.' : 'Business rejected.'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const max = Math.max(1, ...s.listingsByCity.map((c) => c.count));

  return (
    <>
      <PageHeader title="Overview" subtitle="What is happening on the platform." />
      <div className="stats">
        <StatCard icon="users" label="Users" value={s.users} />
        <StatCard icon="building" label="Approved businesses" value={s.businesses} />
        <StatCard icon="shield" label="Waiting for approval" value={s.pendingBusinesses} tone={s.pendingBusinesses ? 'warn' : ''} />
        <StatCard icon="home" label="Listings" value={s.listings} />
        <StatCard icon="calendar" label="Bookings & requests" value={s.bookings} />
        <StatCard icon="money" label="Confirmed value" value={fmt(s.revenueUSD, 'USD')} />
      </div>

      <div className="grid2">
        <section className="panel">
          <h2>Businesses waiting for your approval</h2>
          {s.pending.length === 0 ? <Empty title="All caught up">No business is waiting right now.</Empty> : (
            <ul className="list">
              {s.pending.map((b) => (
                <li key={b.id}>
                  <div><b>{b.businessName}</b><div className="muted">{b.name} · {b.email} · {b.city}</div><small className="muted">Applied {fmtDate(b.createdAt)}</small></div>
                  <div className="actions"><button className="btn sm primary" onClick={() => act(b.id, 'approved')}>Approve</button><button className="btn sm danger" onClick={() => act(b.id, 'rejected')}>Reject</button></div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/businesses" className="more">Manage all businesses →</Link>
        </section>
        <section className="panel">
          <h2>Listings by city</h2>
          <div className="bars">
            {s.listingsByCity.map((c) => (
              <div key={c.city} className="bar-row"><span>{c.city}</span><div className="bar"><i style={{ width: `${(c.count / max) * 100}%` }} /></div><b>{c.count}</b></div>
            ))}
          </div>
          <Link to="/admin/messages" className="more">{s.unreadMessages} contact message(s) →</Link>
        </section>
      </div>
    </>
  );
}
