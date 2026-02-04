import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VendorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    color: '#000',
    textDecoration: 'none',
    padding: '8px 16px',
    background: isActive ? '#FFD700' : 'transparent',
    border: isActive ? '3px solid #000' : '3px solid transparent',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.1s'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <nav style={{
        background: '#fff',
        borderBottom: '4px solid #000',
        padding: '0 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Brand */}
          <Link
            to="/vendor/dashboard"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              color: '#000',
              textTransform: 'uppercase'
            }}>
              Market on Main
            </span>
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#000',
              background: '#FFD700',
              padding: '4px 10px',
              border: '2px solid #000',
              textTransform: 'uppercase'
            }}>
              Vendor
            </span>
          </Link>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink to="/vendor/dashboard" style={navLinkStyle}>Dashboard</NavLink>
            <NavLink to="/vendor/schedule" style={navLinkStyle}>Schedule</NavLink>
            <NavLink to="/vendor/payments" style={navLinkStyle}>Payments</NavLink>
            <NavLink to="/vendor/profile" style={navLinkStyle}>Profile</NavLink>

            <div style={{
              marginLeft: '16px',
              paddingLeft: '16px',
              borderLeft: '3px solid #000',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                color: '#000',
                fontSize: '14px'
              }}>
                {user?.businessName || user?.business_name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '8px 14px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
