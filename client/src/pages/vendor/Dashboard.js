import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, announcementsRes] = await Promise.all([
        api.get('/vendors/bookings'),
        api.get('/vendors/announcements')
      ]);

      setBookings(bookingsRes.data);
      setAnnouncements(announcementsRes.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date() && !b.is_cancelled);

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
          margin: '0 0 8px 0'
        }}>
          Welcome back, {user?.contact_name || user?.contactName}!
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          {user?.business_name || user?.businessName}
        </p>
      </div>

      {/* Two Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px'
      }}>
        {/* Upcoming Markets */}
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
              Upcoming Markets
            </h3>
            <Link
              to="/vendor/schedule"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#000',
                textDecoration: 'none',
                borderBottom: '2px solid #000'
              }}
            >
              View All
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <p style={{
              fontFamily: "'Sora', sans-serif",
              color: '#666',
              margin: 0
            }}>
              No upcoming markets scheduled.
            </p>
          ) : (
            <div>
              {upcomingBookings.slice(0, 5).map(booking => (
                <div
                  key={booking.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '2px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#000'
                  }}>
                    {formatDate(booking.date)}
                  </div>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: booking.status === 'confirmed' ? '#FFD700' : '#fff',
                    color: '#000',
                    border: '3px solid #000',
                    textTransform: 'uppercase'
                  }}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            color: '#000',
            margin: '0 0 20px 0',
            paddingBottom: '16px',
            borderBottom: '3px solid #000',
            textTransform: 'uppercase'
          }}>
            Latest Announcements
          </h3>

          {announcements.length === 0 ? (
            <p style={{
              fontFamily: "'Sora', sans-serif",
              color: '#666',
              margin: 0
            }}>
              No announcements yet.
            </p>
          ) : (
            <div>
              {announcements.map(announcement => (
                <div
                  key={announcement.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '2px solid #eee'
                  }}
                >
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#000',
                    marginBottom: '4px'
                  }}>
                    {announcement.title}
                  </div>
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '8px'
                  }}>
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </div>
                  <p style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '14px',
                    color: '#666',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {announcement.content.length > 100
                      ? announcement.content.substring(0, 100) + '...'
                      : announcement.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
