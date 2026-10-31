import { useState } from 'react';
import Icon from './Icon';

export const Spinner = ({ label = 'Loading…' }) => <div className="spinner-wrap"><div className="spinner" /><span>{label}</span></div>;

export const Empty = ({ title, children, action }) => (
  <div className="empty"><h3>{title}</h3>{children && <p>{children}</p>}{action}</div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="empty error"><h3>Something went wrong</h3><p>{error?.message || 'Please try again.'}</p>{onRetry && <button className="btn" onClick={onRetry}>Retry</button>}</div>
);

export const StatusBadge = ({ status }) => <span className={`status s-${status}`}>{status}</span>;

export const Stars = ({ n }) => <span className="stars" aria-label={`${n} stars`}>{Array.from({ length: n }, (_, i) => <Icon key={i} name="star" size={14} fill />)}</span>;

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <div className="page-header-actions">{children}</div>
    </div>
  );
}

/** Button that asks "Are you sure?" inline before running onConfirm. */
export function ConfirmButton({ children, onConfirm, className = 'btn sm danger', message = 'Sure?' }) {
  const [ask, setAsk] = useState(false);
  if (!ask) return <button className={className} onClick={() => setAsk(true)}>{children}</button>;
  return (
    <span className="confirm-inline">
      <span>{message}</span>
      <button className="btn sm danger" onClick={() => { setAsk(false); onConfirm(); }}>Yes</button>
      <button className="btn sm ghost" onClick={() => setAsk(false)}>No</button>
    </span>
  );
}

export const StatCard = ({ icon, label, value, hint, tone }) => (
  <div className={`stat ${tone || ''}`}>
    <div className="stat-icon"><Icon name={icon} size={20} /></div>
    <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div>{hint && <div className="stat-hint">{hint}</div>}</div>
  </div>
);

export const Tabs = ({ value, onChange, items }) => (
  <div className="tabs" role="tablist">
    {items.map(([v, label, count]) => (
      <button key={v} role="tab" aria-selected={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
        {label}{count !== undefined && <em>{count}</em>}
      </button>
    ))}
  </div>
);
