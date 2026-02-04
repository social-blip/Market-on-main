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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: '#1a1a2e',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <Link to="/admin/dashboard" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
            MoM Admin
          </Link>
        </div>

        <nav>
          <NavLink
            to="/admin/dashboard"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/vendors"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Vendors
          </NavLink>
          <NavLink
            to="/admin/dates"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Market Dates
          </NavLink>
          <NavLink
            to="/admin/announcements"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Announcements
          </NavLink>
          <NavLink
            to="/admin/payments"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Payments
          </NavLink>
          <NavLink
            to="/admin/maps/builder"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Map Builder
          </NavLink>
          <NavLink
            to="/admin/music-applications"
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              color: isActive ? 'white' : '#999',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent'
            })}
          >
            Music Applications
          </NavLink>
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
            Logged in as {user?.name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '30px', background: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
