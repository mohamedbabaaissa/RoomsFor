import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="container page center"><h1 className="page-title">Page not found</h1><p className="muted">The page you are looking for does not exist.</p><Link className="btn primary" to="/">Go home</Link></div>;
}
