import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';

const PublicLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  // Determine header color based on current page's first section
  const getHeaderStyle = () => {
    // Red pages (Home)
    if (path === '/') {
      return { background: '#E30613', borderBottom: 'none' };
    }
    // Yellow pages (Vendors, Calendar)
    if (path === '/vendors' || path.startsWith('/vendors/') || path === '/calendar') {
      return { background: '#FFD700', borderBottom: 'none' };
    }
    // Blue pages
    if (path === '/become-vendor') {
      return { background: '#1a56db', borderBottom: 'none' };
    }
    if (path === '/apply') {
      return { background: '#0056b3', borderBottom: 'none' };
    }
    // Live Music page
    if (path === '/live-music') {
      return { background: '#E30613', borderBottom: 'none' };
    }
    // Find Us page
    if (path === '/find-us') {
      return { background: '#FFD700', borderBottom: 'none' };
    }

    return {}; // Default
  };

  // Determine if we're on a light background page
  const isLightBg = path === '/vendors' || path.startsWith('/vendors/') || path === '/calendar' || path === '/find-us';
  const textColor = isLightBg ? '#000' : '#fff';

  // Get marquee text color based on page
  const getMarqueeColor = () => {
    if (path === '/') return '#E30613'; // Red
    if (path === '/vendors' || path.startsWith('/vendors/') || path === '/calendar') return '#FFD700'; // Yellow
    if (path === '/become-vendor') return '#1a56db'; // Blue
    if (path === '/apply') return '#0056b3'; // Blue
    if (path === '/live-music') return '#E30613'; // Red
    if (path === '/find-us') return '#FFD700'; // Yellow
    return '#000'; // Default
  };

  return (
    <div>
      {/* MARQUEE BANNER */}
      <div className="brutal-marquee">
        <div className="brutal-marquee-content" style={{ color: getMarqueeColor() }}>
          Market on Main. Downtown Twin Falls. Saturdays 9am - 2pm. Handmade. Local. Fresh. Market on Main. Downtown Twin Falls. Saturdays 9am - 2pm. Handmade. Local. Fresh.
        </div>
      </div>

      {/* BRUTAL HEADER */}
      <header className="brutal-header" style={getHeaderStyle()}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 className="brutal-header-logo" style={{ color: textColor }}>MARKET ON MAIN</h1>
            </Link>
            {/* Hamburger Button - Mobile Only */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                display: 'none',
                background: 'transparent',
                border: `3px solid ${textColor}`,
                padding: '8px',
                cursor: 'pointer',
                flexDirection: 'column',
                gap: '5px',
                width: '44px',
                height: '44px',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <span style={{
                display: 'block',
                width: '24px',
                height: '3px',
                background: textColor,
                transition: 'transform 0.3s, opacity 0.3s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }} />
              <span style={{
                display: 'block',
                width: '24px',
                height: '3px',
                background: textColor,
                transition: 'opacity 0.3s',
                opacity: mobileMenuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block',
                width: '24px',
                height: '3px',
                background: textColor,
                transition: 'transform 0.3s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
              }} />
            </button>
          </div>
          {/* Desktop Nav */}
          <nav className="brutal-nav desktop-nav" style={{ '--nav-color': textColor }}>
            <NavLink to="/" end style={{ color: textColor }}>Home</NavLink>
            <NavLink to="/vendors" style={{ color: textColor }}>Vendors & Calendar</NavLink>
            <NavLink to="/live-music" style={{ color: textColor }}>Live Music</NavLink>
            <NavLink to="/find-us" style={{ color: textColor }}>Find Us</NavLink>
            <NavLink to="/become-vendor" style={{ color: textColor }}>Become a Vendor</NavLink>
            <NavLink
              to="/vendor/login"
              className="brutal-btn"
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                background: '#000',
                color: '#fff',
                border: '3px solid #000'
              }}
            >
              Vendor Login
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
              <h1 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '28px',
                color: '#fff',
                margin: 0
              }}>MARKET ON MAIN</h1>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: 'transparent',
                border: '3px solid #fff',
                color: '#fff',
                width: '44px',
                height: '44px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'sans-serif'
              }}
            >
              ✕
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                textTransform: 'uppercase'
              }}
            >
              Home
            </NavLink>
            <NavLink
              to="/vendors"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                textTransform: 'uppercase'
              }}
            >
              Vendors & Calendar
            </NavLink>
            <NavLink
              to="/live-music"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                textTransform: 'uppercase'
              }}
            >
              Live Music
            </NavLink>
            <NavLink
              to="/find-us"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                textTransform: 'uppercase'
              }}
            >
              Find Us
            </NavLink>
            <NavLink
              to="/become-vendor"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                textTransform: 'uppercase'
              }}
            >
              Become a Vendor
            </NavLink>
            <NavLink
              to="/vendor/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '24px',
                color: '#000',
                textDecoration: 'none',
                padding: '16px 24px',
                marginTop: '24px',
                background: '#FFD700',
                border: '3px solid #FFD700',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Vendor Login
            </NavLink>
          </nav>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      {/* BRUTAL FOOTER */}
      <div className="brutal-line"></div>
      <footer className="brutal-footer">
        <div className="brutal-footer-grid">
          <div>
            <h4>EXPLORE</h4>
            <ul>
              <li><Link to="/vendors">Vendors & Calendar</Link></li>
              <li><Link to="/live-music">Live Music</Link></li>
              <li><Link to="/become-vendor">Become a Vendor</Link></li>
              <li><Link to="/find-us">Find Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>CONTACT</h4>
            <p>
              <strong>Market on Main</strong><br />
              100 Block Main Ave N<br />
              Twin Falls, ID 83301
            </p>
            <p style={{ marginTop: '12px' }}>
              <a href="mailto:info@tfmarketonmain.com" style={{ color: '#fff' }}>
                info@tfmarketonmain.com
              </a>
            </p>
          </div>
          <div>
            <h4>FOLLOW US</h4>
            <ul>
              <li>
                <a href="https://www.facebook.com/marketonmaintwinfalls" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/market_on_main_twinfalls" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '3px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'Archivo Black, sans-serif',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '2px'
        }}>
          &copy; {new Date().getFullYear()} MARKET ON MAIN - TWIN FALLS, ID
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
