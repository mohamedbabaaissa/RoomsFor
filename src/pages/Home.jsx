import './Home.css';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAsync, useDocTitle, useCities } from '../hooks';
import ListingGrid from '../components/ListingGrid';
import Icon from '../components/Icon';
import AgentCard from '../components/AgentCard';
import { Spinner, ErrorBox } from '../components/ui';

function Hero() {
  const nav = useNavigate();
  const [tab, setTab] = useState('rent');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const cities = useCities();
  const go = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (tab === 'hotel') p.set('category', 'hotel'); else p.set('mode', tab);
    if (city) p.set('city', city);
    if (q) p.set('q', q);
    nav(`/properties?${p}`);
  };
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <h2>Find your perfect property with us</h2>
        <p>Here you find comfort and happiness. Rent a home, book a hotel, or buy your next place.</p>
        <form className="hero-search" onSubmit={go}>
          <div className="hero-tabs">
            {[['rent', 'Rent a home'], ['sale', 'Buy'], ['hotel', 'Hotels']].map(([v, l]) => (
              <button type="button" key={v} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>{l}</button>
            ))}
          </div>
          <div className="hero-fields">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or area" aria-label="Search" />
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
            <button className="btn primary"><Icon name="search" size={18} /> Search</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Cities() {
  const { data, loading } = useAsync(api.cities);
  const row = useRef(null);
  const scroll = (d) => row.current?.scrollBy({ left: d * 260, behavior: 'smooth' });
  return (
    <section className="explor-section">
      <h2>Explore our listing</h2>
      <p>Pick a city and see what is available right now.</p>
      <div className="slider-wrapper">
        <button className="arrow" onClick={() => scroll(-1)} aria-label="Previous"><Icon name="arrowL" /></button>
        <div className="cities" ref={row}>
          {loading && <Spinner />}
          {data?.map((c) => (
            <Link key={c.id} to={`/properties?city=${encodeURIComponent(c.name)}`} className="city">
              {c.image ? <img src={c.image} alt={c.name} /> : <span className="city-ph">{c.name[0]}</span>}
              <span className="city-name">{c.name}</span>
              <span className="city-count">{c.count} listing{c.count === 1 ? '' : 's'}</span>
            </Link>
          ))}
        </div>
        <button className="arrow right" onClick={() => scroll(1)} aria-label="Next"><Icon name="arrowR" /></button>
      </div>
    </section>
  );
}

function Section({ title, subtitle, params, cta, tone }) {
  const { data, loading, error, reload } = useAsync(() => api.listings(params), [JSON.stringify(params)]);
  return (
    <section className={`block ${tone || ''}`}>
      <h2>{title}</h2><p className="sub">{subtitle}</p>
      {loading ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : <ListingGrid items={data.items} />}
      {cta && <div className="center"><Link to={cta[0]} className="btn outline">{cta[1]}</Link></div>}
    </section>
  );
}

function Dream() {
  const { data: agents } = useAsync(api.agents);
  return (
    <section className="dream-section">
      <div className="dream-img"><img src="/img/dream.jpg" alt="Modern home with pool" /></div>
      <div className="dream-content">
        <h2>Explore your dream home or boost your investment portfolio today. Your future awaits!</h2>
        <p>Talk directly to verified businesses. Every agent and hotel on RoomsForRentals is approved by our team before they can publish.</p>
        <div className="agents-grid">
          {agents?.slice(0, 2).map((a) => <AgentCard key={a.id} a={a} />)}
        </div>
      </div>
    </section>
  );
}

function Agents() {
  const { data: agents } = useAsync(api.agents);
  return (
    <section className="agents-section">
      <h2>Meet the agents</h2>
      <p className="sub">Approved businesses you can book and buy from with confidence. Tap one to see all their properties.</p>
      <div className="agents-row">
        {agents?.slice(0, 6).map((a, i) => <AgentCard key={a.id} a={a} featured={i === 1} />)}
      </div>
      <p className="agent-cta">Own a home or a hotel? <Link to="/business/register">Become a partner and start listing.</Link></p>
    </section>
  );
}

export default function Home() {
  useDocTitle('');
  return (
    <>
      <Hero />
      <Cities />
      <Section title="Discover the latest real estate" subtitle="Freshly listed homes and hotels." params={{ sort: 'newest', limit: 3 }} cta={['/properties', 'View all properties']} />
      <Dream />
      <Section tone="tint" title="Properties for sale" subtitle="Buy a home with a trusted agency." params={{ mode: 'sale', limit: 3 }} cta={['/properties?mode=sale', 'See all for sale']} />
      <Section title="Hotels" subtitle="Book a room by the night." params={{ category: 'hotel', limit: 3 }} cta={['/properties?category=hotel', 'See all hotels']} />
      <section className="trusted-section">
        <p>Trusted by over 150+ major companies</p>
        <div className="logos-grid">
          {['twitch_PNG57', 'google_PNG19624', 'amazon_PNG24', 'microsoft_PNG20'].map((n) => <img key={n} src={`/img/${n}.png`} alt="" className="p-img" />)}
        </div>
      </section>
      <Agents />
    </>
  );
}
