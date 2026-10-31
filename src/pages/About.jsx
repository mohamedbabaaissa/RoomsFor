import './About.css';
import { Link } from 'react-router-dom';
import { useDocTitle } from '../hooks';

export default function About() {
  useDocTitle('About');
  return (
    <>
      <section className="page-hero"><h1>About RoomsForRentals</h1><p>One place for homes and hotels, to rent or to buy.</p></section>
      <div className="container page narrow">
        <div className="about-split">
          <img src="/img/dream.jpg" alt="Modern villa" />
          <div>
            <h2>Our story</h2>
            <p>We started RoomsForRentals so that finding a place to live, stay or invest feels simple and honest. Real listings, from businesses we verify by hand.</p>
            <p>Homeowners, agencies and hotels create a business account, our team approves it, and only then can they publish. That keeps the listings real.</p>
          </div>
        </div>
        <div className="values">
          {[['Verified businesses', 'Every business is reviewed by the website admin before going live.'], ['Clear prices', 'No hidden fees. You see the total before you send a request.'], ['Rent, stay or buy', 'Homes to rent, hotel rooms by the night and properties for sale.']].map(([t, d]) => (
            <div key={t} className="value"><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <div className="stats-row">
          <div><b>150+</b><span>Partner companies</span></div><div><b>4</b><span>Cities</span></div><div><b>1,500+</b><span>Happy guests</span></div>
        </div>
        <div className="cta-band">
          <h2>Have a property or a hotel?</h2>
          <p>Create a business account and start listing in minutes.</p>
          <Link className="btn primary" to="/business/register">Become a partner</Link>
        </div>
      </div>
    </>
  );
}
