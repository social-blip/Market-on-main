import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok'];

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d)) return '--';
  return d.toLocaleDateString('en-US', { timeZone: 'UTC' });
};

const VendorShoutouts = () => {
  const [vendors, setVendors] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vendors');
  const [addingFor, setAddingFor] = useState(null);
  const [form, setForm] = useState({ platform: 'Instagram', posted_at: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsRes, shoutoutsRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/admin/vendor-shoutouts')
      ]);
      setVendors(vendorsRes.data.filter(v => v.is_approved || v.is_active));
      setShoutouts(shoutoutsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (vendorId) => {
    try {
      await api.post('/admin/vendor-shoutouts', {
        vendor_id: vendorId,
        platform: form.platform,
        posted_at: form.posted_at,
        notes: form.notes || null
      });
      setAddingFor(null);
      setForm({ platform: 'Instagram', posted_at: new Date().toISOString().split('T')[0], notes: '' });
      const res = await api.get('/admin/vendor-shoutouts');
      setShoutouts(res.data);
    } catch (err) {
      console.error('Error adding shoutout:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/vendor-shoutouts/${id}`);
      setShoutouts(shoutouts.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting shoutout:', err);
    }
  };

  // Build vendor stats from shoutouts
  const vendorStats = vendors.map(v => {
    const vendorShoutouts = shoutouts.filter(s => s.vendor_id === v.id);
    const lastShoutout = vendorShoutouts.length > 0 ? vendorShoutouts[0].posted_at : null;
    return { ...v, shoutoutCount: vendorShoutouts.length, lastShoutout };
  }).sort((a, b) => a.shoutoutCount - b.shoutoutCount);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1">Vendor Shoutouts</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>Track social media features for vendors</p>

      {/* Tabs */}
      <div className="card mb-3">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('vendors')}
            className={tab === 'vendors' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            Vendors ({vendorStats.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={tab === 'history' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            History ({shoutouts.length})
          </button>
        </div>
      </div>

      {tab === 'vendors' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Last Shoutout</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendorStats.map(v => (
                <React.Fragment key={v.id}>
                  <tr style={v.shoutoutCount === 0 ? { background: 'rgba(255, 193, 7, 0.08)' } : {}}>
                    <td style={{ fontWeight: 600 }}>{v.business_name}</td>
                    <td>
                      <span className="badge">{v.category || '--'}</span>
                    </td>
                    <td style={{ fontSize: '13px', color: v.lastShoutout ? 'var(--gray-dark)' : 'var(--maroon)' }}>
                      {v.lastShoutout
                        ? formatDate(v.lastShoutout)
                        : 'Never'}
                    </td>
                    <td style={{ fontSize: '13px' }}>{v.shoutoutCount}</td>
                    <td>
                      {addingFor === v.id ? (
                        <button
                          onClick={() => setAddingFor(null)}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => setAddingFor(v.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          + Add
                        </button>
                      )}
                    </td>
                  </tr>
                  {addingFor === v.id && (
                    <tr>
                      <td colSpan="5" style={{ background: 'var(--cream)', padding: '16px' }}>
                        <div className="flex gap-1" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Platform</label>
                            <select
                              value={form.platform}
                              onChange={e => setForm({ ...form, platform: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '13px', padding: '6px 10px' }}
                            >
                              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Date</label>
                            <input
                              type="date"
                              value={form.posted_at}
                              onChange={e => setForm({ ...form, posted_at: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '13px', padding: '6px 10px' }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
                            <input
                              type="text"
                              value={form.notes}
                              onChange={e => setForm({ ...form, notes: e.target.value })}
                              placeholder="e.g. Reel, Story, Collab post..."
                              className="form-control"
                              style={{ fontSize: '13px', padding: '6px 10px' }}
                            />
                          </div>
                          <button
                            onClick={() => handleAdd(v.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '13px', padding: '6px 14px' }}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Platform</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shoutouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                    No shoutouts yet.
                  </td>
                </tr>
              ) : (
                shoutouts.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(s.posted_at)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.business_name}</td>
                    <td>
                      <span className="badge">{s.platform}</span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--gray-dark)' }}>{s.notes || '--'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--maroon)' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorShoutouts;
