import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import { PageHeader, Spinner, ErrorBox, Empty } from '../../components/ui';
import { fmtDate } from '../../utils';

export default function Messages() {
  useDocTitle('Messages');
  const { data, loading, error, reload } = useAsync(api.adminMessages);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Contact messages" subtitle="Sent from the Contact page." />
      {data.length === 0 ? <Empty title="No messages" /> : (
        <ul className="panel list msgs">{data.map((m) => (
          <li key={m.id}><div><b>{m.subject || '(no subject)'}</b><div className="muted">{m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {fmtDate(m.createdAt)}</div><p>{m.message}</p></div></li>))}</ul>
      )}
    </>
  );
}
