import './Currency.css';
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDocTitle } from '../../hooks';
import { PageHeader, Spinner, ErrorBox } from '../../components/ui';
import { fmtDate } from '../../utils';

export default function Currency() {
  useDocTitle('Currency');
  const toast = useToast();
  const { reload } = useCurrency();
  const { data, loading, error, reload: reloadSettings, setData } = useAsync(api.adminSettings);
  const [mode, setMode] = useState('manual');
  const [eur, setEur] = useState('');
  const [usd, setUsd] = useState('');
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('EUR');

  useEffect(() => {
    if (!data) return;
    setMode(data.mode); setEur(String(data.manualRates.EUR)); setUsd(String(data.manualRates.USD));
  }, [data]);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reloadSettings} />;

  const manual = { DZD: 1, EUR: Number(eur) || 0, USD: Number(usd) || 0 };
  const active = mode === 'auto' ? data.autoRates : manual;          // what the preview below uses
  const valid = active.EUR > 0 && active.USD > 0;
  const conv = (a, f, t) => (valid ? ((Number(a) || 0) * active[f]) / active[t] : 0);
  const show = (n, c) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${c}`;
  const dirty = mode !== data.mode || manual.EUR !== data.manualRates.EUR || manual.USD !== data.manualRates.USD;

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      setData(await api.adminSaveSettings({ mode, rates: { EUR: manual.EUR, USD: manual.USD } }));
      await reload(); toast(mode === 'auto' ? 'Auto rates are now used on the whole site.' : 'Your manual rates are now used on the whole site.');
    } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };
  const refresh = async () => {
    setBusy(true);
    try { setData(await api.adminRefreshRates()); await reload(); toast('Rates refreshed from the bank.'); } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Currency rates" subtitle="Visitors can switch between USD, EUR and DZD. Prices convert automatically with the rates you choose here." />
      <div className="grid2">
        <form className="panel rate-form" onSubmit={save}>
          <h2>Where do the rates come from?</h2>
          <div className="mode-pick" role="radiogroup" aria-label="Rate source">
            <label className={`mode ${mode === 'manual' ? 'on' : ''}`}><input type="radio" name="mode" checked={mode === 'manual'} onChange={() => setMode('manual')} /><b>Manual</b><span>I type the rates myself (e.g. market rate).</span></label>
            <label className={`mode ${mode === 'auto' ? 'on' : ''}`}><input type="radio" name="mode" checked={mode === 'auto'} onChange={() => setMode('auto')} /><b>Automatic (bank)</b><span>Official rates, updated for me.</span></label>
          </div>

          {mode === 'manual' ? (
            <>
              <label className="rate-row"><span>1 EUR =</span><input type="number" step="0.01" min="0.01" required value={eur} onChange={(e) => setEur(e.target.value)} /><span>DZD</span></label>
              <label className="rate-row"><span>1 USD =</span><input type="number" step="0.01" min="0.01" required value={usd} onChange={(e) => setUsd(e.target.value)} /><span>DZD</span></label>
              <small className="muted">Change these whenever the market moves. Last saved {fmtDate(data.updatedAt)}.</small>
            </>
          ) : (
            <div className="auto-box">
              <div className="rate-line"><span>1 EUR =</span><b>{data.autoRates.EUR} DZD</b></div>
              <div className="rate-line"><span>1 USD =</span><b>{data.autoRates.USD} DZD</b></div>
              <small className="muted">Official bank rates, last updated {fmtDate(data.autoUpdatedAt)}. Your manual rates ({data.manualRates.EUR} / {data.manualRates.USD}) are kept if you switch back.</small>
              <button type="button" className="btn sm outline" onClick={refresh} disabled={busy}>Refresh from bank now</button>
            </div>
          )}
          <button className="btn primary" disabled={busy || !valid || !dirty}>{busy ? 'Saving…' : dirty ? 'Save' : 'Saved'}</button>
          <small className="muted">Live now on the site: <b>{data.mode === 'auto' ? 'Automatic (bank)' : 'Manual'}</b></small>
        </form>

        <section className="panel">
          <h2>Try it</h2>
          <div className="calc">
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
            <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Currency">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <ul className="list">
            {CURRENCIES.filter((c) => c !== from).map((c) => <li key={c}><span>{show(Number(amount) || 0, from)} =</span><b>{show(conv(amount, from, c), c)}</b></li>)}
          </ul>
          <small className="muted">Preview uses the source selected on the left, even before you save.</small>
        </section>
      </div>
    </>
  );
}
