import { useState } from 'react';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, Tabs, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';

export default function Businesses() {
  useDocTitle('Businesses');
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const { data, loading, error, reload } = useAsync(api.adminBusinesses);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const count = (s) => data.filter((b) => b.status === s).length;
  const rows = tab === 'all' ? data : data.filter((b) => b.status === tab);
  const set = async (b, status, msg) => {
    try { await api.adminSetBusinessStatus(b.id, status); toast(msg); reload(); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <PageHeader title="Businesses" subtitle="Confirm who can log in and publish homes and hotels." />
      <Tabs value={tab} onChange={setTab} items={[['pending', 'Pending', count('pending')], ['approved', 'Approved', count('approved')], ['rejected', 'Rejected', count('rejected')], ['suspended', 'Suspended', count('suspended')], ['all', 'All', data.length]]} />
      {rows.length === 0 ? <Empty title="Nothing here">No businesses in this tab.</Empty> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Business</th><th>Contact</th><th>City</th><th>Listings</th><th>Applied</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((b) => (
            <tr key={b.id}>
              <td><b>{b.businessName}</b><div className="muted">{b.businessType}</div></td>
              <td>{b.name}<div className="muted">{b.email}<br />{b.phone}</div></td>
              <td>{b.city}</td><td>{b.listings}</td><td>{fmtDate(b.createdAt)}</td>
              <td><StatusBadge status={b.status} /></td>
              <td className="actions">
                {b.status === 'pending' && <><button className="btn sm primary" onClick={() => set(b, 'approved', 'Approved. They can log in now.')}>Approve</button><button className="btn sm danger" onClick={() => set(b, 'rejected', 'Rejected.')}>Reject</button></>}
                {b.status === 'approved' && <button className="btn sm danger" onClick={() => set(b, 'suspended', 'Business suspended. Their listings are hidden.')}>Suspend</button>}
                {(b.status === 'suspended' || b.status === 'rejected') && <button className="btn sm primary" onClick={() => set(b, 'approved', 'Business approved.')}>{b.status === 'rejected' ? 'Approve' : 'Reactivate'}</button>}
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
