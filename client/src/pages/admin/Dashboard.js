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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsRes, paymentsRes, datesRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/payments'),
        api.get('/dates')
      ]);

      const vendors = vendorsRes.data;
      const payments = paymentsRes.data;
      const dates = datesRes.data;

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
        upcomingMarkets
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: '#000',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          Market on Main 2026 Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Active Vendors */}
        <div style={{
          background: '#FFD700',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '48px',
            color: '#000',
            lineHeight: 1
          }}>
            {stats.activeVendors}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Active Vendors
          </div>
        </div>

        {/* Pending Applications */}
        <div style={{
          background: stats.pendingApplications > 0 ? '#fff' : '#fff',
          border: stats.pendingApplications > 0 ? '4px solid #E30613' : '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '48px',
            color: stats.pendingApplications > 0 ? '#E30613' : '#000',
            lineHeight: 1
          }}>
            {stats.pendingApplications}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: stats.pendingApplications > 0 ? '#E30613' : '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Pending Apps
          </div>
        </div>

        {/* Upcoming Markets */}
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '48px',
            color: '#000',
            lineHeight: 1
          }}>
            {stats.upcomingMarkets}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Upcoming Markets
          </div>
        </div>

        {/* Revenue */}
        <div style={{
          background: '#000',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '48px',
            color: '#FFD700',
            lineHeight: 1
          }}>
            ${stats.totalPayments.toFixed(0)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Revenue
          </div>
        </div>

        {/* Pending Payments */}
        <div style={{
          background: stats.pendingPayments > 0 ? '#fff' : '#fff',
          border: stats.pendingPayments > 0 ? '4px solid #E30613' : '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '48px',
            color: stats.pendingPayments > 0 ? '#E30613' : '#000',
            lineHeight: 1
          }}>
            ${stats.pendingPayments.toFixed(0)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: stats.pendingPayments > 0 ? '#E30613' : '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Outstanding
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* Pending Applications */}
        {pendingVendors.length > 0 && (
          <div style={{
            background: '#fff',
            border: '4px solid #E30613',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '3px solid #E30613'
            }}>
              <h3 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                color: '#E30613',
                margin: 0,
                textTransform: 'uppercase'
              }}>
                Needs Review
              </h3>
              <Link to="/admin/vendors" style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#E30613',
                fontWeight: 600
              }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingVendors.map(vendor => (
                <Link
                  key={vendor.id}
                  to={`/admin/vendors/${vendor.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f5f5f5',
                    border: '2px solid #000',
                    textDecoration: 'none',
                    color: '#000'
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      {vendor.business_name}
                    </div>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {vendor.contact_name}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#FFD700',
                    border: '2px solid #000',
                    textTransform: 'uppercase'
                  }}>
                    Review
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Active Vendors */}
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '3px solid #000'
          }}>
            <h3 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              color: '#000',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              Active Vendors
            </h3>
            <Link to="/admin/vendors" style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              color: '#000',
              fontWeight: 600
            }}>
              View All →
            </Link>
          </div>

          {recentVendors.length === 0 ? (
            <p style={{
              fontFamily: "'Sora', sans-serif",
              color: '#666',
              margin: 0
            }}>
              No active vendors yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentVendors.map(vendor => (
                <Link
                  key={vendor.id}
                  to={`/admin/vendors/${vendor.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f5f5f5',
                    border: '2px solid #000',
                    textDecoration: 'none',
                    color: '#000'
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      {vendor.business_name}
                    </div>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {vendor.contact_name}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#d4edda',
                    border: '2px solid #28a745',
                    color: '#28a745',
                    textTransform: 'uppercase'
                  }}>
                    Active
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: '#000',
          border: '4px solid #000',
          padding: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            color: '#FFD700',
            margin: '0 0 20px 0',
            paddingBottom: '16px',
            borderBottom: '3px solid #FFD700',
            textTransform: 'uppercase'
          }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              to="/admin/vendors"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 20px',
                background: '#FFD700',
                color: '#000',
                border: '3px solid #FFD700',
                textDecoration: 'none',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Manage Vendors
            </Link>
            <Link
              to="/admin/payments"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 20px',
                background: 'transparent',
                color: '#fff',
                border: '3px solid #fff',
                textDecoration: 'none',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              View Payments
            </Link>
            <Link
              to="/admin/announcements"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 20px',
                background: 'transparent',
                color: '#fff',
                border: '3px solid #fff',
                textDecoration: 'none',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Announcements
            </Link>
            <Link
              to="/admin/dates"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 20px',
                background: 'transparent',
                color: '#fff',
                border: '3px solid #fff',
                textDecoration: 'none',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Market Dates
            </Link>
            <Link
              to="/admin/maps"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 20px',
                background: 'transparent',
                color: '#fff',
                border: '3px solid #fff',
                textDecoration: 'none',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Market Maps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
