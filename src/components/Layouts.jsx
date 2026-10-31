import './Layouts.css';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Icon from './Icon';
import CurrencySwitch from './CurrencySwitch';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils';

export function PublicLayout() {
  return (<><Navbar /><main className="site-main"><Outlet /></main><Footer /></>);
}

const NAVS = {
  admin: { title: 'Website admin', items: [
    ['/admin', 'Overview', 'grid', true], ['/admin/businesses', 'Businesses', 'building'], ['/admin/users', 'Users', 'users'],
    ['/admin/listings', 'Listings', 'home'], ['/admin/cities', 'Places (home cards)', 'pin'], ['/admin/currency', 'Currency rates', 'money'],
    ['/admin/bookings', 'Bookings', 'calendar'], ['/admin/messages', 'Messages', 'mail'],
  ] },
  business: { title: 'Business dashboard', items: [
    ['/business', 'Overview', 'grid', true], ['/business/listings', 'My listings', 'home'], ['/business/bookings', 'Requests & bookings', 'calendar'], ['/business/profile', 'My profile', 'user'],
  ] },
  user: { title: 'My account', items: [
    ['/account', 'My bookings', 'calendar', true], ['/account/favorites', 'Favorites', 'heart'], ['/account/profile', 'Profile', 'user'],
  ] },
};

export function DashboardLayout({ kind }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const cfg = NAVS[kind];
  return (
    <div className={`dash ${kind}`}>
      <aside className={`dash-side ${open ? 'open' : ''}`}>
        <Link to="/" className="logo light"><img src="/img/logo.png" alt="" /><div className="logo-text"><h1>RoomsFor</h1><h2>Rentals.com</h2></div></Link>
        <div className="dash-title">{cfg.title}</div>
        <nav>
          {cfg.items.map(([to, label, icon, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon name={icon} size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="dash-side-bottom">
          <Link to="/"><Icon name="arrowL" size={18} /> Back to website</Link>
          <button onClick={() => { logout(); nav('/'); }}><Icon name="logout" size={18} /> Log out</button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="dash-main">
        <div className="dash-top">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
          <CurrencySwitch />
          <div className="who"><div className="avatar lg">{user?.avatar ? <img src={user.avatar} alt="" className="avatar-img" /> : initials(user?.businessName || user?.name)}</div>
            <div><strong>{user?.businessName || user?.name}</strong><small>{user?.email}</small></div></div>
        </div>
        <div className="dash-content"><Outlet /></div>
      </div>
    </div>
  );
}
