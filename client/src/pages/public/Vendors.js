import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const CATEGORIES = {
  all: { label: 'All Vendors', filter: null },
  growers: { label: 'Growers', filter: 'growers' },
  makers: { label: 'Makers', filter: 'makers' },
  eats: { label: 'Eats', filter: 'eats' },
  vintage: { label: 'Vintage & Finds', filter: 'vintage' }
};

const CATEGORY_DISPLAY = {
  growers: 'GROWERS',
  makers: 'MAKERS',
  eats: 'EATS',
  vintage: 'VINTAGE'
};

const Vendors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const dateFilter = searchParams.get('date');

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      const [vendorsRes, datesRes] = await Promise.all([
        dateFilter
          ? api.get(`/vendors/public?date=${dateFilter}`)
          : api.get('/vendors/public'),
        api.get('/dates')
      ]);
      setVendors(vendorsRes.data);
      setDates(datesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ date: value });
    } else {
      setSearchParams({});
    }
  };

  const formatDateDisplay = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredVendors = filter === 'all'
    ? vendors
    : vendors.filter(v => v.category === CATEGORIES[filter].filter);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f0'
      }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section style={{
        background: '#FFD700',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(60px, 14vw, 160px)',
          color: '#000',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '0.08em'
        }}>
          Vendors and Calendar
        </h1>
      </section>

      {/* Filter Bar */}
      <section style={{
        background: '#f5f5f0',
        padding: '30px 20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Category Filters */}
          <div className="category-filters">
            {Object.entries(CATEGORIES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`category-btn ${filter === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter || ''}
            onChange={handleDateChange}
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              padding: '12px 20px',
              background: dateFilter ? '#E30613' : '#fff',
              color: dateFilter ? '#fff' : '#000',
              border: '4px solid #000',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              minWidth: '200px'
            }}
          >
            <option value="">All Dates</option>
            {dates.map(date => (
              <option key={date.id} value={date.date}>
                {formatDateDisplay(date.date)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 2026 Lineup Message */}
      <section style={{
        background: '#f5f5f0',
        padding: '24px 20px',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '16px',
          color: '#333',
          margin: 0,
          maxWidth: '700px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          This is just a preview of our 2026 lineup — more vendors will be added as we get closer to the season. Check back often to see who's joining us!{' '}
          Want to sell at the market? <Link to="/become-vendor" style={{ color: '#0056b3', fontWeight: 600 }}>Apply to become a vendor</Link>.
        </p>
      </section>

      {/* Vendor Grid */}
      <section style={{
        background: '#f5f5f0',
        padding: '60px 20px',
        minHeight: '50vh'
      }}>
        {filteredVendors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '24px',
              color: '#333'
            }}>
              {vendors.length === 0
                ? 'Vendor lineup coming soon! Check back in April 2026.'
                : 'No vendors in this category yet.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {filteredVendors.map(vendor => (
              <Link
                key={vendor.id}
                to={`/vendors/${vendor.id}`}
                style={{
                  background: '#fff',
                  border: '4px solid #000',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    e.currentTarget.style.transform = 'translate(-4px, -4px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px #000';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Vendor image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #a8d000 100%)',
                  borderBottom: '4px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {vendor.image_url ? (
                    <img
                      src={`${API_URL}${vendor.image_url}`}
                      alt={vendor.business_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 800,
                      fontSize: '48px',
                      color: 'rgba(0,0,0,0.2)'
                    }}>
                      {vendor.business_name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1
                }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '24px',
                    color: '#000',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase'
                  }}>
                    {vendor.business_name}
                  </h3>

                  <p style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '16px',
                    color: '#333',
                    lineHeight: 1.5,
                    margin: '0',
                    flexGrow: 1
                  }}>
                    {vendor.description
                      ? (vendor.description.length > 80
                          ? vendor.description.substring(0, 80) + '...'
                          : vendor.description)
                      : 'Local vendor at Market on Main.'}
                  </p>

                  {/* Category Tag and Next Date */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: '12px',
                      padding: '6px 12px',
                      background: '#FFD700',
                      color: '#000',
                      border: '3px solid #000',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {CATEGORY_DISPLAY[vendor.category] || 'VENDOR'}
                    </span>
                    {vendor.next_date && (
                      <span style={{
                        display: 'inline-block',
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '6px 12px',
                        background: '#000',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Next: {new Date(vendor.next_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Become a Vendor CTA */}
      <section style={{
        background: '#FFD700',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <Link
          to="/apply"
          style={{
            display: 'inline-block',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(24px, 4vw, 40px)',
            color: '#000',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Become a Vendor: Apply Now
        </Link>
      </section>
    </div>
  );
};

export default Vendors;
