import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, ErrorBox, StatusBadge, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';

export default function Users() {
  useDocTitle('Users');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(api.adminUsers);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const set = async (u, status) => { try { await api.adminSetUserStatus(u.id, status); toast(status === 'blocked' ? 'User blocked' : 'User unblocked'); reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <>
      <PageHeader title="Users" subtitle={`${data.length} registered users`} />
      {data.length === 0 ? <Empty title="No users yet" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>{data.map((u) => (
            <tr key={u.id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone || '—'}</td><td>{u.bookings}</td><td>{fmtDate(u.createdAt)}</td><td><StatusBadge status={u.status} /></td>
              <td className="actions">{u.status === 'active' ? <button className="btn sm danger" onClick={() => set(u, 'blocked')}>Block</button> : <button className="btn sm primary" onClick={() => set(u, 'active')}>Unblock</button>}</td></tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
