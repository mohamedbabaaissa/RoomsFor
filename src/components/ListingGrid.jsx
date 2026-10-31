import { useEffect, useState } from 'react';
import Card from './Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

/** Grid of cards that also knows which listings the logged-in user has favorited. */
export default function ListingGrid({ items }) {
  const { user } = useAuth();
  const [favs, setFavs] = useState(new Set());
  useEffect(() => {
    if (user?.role !== 'user') return setFavs(new Set());
    api.favorites().then((l) => setFavs(new Set(l.map((x) => x.id)))).catch(() => {});
  }, [user]);
  const onToggle = (id, on) => setFavs((s) => { const n = new Set(s); on ? n.add(id) : n.delete(id); return n; });
  return <div className="cards-grid">{items.map((l) => <Card key={l.id} l={l} faved={favs.has(l.id)} onToggleFav={onToggle} />)}</div>;
}
