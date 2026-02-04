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
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: '#000',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          My Schedule
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          Your confirmed market dates for 2026
        </p>
      </div>

      {bookings.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '40px',
          textAlign: 'center'
        }}>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            color: '#666',
            margin: 0,
            fontSize: '18px'
          }}>
            No market dates scheduled yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedByMonth).map(([month, monthBookings]) => (
            <div key={month}>
              {/* Month Header */}
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '24px',
                color: '#000',
                margin: '0 0 16px 0',
                textTransform: 'uppercase'
              }}>
                {month}
              </h2>

              {/* Date Boxes */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {monthBookings.map(booking => {
                  const date = new Date(booking.date);
                  const day = date.getDate();
                  const upcoming = isUpcoming(booking.date);

                  // Determine background color based on status
                  let bgColor = '#fff';
                  let textColor = '#000';
                  let statusLabel = booking.status;

                  if (booking.is_cancelled) {
                    bgColor = '#E30613';
                    textColor = '#fff';
                    statusLabel = 'Cancelled';
                  } else if (booking.status === 'confirmed') {
                    bgColor = '#FFD700';
                  } else if (booking.status === 'pending' || booking.status === 'requested') {
                    bgColor = '#fff';
                  }

                  return (
                    <div
                      key={booking.id}
                      style={{
                        background: bgColor,
                        border: '4px solid #000',
                        padding: '16px 20px',
                        textAlign: 'center',
                        minWidth: '80px',
                        opacity: upcoming ? 1 : 0.5
                      }}
                    >
                      <div style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 800,
                        fontSize: '32px',
                        color: textColor,
                        lineHeight: 1
                      }}>
                        {day}
                      </div>
                      <div style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: '10px',
                        color: textColor,
                        textTransform: 'uppercase',
                        marginTop: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {statusLabel}
                      </div>
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
