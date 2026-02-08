import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/vendor.css';

const VendorLayout = () => {
  const { user, logout, returnToAdmin, isImpersonating } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const handleReturnToAdmin = async () => {
    await returnToAdmin();
    navigate('/admin');
  };

  return (
    <div className="vendor-layout">
      {/* Impersonation banner */}
      {isImpersonating && (
        <div style={{
          background: '#2563eb',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          Viewing as {user?.businessName || user?.business_name} —{' '}
          <button
            onClick={handleReturnToAdmin}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            Return to Admin
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="vendor-nav">
        <div className="vendor-nav__inner">
          {/* Brand */}
          <Link to="/vendor/dashboard" className="vendor-nav__brand">
            <span className="vendor-nav__brand-name">Market on Main</span>
            <span className="vendor-nav__brand-tag">Vendor</span>
          </Link>

          {/* Navigation (desktop) */}
          <div className="vendor-nav__links">
            <NavLink
              to="/vendor/dashboard"
              className={({ isActive }) => `vendor-nav__link ${isActive ? 'vendor-nav__link--active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/vendor/schedule"
              className={({ isActive }) => `vendor-nav__link ${isActive ? 'vendor-nav__link--active' : ''}`}
            >
              Schedule
            </NavLink>
            <NavLink
              to="/vendor/payments"
              className={({ isActive }) => `vendor-nav__link ${isActive ? 'vendor-nav__link--active' : ''}`}
            >
              Payments
            </NavLink>
            <NavLink
              to="/vendor/profile"
              className={({ isActive }) => `vendor-nav__link ${isActive ? 'vendor-nav__link--active' : ''}`}
            >
              Profile
            </NavLink>
          </div>

          <div className="vendor-nav__user">
            <span className="vendor-nav__user-name">
              {user?.businessName || user?.business_name}
            </span>
            <button onClick={handleLogout} className="vendor-nav__logout">
              Logout
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="vendor-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`vendor-nav__hamburger-icon ${menuOpen ? 'vendor-nav__hamburger-icon--open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && <div className="vendor-mobile-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Mobile menu */}
      <div className={`vendor-mobile-menu ${menuOpen ? 'vendor-mobile-menu--open' : ''}`}>
        <NavLink
          to="/vendor/dashboard"
          className={({ isActive }) => `vendor-mobile-menu__link ${isActive ? 'vendor-mobile-menu__link--active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/vendor/schedule"
          className={({ isActive }) => `vendor-mobile-menu__link ${isActive ? 'vendor-mobile-menu__link--active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Schedule
        </NavLink>
        <NavLink
          to="/vendor/payments"
          className={({ isActive }) => `vendor-mobile-menu__link ${isActive ? 'vendor-mobile-menu__link--active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Payments
        </NavLink>
        <NavLink
          to="/vendor/profile"
          className={({ isActive }) => `vendor-mobile-menu__link ${isActive ? 'vendor-mobile-menu__link--active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          Profile
        </NavLink>
        <button
          className="vendor-mobile-menu__logout"
          onClick={() => { setMenuOpen(false); handleLogout(); }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <main className="vendor-main">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
