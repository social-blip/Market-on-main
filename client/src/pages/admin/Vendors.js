import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    // Apply status filter
    if (filter === 'active' && !v.is_active) return false;
    if (filter === 'pending' && (v.is_active || v.application_status !== 'pending')) return false;
    if (filter === 'inactive' && (v.is_active || v.application_status === 'pending')) return false;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        v.business_name?.toLowerCase().includes(search) ||
        v.contact_name?.toLowerCase().includes(search) ||
        v.email?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const activeCount = vendors.filter(v => v.is_active).length;
  const pendingCount = vendors.filter(v => v.application_status === 'pending' || (!v.is_active && !v.is_approved)).length;
  const inactiveCount = vendors.filter(v => !v.is_active && v.application_status !== 'pending' && v.is_approved).length;

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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: '#000',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          Vendors
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          {vendors.length} total vendors
        </p>
      </div>

      {/* Filters & Search */}
      <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All', count: vendors.length },
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'inactive', label: 'Inactive', count: inactiveCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '10px 16px',
                  background: filter === key ? '#FFD700' : '#fff',
                  color: '#000',
                  border: filter === key ? '3px solid #000' : '2px solid #000',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              padding: '10px 16px',
              border: '3px solid #000',
              minWidth: '200px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Vendors List */}
      <div style={{
        background: '#fff',
        border: '4px solid #000'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px',
          gap: '16px',
          padding: '16px 20px',
          background: '#000',
          color: '#fff'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Business</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Contact</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Booth</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Markets</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Status</div>
          <div></div>
        </div>

        {/* Vendor Rows */}
        {filteredVendors.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: "'Sora', sans-serif",
            color: '#666'
          }}>
            No vendors found.
          </div>
        ) : (
          filteredVendors.map((vendor, index) => (
            <div
              key={vendor.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px',
                gap: '16px',
                padding: '16px 20px',
                alignItems: 'center',
                borderBottom: index < filteredVendors.length - 1 ? '2px solid #eee' : 'none',
                background: vendor.application_status === 'pending' ? '#fff9e6' : '#fff'
              }}
            >
              {/* Business */}
              <div>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#000'
                }}>
                  {vendor.business_name}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {vendor.is_nonprofit && (
                    <span style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      border: '1px solid #1976d2',
                      textTransform: 'uppercase'
                    }}>
                      Nonprofit
                    </span>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '14px',
                  color: '#000'
                }}>
                  {vendor.contact_name}
                </div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {vendor.email}
                </div>
              </div>

              {/* Booth */}
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px'
              }}>
                {vendor.booth_size === 'double' ? '20×10' : '10×10'}
                {vendor.needs_power && (
                  <span style={{ marginLeft: '4px' }} title="Needs Power">⚡</span>
                )}
              </div>

              {/* Markets */}
              <div style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: '#000'
              }}>
                {vendor.booking_count || 0}
              </div>

              {/* Status */}
              <div>
                {vendor.application_status === 'pending' || (!vendor.is_active && !vendor.is_approved) ? (
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#FFD700',
                    color: '#000',
                    border: '2px solid #000',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}>
                    Pending
                  </span>
                ) : vendor.is_active ? (
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#d4edda',
                    color: '#28a745',
                    border: '2px solid #28a745',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}>
                    Active
                  </span>
                ) : (
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#f8d7da',
                    color: '#E30613',
                    border: '2px solid #E30613',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}>
                    Inactive
                  </span>
                )}
              </div>

              {/* Action */}
              <div>
                <Link
                  to={`/admin/vendors/${vendor.id}`}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '8px 16px',
                    background: vendor.application_status === 'pending' ? '#FFD700' : '#fff',
                    color: '#000',
                    border: '2px solid #000',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}
                >
                  {vendor.application_status === 'pending' ? 'Review' : 'View'}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Card View (hidden on desktop, shown on mobile) */}
      <style>{`
        @media (max-width: 768px) {
          .vendor-table-header,
          .vendor-table-row {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminVendors;
