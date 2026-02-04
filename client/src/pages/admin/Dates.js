import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminDates = () => {
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

  const toggleCancelled = async (date) => {
    try {
      await api.put(`/dates/${date.id}`, { is_cancelled: !date.is_cancelled });
      fetchDates();
    } catch (err) {
      console.error('Error updating date:', err);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDates = dates.filter(d => new Date(d.date) >= today && !d.is_cancelled);
  const pastDates = dates.filter(d => new Date(d.date) < today && !d.is_cancelled);
  const cancelledDates = dates.filter(d => d.is_cancelled);

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
          Market Dates
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          2026 Season • {dates.length} Saturdays
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#FFD700',
          border: '4px solid #000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {upcomingDates.length}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Upcoming
          </div>
        </div>
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {pastDates.length}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Completed
          </div>
        </div>
        {cancelledDates.length > 0 && (
          <div style={{
            background: '#fff',
            border: '4px solid #E30613',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '36px',
              color: '#E30613'
            }}>
              {cancelledDates.length}
            </div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              color: '#E30613',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Cancelled
            </div>
          </div>
        )}
      </div>

      {/* Dates Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {dates.map((date, index) => {
          const dateObj = new Date(date.date);
          const isPast = dateObj < today;
          const isCancelled = date.is_cancelled;

          return (
            <div
              key={date.id}
              style={{
                background: isCancelled ? '#f5f5f5' : isPast ? '#fff' : '#fff',
                border: isCancelled ? '4px solid #E30613' : '4px solid #000',
                opacity: isCancelled ? 0.7 : 1,
                overflow: 'hidden'
              }}
            >
              {/* Date Header */}
              <div style={{
                background: isCancelled ? '#E30613' : isPast ? '#666' : '#FFD700',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '14px',
                    color: isCancelled || isPast ? '#fff' : '#000',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '24px',
                    color: isCancelled || isPast ? '#fff' : '#000'
                  }}>
                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '32px',
                  color: isCancelled || isPast ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
                }}>
                  #{index + 1}
                </div>
              </div>

              {/* Date Content */}
              <div style={{ padding: '20px' }}>
                {/* Time */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '16px' }}>🕐</span>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '14px',
                    color: '#000'
                  }}>
                    {date.start_time?.slice(0, 5)} - {date.end_time?.slice(0, 5)}
                  </span>
                </div>

                {/* Vendor Count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '14px',
                    color: '#000'
                  }}>
                    <strong>{date.vendor_count || 0}</strong> vendors booked
                  </span>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '16px' }}>
                  {isCancelled ? (
                    <span style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '6px 12px',
                      background: '#f8d7da',
                      color: '#E30613',
                      border: '2px solid #E30613',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      Cancelled
                    </span>
                  ) : isPast ? (
                    <span style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '6px 12px',
                      background: '#e9ecef',
                      color: '#666',
                      border: '2px solid #666',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      Completed
                    </span>
                  ) : (
                    <span style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '6px 12px',
                      background: '#d4edda',
                      color: '#28a745',
                      border: '2px solid #28a745',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      Scheduled
                    </span>
                  )}
                </div>

                {/* Notes */}
                {date.notes && (
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '13px',
                    color: '#666',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderLeft: '3px solid #FFD700'
                  }}>
                    {date.notes}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => toggleCancelled(date)}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '10px 20px',
                    width: '100%',
                    background: isCancelled ? '#fff' : '#fff',
                    color: isCancelled ? '#28a745' : '#E30613',
                    border: isCancelled ? '3px solid #28a745' : '3px solid #E30613',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {isCancelled ? 'Restore Date' : 'Cancel Date'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDates;
