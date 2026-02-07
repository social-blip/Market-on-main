import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/vendor.css';

const VendorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  return (
    <div className="vendor-layout">
      {/* Navbar */}
      <nav className="vendor-nav">
        <div className="vendor-nav__inner">
          {/* Brand */}
          <Link to="/vendor/dashboard" className="vendor-nav__brand">
            <span className="vendor-nav__brand-name">Market on Main</span>
            <span className="vendor-nav__brand-tag">Vendor</span>
          </Link>

          {/* Navigation */}
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="vendor-main">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
