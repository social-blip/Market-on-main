import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const Calendar = () => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    try {
      const response = await api.get('/dates');
      setDates(response.data);
    } catch (err) {
      console.error('Error fetching dates:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate()
    };
  };

  const isUpcoming = (dateStr) => {
    return new Date(dateStr) >= new Date();
  };

  const getNextMarket = () => {
    return dates.find(d => isUpcoming(d.date) && !d.is_cancelled);
  };

  if (loading) {
    return (
      <div className="brutal-section brutal-section-yellow" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="brutal-heading" style={{ fontSize: '36px' }}>Loading...</div>
      </div>
    );
  }

  const nextMarket = getNextMarket();

  return (
    <div>
      {/* ===== CALENDAR GRID (Blue) ===== */}
      <section className="brutal-section brutal-section-blue">
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {dates.map((date) => {
            const upcoming = isUpcoming(date.date);

            return (
              <div
                key={date.id}
                className="brutal-card"
                style={{
                  opacity: upcoming ? 1 : 0.6
                }}
              >
                <div className="brutal-card-content" style={{ padding: '24px', textAlign: 'center' }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: '800',
                    fontSize: '24px',
                    marginBottom: '8px',
                    color: '#000'
                  }}>
                    {formatDate(date.date)}
                  </h3>
                  <p style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '16px',
                    color: '#666',
                    margin: '0 0 16px 0'
                  }}>
                    9:00 AM - 2:00 PM
                  </p>
                  <Link
                    to={`/vendors?date=${date.date}`}
                    className="brutal-btn"
                    style={{
                      background: '#FFD700',
                      color: '#000',
                      padding: '10px 20px',
                      fontSize: '14px',
                      border: '3px solid #000'
                    }}
                  >
                    See Vendors
                  </Link>
                  {date.is_cancelled && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      background: '#E30613',
                      color: '#fff',
                      padding: '6px 16px',
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: '700',
                      fontSize: '12px',
                      textTransform: 'uppercase'
                    }}>
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Black Bar Divider */}
      <div className="brutal-line"></div>

      {/* ===== CTA SECTION (Red) ===== */}
      <section className="brutal-section brutal-section-red" style={{ textAlign: 'center' }}>
        <h2 className="brutal-section-heading brutal-section-heading-white" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: '20px' }}>
          See Who's Coming
        </h2>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '24px',
          color: 'var(--brutal-white)',
          marginBottom: '30px',
          maxWidth: '600px',
          margin: '0 auto 30px'
        }}>
          Browse all the local makers, growers, and food vendors joining us this season.
        </p>
        <Link to="/vendors" className="brutal-btn brutal-btn-yellow">
          View Our Vendors
        </Link>
      </section>

      {/* ===== MARKET INFO STRIP ===== */}
      <div style={{
        background: '#000',
        color: '#FFD700',
        padding: '20px 0',
        textAlign: 'center',
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '18px',
        fontWeight: '800',
        letterSpacing: '2px'
      }}>
        EVERY SATURDAY • JUNE - AUGUST • 9AM - 2PM • 100 BLOCK MAIN AVE N
      </div>
    </div>
  );
};

export default Calendar;
