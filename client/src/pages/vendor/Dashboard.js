import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
      setAnnouncements(announcementsRes.data);
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

  const unreadCount = announcements.filter(a => !a.is_read).length;

  const handleAnnouncementClick = async (announcement) => {
    setSelectedAnnouncement(announcement);

    if (!announcement.is_read) {
      try {
        await api.post(`/vendors/announcements/${announcement.id}/read`);
        setAnnouncements(prev =>
          prev.map(a => a.id === announcement.id ? { ...a, is_read: true } : a)
        );
      } catch (err) {
        console.error('Error marking announcement as read:', err);
      }
    }
  };

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date() && !b.is_cancelled);

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
      <div className="vendor-dashboard__header">
        <h1 className="vendor-dashboard__title">
          Welcome back, {user?.contact_name || user?.contactName}!
        </h1>
        <p className="vendor-dashboard__subtitle">
          {user?.business_name || user?.businessName}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="vendor-dashboard__grid">
        {/* Upcoming Markets */}
        <div className="vendor-card">
          <div className="vendor-card__header">
            <h3 className="vendor-card__title">Upcoming Markets</h3>
            <Link to="/vendor/schedule" className="vendor-card__link">
              View All
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <p className="vendor-card__empty">
              No upcoming markets scheduled.
            </p>
          ) : (
            <div>
              {upcomingBookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="vendor-booking">
                  <div className="vendor-booking__date">
                    {formatDate(booking.date)}
                  </div>
                  <span className={`vendor-booking__status vendor-booking__status--${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="vendor-card">
          <div className="vendor-card__header">
            <h3 className="vendor-card__title">
              Announcements
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: 'var(--maroon)',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600
                }}>
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>

          {announcements.length === 0 ? (
            <p className="vendor-card__empty">
              No announcements yet.
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
              {announcements.map(announcement => (
                <div
                  key={announcement.id}
                  className="vendor-announcement"
                  onClick={() => handleAnnouncementClick(announcement)}
                  style={{
                    cursor: 'pointer',
                    borderLeft: !announcement.is_read ? '3px solid var(--maroon)' : '3px solid transparent',
                    paddingLeft: '12px'
                  }}
                >
                  <h4 className="vendor-announcement__title" style={{ fontWeight: !announcement.is_read ? 700 : 600 }}>
                    {announcement.title}
                  </h4>
                  <div className="vendor-announcement__date">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </div>
                  <p className="vendor-announcement__content">
                    {announcement.content.length > 140
                      ? announcement.content.substring(0, 140) + '...'
                      : announcement.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Lightbox */}
      {selectedAnnouncement && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{selectedAnnouncement.title}</h2>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--gray)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '16px' }}>
              {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {selectedAnnouncement.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
