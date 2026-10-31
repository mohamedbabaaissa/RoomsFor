import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { PageHeader, Spinner, ErrorBox, StatCard, StatusBadge, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

export default function Overview() {
  useDocTitle('Business overview');
  const { fmt } = useCurrency();
  const { data: s, loading, error, reload } = useAsync(api.bizStats);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const max = Math.max(1, ...s.byStatus.map((x) => x.count));
  return (
    <>
      <PageHeader title="Overview" subtitle="Your listings and the requests you received.">
        <Link to="/business/listings/new" className="btn primary">+ New listing</Link>
      </PageHeader>
      <div className="stats">
        <StatCard icon="home" label="Listings" value={s.listings} hint={`${s.published} published`} />
        <StatCard icon="calendar" label="Pending requests" value={s.pending} tone={s.pending ? 'warn' : ''} />
        <StatCard icon="check" label="Confirmed" value={s.confirmed} />
        <StatCard icon="money" label="Confirmed value" value={fmt(s.revenueUSD, 'USD')} />
      </div>
      <div className="grid2">
        <section className="panel">
          <h2>Latest requests</h2>
          {s.recent.length === 0 ? <Empty title="No requests yet">They will show up here.</Empty> : (
            <ul className="list">{s.recent.map((b) => (
              <li key={b.id}><div><b>{b.listing?.title}</b><div className="muted">{b.user?.name} · {b.kind === 'inquiry' ? 'Inquiry' : `${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}`}</div></div><StatusBadge status={b.status} /></li>))}</ul>
          )}
          <Link to="/business/bookings" className="more">All requests →</Link>
        </section>
        <section className="panel">
          <h2>Requests by status</h2>
          <div className="bars">{s.byStatus.map((x) => <div key={x.status} className="bar-row"><span>{x.status}</span><div className="bar"><i style={{ width: `${(x.count / max) * 100}%` }} /></div><b>{x.count}</b></div>)}</div>
        </section>
      </div>
    </>
  );
}
