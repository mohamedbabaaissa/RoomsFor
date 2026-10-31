import './Blog.css';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync, useDocTitle } from '../hooks';
import { Spinner, ErrorBox } from '../components/ui';
import { fmtDate } from '../utils';

export default function Blog() {
  useDocTitle('Blog');
  const { data, loading, error, reload } = useAsync(api.posts);
  return (
    <div className="container page">
      <h1 className="page-title">Blog</h1>
      {loading ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <div className="cards-grid">
          {data.map((p) => (
            <Link to={`/blog/${p.id}`} className="card post" key={p.id}>
              <div className="card-img"><img src={p.image} alt="" loading="lazy" /></div>
              <div className="card-body"><span className="tag">{p.category}</span><div className="card-title">{p.title}</div><p className="muted">{p.excerpt}</p><small className="time">{fmtDate(p.date)}</small></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
