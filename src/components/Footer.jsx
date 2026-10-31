import './Footer.css';
import { Link } from 'react-router-dom';
import { resetMockDb } from '../api/mock/server';
import { USE_MOCK } from '../api/config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="logo light"><img src="/img/logo.png" alt="" /><div className="logo-text"><h1>RoomsFor</h1><h2>Rentals.com</h2></div></div>
          <p className="muted">Homes and hotels to rent or buy. Find the place that fits your life.</p>
        </div>
        <div><h4>Explore</h4><Link to="/properties">All properties</Link><Link to="/properties?category=hotel">Hotels</Link><Link to="/properties?mode=sale">For sale</Link><Link to="/blog">Blog</Link></div>
        <div><h4>Company</h4><Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/business/register">List your property</Link></div>
        <div><h4>Account</h4><Link to="/login">Log in</Link><Link to="/register">Create account</Link><Link to="/admin/login">Admin</Link></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} RoomsForRentals.com</span>
        {USE_MOCK && <a href="#reset" onClick={(e) => { e.preventDefault(); resetMockDb(); localStorage.removeItem('rfr_token'); location.href = '/'; }}>Reset demo data</a>}
      </div>
    </footer>
  );
}
