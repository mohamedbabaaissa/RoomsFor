import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export const CURRENCIES = ['USD', 'EUR', 'DZD'];
const SYMBOL = { USD: '$', EUR: '€' };
const KEY = 'rfr_currency';
const FALLBACK_RATES = { DZD: 1, EUR: 250, USD: 230 }; // used only until /settings answers

const Ctx = createContext(null);
export const useCurrency = () => useContext(Ctx);

export function CurrencyProvider({ children }) {
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [currency, setCur] = useState(() => { try { const c = localStorage.getItem(KEY); return CURRENCIES.includes(c) ? c : 'USD'; } catch { return 'USD'; } });

  const reload = useCallback(() => api.settings().then((s) => setRates(s.rates)).catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);

  const setCurrency = (c) => { setCur(c); try { localStorage.setItem(KEY, c); } catch {} };

  const value = useMemo(() => {
    /** convert(100, 'EUR', 'DZD') -> 25000 */
    const convert = (amount, from = 'USD', to = currency) => (Number(amount) * rates[from]) / rates[to];
    /** fmt(450, 'USD') -> price shown in the visitor's chosen currency, e.g. "€414" or "103,500 DZD" */
    const fmt = (amount, from = 'USD', to = currency) => {
      const n = Math.round(convert(amount, from, to));
      const txt = n.toLocaleString('en-US');
      return to === 'DZD' ? `${txt} DZD` : `${SYMBOL[to]}${txt}`;
    };
    const unit = { night: '/ night', month: '/ month', once: '' };
    /** price(listing) -> "€1,890 / month" */
    const price = (l) => `${fmt(l.price, l.currency)} ${unit[l.priceUnit] || ''}`.trim();
    return { currency, setCurrency, rates, reload, convert, fmt, price };
  }, [currency, rates]); // eslint-disable-line

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
