import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const upcomingDates = dates.filter(d => !d.is_cancelled);
  const pastDates = [];
  const cancelledDates = dates.filter(d => d.is_cancelled);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2">Market Dates</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>2026 Season · {dates.length} Saturdays</p>

      {/* Stats */}
      <div className="grid grid-3 mb-4" style={{ gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--maroon)' }}>{upcomingDates.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Upcoming</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700 }}>{pastDates.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Completed</div>
        </div>
        {cancelledDates.length > 0 && (
          <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--danger)' }}>{cancelledDates.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--danger)', textTransform: 'uppercase' }}>Cancelled</div>
          </div>
        )}
      </div>

      {/* Dates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {dates.map((date, index) => {
          const isCancelled = date.is_cancelled;

          return (
            <div key={date.id} className="card" style={{
              padding: 0,
              overflow: 'hidden',
              opacity: isCancelled ? 0.6 : 1,
              borderColor: isCancelled ? 'var(--danger)' : undefined
            }}>
              {/* Header */}
              <Link
                to={`/admin/maps/builder/${date.id}`}
                style={{
                  display: 'flex',
                  padding: '16px',
                  background: isCancelled ? 'var(--danger)' : 'var(--maroon)',
                  color: 'white',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>
                    Saturday
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>
                    {date.date}
                  </div>
                </div>
                <div style={{ fontSize: '24px', opacity: 0.3, fontWeight: 700 }}>#{index + 1}</div>
              </Link>

              {/* Body */}
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                  <strong>{date.vendor_count || 0}</strong> vendors booked
                </div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                  <strong>{date.spots_used || 0}</strong> spots filled
                </div>
                <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <strong>{(date.total_spots || 54) - (date.spots_used || 0)}</strong> open spots
                </div>

                {isCancelled && (
                  <span className="badge badge-danger">Cancelled</span>
                )}

                {date.notes && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'var(--light)', borderRadius: '4px', fontSize: '13px', fontStyle: 'italic', color: 'var(--gray)' }}>
                    {date.notes}
                  </div>
                )}

                <button
                  onClick={() => toggleCancelled(date)}
                  className={isCancelled ? 'btn btn-primary' : 'btn btn-danger'}
                  style={{ width: '100%', marginTop: '16px', fontSize: '12px' }}
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
