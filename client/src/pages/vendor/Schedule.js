import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const VendorSchedule = () => {
  const [allDates, setAllDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [datesRes, bookingsRes] = await Promise.all([
        api.get('/dates'),
        api.get('/vendors/bookings')
      ]);
      setAllDates(datesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (dateId) => {
    setSelectedIds(prev =>
      prev.includes(dateId)
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    );
  };

  const submitRequest = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.post('/vendors/request-dates', { market_date_ids: selectedIds });
      setSelectedIds([]);
      setMessage(`${res.data.requested} date(s) requested successfully!`);
      // Refresh bookings
      const bookingsRes = await api.get('/vendors/bookings');
      setBookings(bookingsRes.data);
    } catch (err) {
      setMessage('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Only show future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDates = allDates.filter(d => new Date(d.date) >= today);

  // Group by month
  const groupedByMonth = futureDates.reduce((acc, md) => {
    const date = new Date(md.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(md);
    return acc;
  }, {});

  // Build a lookup of booking status by market_date_id
  const bookingMap = {};
  bookings.forEach(b => {
    bookingMap[b.market_date_id] = b;
  });

  if (loading) {
    return (
      <div className="vendor-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="vendor-page__header">
        <h1 className="vendor-page__title">My Schedule</h1>
        <p className="vendor-page__subtitle">
          Your market dates for 2026
        </p>
      </div>

      {message && (
        <div className="vendor-card" style={{ padding: '12px 16px', marginBottom: '16px', background: message.includes('Failed') ? '#fef2f2' : '#f0fdf4', borderRadius: '12px' }}>
          <p style={{ margin: 0, color: message.includes('Failed') ? '#dc2626' : '#16a34a', fontSize: '14px' }}>
            {message}
          </p>
        </div>
      )}

      {futureDates.length === 0 ? (
        <div className="vendor-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="vendor-card__empty" style={{ fontSize: '18px' }}>
            No upcoming market dates available.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: selectedIds.length > 0 ? '80px' : '0' }}>
          {Object.entries(groupedByMonth).map(([month, monthDates]) => (
            <div key={month}>
              <h2 className="vendor-card__title" style={{ marginBottom: '16px', fontSize: '32px' }}>
                {month}
              </h2>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {monthDates.map(md => {
                  const date = new Date(md.date);
                  const day = date.getDate();
                  const booking = bookingMap[md.id];
                  const isSelected = selectedIds.includes(md.id);

                  let badge = null;
                  let clickable = false;

                  if (md.is_cancelled) {
                    badge = <span className="vendor-badge vendor-badge--danger" style={{ marginTop: '10px', display: 'inline-block', fontSize: '12px', padding: '4px 10px' }}>Cancelled</span>;
                  } else if (booking && booking.status === 'confirmed') {
                    badge = <span className="vendor-badge vendor-badge--success" style={{ marginTop: '10px', display: 'inline-block', fontSize: '12px', padding: '4px 10px' }}>Confirmed</span>;
                  } else if (booking && booking.status === 'requested') {
                    badge = <span className="vendor-badge vendor-badge--warning" style={{ marginTop: '10px', display: 'inline-block', fontSize: '12px', padding: '4px 10px' }}>Requested</span>;
                  } else {
                    clickable = true;
                    if (isSelected) {
                      badge = <span className="vendor-badge vendor-badge--success" style={{ marginTop: '10px', display: 'inline-block', fontSize: '12px', padding: '4px 10px' }}>Selected ✓</span>;
                    } else {
                      badge = (
                        <button
                          style={{
                            marginTop: '10px',
                            display: 'inline-block',
                            fontSize: '12px',
                            padding: '4px 10px',
                            background: 'var(--maroon)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Request
                        </button>
                      );
                    }
                  }

                  return (
                    <div
                      key={md.id}
                      onClick={clickable ? () => toggleSelect(md.id) : undefined}
                      style={{
                        padding: '20px 32px',
                        textAlign: 'center',
                        flex: '0 0 auto',
                        minWidth: '140px',
                        background: isSelected ? '#f0fdf4' : 'var(--white)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        cursor: clickable ? 'pointer' : 'default',
                        border: isSelected ? '2px solid #16a34a' : '2px solid transparent'
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '36px',
                        color: 'var(--black)',
                        lineHeight: 1
                      }}>
                        {day}
                      </div>
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky bottom bar */}
      {selectedIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--white)',
          borderTop: '1px solid #e5e7eb',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.08)'
        }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {selectedIds.length} date{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={submitRequest}
            disabled={submitting}
            style={{
              background: 'var(--maroon)',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorSchedule;
