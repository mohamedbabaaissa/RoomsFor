import './Navbar.css';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth, homeFor } from '../context/AuthContext';
import CurrencySwitch from './CurrencySwitch';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);
  const link = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="site-header">
      <div className="navbar">
        <Link to="/" className="logo" onClick={close}>
          <img src="/img/logo.png" alt="" />
          <div className="logo-text"><h1>RoomsFor</h1><h2>Rentals.com</h2></div>
        </Link>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon name={open ? 'x' : 'menu'} size={22} /></button>

        <nav className={`nav-menu ${open ? 'open' : ''}`}>
          <NavLink to="/" end className={link} onClick={close}>Home</NavLink>
          <NavLink to="/properties" className={link} onClick={close}>Property</NavLink>
          <NavLink to="/blog" className={link} onClick={close}>Blog</NavLink>
          <NavLink to="/about" className={link} onClick={close}>About</NavLink>
          <NavLink to="/contact" className={link} onClick={close}>Contact</NavLink>

          <div className="right-side">
            <CurrencySwitch />
            {user ? (
              <>
                <Link to={homeFor(user.role)} className="login" onClick={close}><img src="/img/user-interface.png" alt="" className="login-img" /> {user.name.split(' ')[0]}</Link>
                <button className="login plain" onClick={() => { logout(); close(); nav('/'); }}><Icon name="logout" size={16} /> Log out</button>
              </>
            ) : (
              <Link to="/login" className="login" onClick={close}><img src="/img/user-interface.png" alt="" className="login-img" /> Register / Login</Link>
            )}
            <Link to={user?.role === 'business' ? '/business/listings/new' : '/business/register'} className="sell-btn" onClick={close}>
              <img src="/img/dollar-sign.png" alt="" className="sellhos" /> Sell Property
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
