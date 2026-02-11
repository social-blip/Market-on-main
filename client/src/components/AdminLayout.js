import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/vendors', label: 'Vendors' },
    { to: '/admin/dates', label: 'Market Dates' },
    { to: '/admin/announcements', label: 'Announcements' },
    { to: '/admin/payments', label: 'Payments' },
    { to: '/admin/maps/builder', label: 'Map Builder' },
    { to: '/admin/music-applications', label: 'Musicians' },
    { to: '/admin/music-schedule', label: 'Music Schedule' },
    { to: '/admin/blog', label: 'Blog' },
    { to: '/admin/contact-submissions', label: 'Contact' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: 'var(--maroon)',
        color: 'var(--cream)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/admin/dashboard" style={{ color: 'var(--cream)', textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: 0 }}>
              Market on Main
            </h1>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>Admin</span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: 'var(--cream)',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--yellow)' : '3px solid transparent',
                fontSize: '14px'
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px' }}>
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '12px' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '32px', background: 'var(--cream)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
