import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAsync, useDocTitle } from '../../hooks';
import ListingGrid from '../../components/ListingGrid';
import { PageHeader, Spinner, ErrorBox, Empty } from '../../components/ui';

export default function Favorites() {
  useDocTitle('Favorites');
  const { data, loading, error, reload } = useAsync(api.favorites);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Favorites" subtitle="Places you saved." />
      {data.length === 0 ? <Empty title="No favorites yet" action={<Link className="btn primary" to="/properties">Browse properties</Link>}>Tap the heart on any listing to save it.</Empty> : <ListingGrid items={data} />}
    </>
  );
}
