import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/** Runs an async fn on mount / when deps change. Returns { data, loading, error, reload, setData }. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const ref = useRef(fn); ref.current = fn;
  const run = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    ref.current().then(
      (data) => alive && setState({ data, loading: false, error: null }),
      (error) => alive && setState({ data: null, loading: false, error })
    );
    return () => { alive = false; };
  }, []); // eslint-disable-line
  useEffect(run, deps); // eslint-disable-line
  const setData = (data) => setState((s) => ({ ...s, data }));
  return { ...state, reload: run, setData };
}

export function useDocTitle(title) {
  useEffect(() => { document.title = title ? `${title} · RoomsForRentals` : 'RoomsForRentals'; }, [title]);
}

/** Cities are controlled by the website admin, so every dropdown loads them from the API. */
export function useCities() {
  const { data } = useAsync(api.cities);
  return data || [];
}
