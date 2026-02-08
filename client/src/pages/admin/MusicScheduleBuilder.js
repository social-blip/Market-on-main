import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MusicScheduleBuilder = () => {
  const [dates, setDates] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/music/admin/schedule-builder');
      setDates(response.data.dates);
      setSchedule(response.data.schedule);
      setMusicians(response.data.musicians);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setMessage({ type: 'error', text: 'Failed to load schedule data' });
    } finally {
      setLoading(false);
    }
  };

  const assignMusician = async (date, slot, applicationId) => {
    try {
      await api.post('/music/admin/schedule/assign', {
        performance_date: date,
        time_slot: slot,
        application_id: applicationId || null
      });
      fetchData();
      setMessage({ type: 'success', text: 'Schedule updated' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      console.error('Error assigning musician:', err);
      setMessage({ type: 'error', text: 'Failed to update schedule' });
    }
  };

  const formatDate = (dateStr) => dateStr;

  const getSlotData = (dateStr, slot) => {
    return schedule[dateStr]?.[slot] || null;
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1">Music Schedule Builder</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>Assign musicians to performance slots</p>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {dates.map(d => {
          const slot1 = getSlotData(d.date, 'slot1');
          const slot2 = getSlotData(d.date, 'slot2');
          const dateKey = d.date;

          return (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px',
                background: 'var(--maroon)',
                color: 'white',
                fontWeight: 600
              }}>
                {formatDate(d.date)}
              </div>
              <div style={{ padding: '16px' }}>
                {/* Slot 1: 9-11am */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    9:00 - 11:00 AM
                  </div>
                  <select
                    value={slot1?.application_id || ''}
                    onChange={(e) => assignMusician(dateKey, 'slot1', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: slot1?.application_id ? 'var(--light)' : 'white'
                    }}
                  >
                    <option value="">-- Empty --</option>
                    {musicians.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Slot 2: 11am-1pm */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    11:00 AM - 1:00 PM
                  </div>
                  <select
                    value={slot2?.application_id || ''}
                    onChange={(e) => assignMusician(dateKey, 'slot2', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: slot2?.application_id ? 'var(--light)' : 'white'
                    }}
                  >
                    <option value="">-- Empty --</option>
                    {musicians.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicScheduleBuilder;
