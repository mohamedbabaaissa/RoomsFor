import './CurrencySwitch.css';
import { CURRENCIES, useCurrency } from '../context/CurrencyContext';

export default function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="cur-switch" role="group" aria-label="Currency">
      {CURRENCIES.map((c) => (
        <button key={c} className={c === currency ? 'on' : ''} onClick={() => setCurrency(c)} aria-pressed={c === currency}>{c}</button>
      ))}
    </div>
  );
}
