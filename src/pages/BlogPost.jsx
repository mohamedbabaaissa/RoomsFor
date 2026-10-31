import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync, useDocTitle } from '../hooks';
import { Spinner, ErrorBox } from '../components/ui';
import { fmtDate } from '../utils';

export default function BlogPost() {
  const { id } = useParams();
  const { data: p, loading, error, reload } = useAsync(() => api.post(id), [id]);
  useDocTitle(p?.title);
  if (loading) return <Spinner />;
  if (error) return <div className="container page"><ErrorBox error={error} onRetry={reload} /></div>;
  return (
    <article className="container page narrow">
      <Link to="/blog" className="back">← Blog</Link>
      <span className="tag">{p.category}</span>
      <h1 className="page-title left">{p.title}</h1>
      <small className="muted">{fmtDate(p.date)}</small>
      <img className="post-cover" src={p.image} alt="" />
      {p.body.map((t, i) => <p className="desc" key={i}>{t}</p>)}
    </article>
  );
}
