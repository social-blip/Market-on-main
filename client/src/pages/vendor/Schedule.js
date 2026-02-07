import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const VendorSchedule = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/vendors/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (dateStr) => new Date(dateStr) >= new Date();

  // Group bookings by month
  const groupedByMonth = bookings.reduce((acc, booking) => {
    const date = new Date(booking.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(booking);
    return acc;
  }, {});

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
          Your confirmed market dates for 2026
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="vendor-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="vendor-card__empty" style={{ fontSize: '18px' }}>
            No market dates scheduled yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedByMonth).map(([month, monthBookings]) => (
            <div key={month}>
              {/* Month Header */}
              <h2 className="vendor-card__title" style={{ marginBottom: '16px', fontSize: '24px' }}>
                {month}
              </h2>

              {/* Date Boxes */}
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                {monthBookings.map(booking => {
                  const date = new Date(booking.date);
                  const day = date.getDate();
                  const upcoming = isUpcoming(booking.date);

                  let statusClass = 'vendor-badge--neutral';
                  let statusLabel = booking.status;

                  if (booking.is_cancelled) {
                    statusClass = 'vendor-badge--danger';
                    statusLabel = 'Cancelled';
                  } else if (booking.status === 'confirmed') {
                    statusClass = 'vendor-badge--success';
                  } else if (booking.status === 'pending' || booking.status === 'requested') {
                    statusClass = 'vendor-badge--warning';
                  }

                  return (
                    <div
                      key={booking.id}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'center',
                        opacity: upcoming ? 1 : 0.5,
                        flex: 1,
                        background: 'var(--white)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '18px',
                        color: 'var(--black)',
                        lineHeight: 1
                      }}>
                        {day}
                      </div>
                      <span
                        className={`vendor-badge ${statusClass}`}
                        style={{ marginTop: '6px', display: 'inline-block', fontSize: '9px', padding: '3px 6px' }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorSchedule;
