import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingApplications: 0,
    totalPayments: 0,
    pendingPayments: 0,
    upcomingMarkets: 0
  });
  const [recentVendors, setRecentVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [dateRequests, setDateRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsRes, paymentsRes, datesRes, dateRequestsRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/payments'),
        api.get('/dates'),
        api.get('/admin/date-requests')
      ]);

      const vendors = vendorsRes.data;
      const payments = paymentsRes.data;
      const dates = datesRes.data;
      setDateRequests(dateRequestsRes.data);

      const today = new Date();
      const upcomingMarkets = dates.filter(d => new Date(d.date) >= today && !d.is_cancelled).length;
      const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalPayments = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pendingApps = vendors.filter(v => v.application_status === 'pending' || (!v.is_active && !v.is_approved));

      setStats({
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.is_active).length,
        pendingApplications: pendingApps.length,
        totalPayments,
        pendingPayments,
        upcomingMarkets,
        dateRequests: dateRequestsRes.data.length
      });

      setRecentVendors(vendors.filter(v => v.is_active).slice(0, 5));
      setPendingVendors(pendingApps.slice(0, 5));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2">Dashboard</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '32px' }}>Market on Main 2026 Overview</p>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-4" style={{ gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--maroon)' }}>{stats.activeVendors}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Active Vendors</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderColor: stats.pendingApplications > 0 ? 'var(--danger)' : undefined }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: stats.pendingApplications > 0 ? 'var(--danger)' : 'var(--dark)' }}>{stats.pendingApplications}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Pending Apps</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700 }}>{stats.upcomingMarkets}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Upcoming Markets</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'var(--maroon)', color: 'var(--cream)' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--yellow)' }}>${stats.totalPayments.toFixed(0)}</div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Revenue</div>
        </div>
      </div>

      {/* Date Requests */}
      {dateRequests.length > 0 && (
        <div className="card mb-4" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="flex-between mb-2">
            <h4 style={{ color: '#f59e0b', margin: 0 }}>Date Requests ({dateRequests.length})</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Group by vendor */}
            {Object.values(dateRequests.reduce((acc, req) => {
              if (!acc[req.vendor_id]) {
                acc[req.vendor_id] = { vendor_id: req.vendor_id, business_name: req.business_name, contact_name: req.contact_name, dates: [] };
              }
              acc[req.vendor_id].dates.push(req.date);
              return acc;
            }, {})).map(vendor => (
              <Link
                key={vendor.vendor_id}
                to={`/admin/vendors/${vendor.vendor_id}`}
                className="flex-between"
                style={{ padding: '12px', background: '#fffbeb', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{vendor.business_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray)' }}>
                    {vendor.dates.length} date{vendor.dates.length !== 1 ? 's' : ''} requested
                  </div>
                </div>
                <span className="badge badge-warning">Review</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cards Row */}
      <div className="grid grid-3" style={{ gap: '24px' }}>
        {/* Pending Applications */}
        {pendingVendors.length > 0 && (
          <div className="card">
            <div className="flex-between mb-2">
              <h4 style={{ color: 'var(--danger)', margin: 0 }}>Needs Review</h4>
              <Link to="/admin/vendors">View All →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingVendors.map(vendor => (
                <Link
                  key={vendor.id}
                  to={`/admin/vendors/${vendor.id}`}
                  className="flex-between"
                  style={{ padding: '12px', background: 'var(--light)', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{vendor.business_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{vendor.contact_name}</div>
                  </div>
                  <span className="badge badge-warning">Review</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Vendors */}
        <div className="card">
          <div className="flex-between mb-2">
            <h4 style={{ margin: 0 }}>Active Vendors</h4>
            <Link to="/admin/vendors">View All →</Link>
          </div>
          {recentVendors.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No active vendors yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentVendors.map(vendor => (
                <Link
                  key={vendor.id}
                  to={`/admin/vendors/${vendor.id}`}
                  className="flex-between"
                  style={{ padding: '12px', background: 'var(--light)', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{vendor.business_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{vendor.contact_name}</div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ background: 'var(--maroon)', color: 'var(--cream)' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--yellow)' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/admin/vendors" className="btn btn-primary" style={{ background: 'var(--yellow)', color: 'var(--dark)', textAlign: 'center' }}>
              Manage Vendors
            </Link>
            <Link to="/admin/payments" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              View Payments
            </Link>
            <Link to="/admin/announcements" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              Announcements
            </Link>
            <Link to="/admin/dates" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              Market Dates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
