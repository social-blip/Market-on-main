import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/public.css';

const PublicLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  const navItems = [
    { label: 'Home', sublabel: '', to: '/' },
    { label: 'Shop', sublabel: 'Vendors', to: '/vendors' },
    { label: 'Find', sublabel: 'Us', to: '/find-us' },
    { label: 'Get', sublabel: 'Involved', to: '/get-involved' },
    { label: 'Market', sublabel: 'News', to: '/blog' },
  ];

  return (
    <div>
      {/* Floating Header - matching TestHome4 */}
      <header className="floating-header">
        <div className="floating-header__inner">
          <nav className="pill-nav">
            {navItems.map((item, i) => (
              <NavLink key={i} to={item.to} className="pill-nav__item">
                <span className="pill-nav__label">{item.label} {item.sublabel}</span>
              </NavLink>
            ))}
          </nav>

          {/* Hamburger Button - Mobile Only */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-overlay__header">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-overlay__logo">
              <span className="floating-header__logo-text">MoM</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="mobile-menu-overlay__close"
            >
              ✕
            </button>
          </div>
          <nav className="mobile-menu-overlay__nav">
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="mobile-menu-overlay__link">
              Home
            </NavLink>
            {navItems.map((item, i) => (
              <NavLink
                key={i}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-menu-overlay__link"
              >
                {item.label} {item.sublabel}
              </NavLink>
            ))}
            <NavLink
              to="/become-vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu-overlay__link"
            >
              Become a Vendor
            </NavLink>
            <NavLink
              to="/vendor/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu-overlay__cta"
            >
              Vendor Login
            </NavLink>
          </nav>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      {/* Footer - matching TestHome4 */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div>
              <h3 className="footer__brand-name">Market on Main</h3>
              <p className="footer__brand-info">Every Saturday · June – August · 9am – 2pm</p>
              <p className="footer__brand-info">100 Block Main Ave N, Twin Falls, ID</p>
            </div>
            <div>
              <h4 className="footer__heading">Explore</h4>
              <div className="footer__links">
                <Link to="/vendors" className="footer__link">Vendors</Link>
                <Link to="/find-us" className="footer__link">Find Us</Link>
              </div>
            </div>
            <div>
              <h4 className="footer__heading">Join Us</h4>
              <div className="footer__links">
                <Link to="/become-vendor" className="footer__link">Become a Vendor</Link>
                <Link to="/get-involved" className="footer__link">Volunteer</Link>
                <Link to="/get-involved" className="footer__link">Sponsor</Link>
              </div>
            </div>
            <div>
              <h4 className="footer__heading">Connect</h4>
              <div className="footer__links">
                <Link to="/find-us" className="footer__link">Find Us</Link>
                <Link to="/contact" className="footer__link">Contact</Link>
                <Link to="/vendor/login" className="footer__link">Vendor Login</Link>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            © 2026 Market on Main · Twin Falls, Idaho
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
