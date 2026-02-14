import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PLATFORMS = ['Social', 'Email', 'Other'];

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
  const [form, setForm] = useState({ platform: 'Social', posted_at: new Date().toISOString().split('T')[0], notes: '' });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [bulkForm, setBulkForm] = useState({ platform: 'Social', posted_at: new Date().toISOString().split('T')[0], notes: '' });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

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
      setForm({ platform: 'Social', posted_at: new Date().toISOString().split('T')[0], notes: '' });
      const res = await api.get('/admin/vendor-shoutouts');
      setShoutouts(res.data);
    } catch (err) {
      console.error('Error adding shoutout:', err);
    }
  };

  const handleBulkSubmit = async () => {
    if (bulkSelected.size === 0) return;
    setBulkSubmitting(true);
    try {
      for (const vendorId of bulkSelected) {
        await api.post('/admin/vendor-shoutouts', {
          vendor_id: vendorId,
          platform: bulkForm.platform,
          posted_at: bulkForm.posted_at,
          notes: bulkForm.notes || null
        });
      }
      setBulkMode(false);
      setBulkSelected(new Set());
      setBulkForm({ platform: 'Social', posted_at: new Date().toISOString().split('T')[0], notes: '' });
      const res = await api.get('/admin/vendor-shoutouts');
      setShoutouts(res.data);
    } catch (err) {
      console.error('Error bulk adding shoutouts:', err);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const toggleBulkVendor = (vendorId) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
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
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
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
          {tab === 'vendors' && (
            <button
              onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()); }}
              className={bulkMode ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '13px', padding: '8px 14px', marginLeft: 'auto' }}
            >
              {bulkMode ? 'Cancel Bulk' : 'Bulk Add'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk form */}
      {bulkMode && (
        <div className="card mb-3">
          <div style={{ marginBottom: '12px', fontWeight: 600 }}>{bulkSelected.size} vendor{bulkSelected.size !== 1 ? 's' : ''} selected</div>
          <div className="flex gap-1" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Platform</label>
              <select
                value={bulkForm.platform}
                onChange={e => setBulkForm({ ...bulkForm, platform: e.target.value })}
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
                value={bulkForm.posted_at}
                onChange={e => setBulkForm({ ...bulkForm, posted_at: e.target.value })}
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
              <input
                type="text"
                value={bulkForm.notes}
                onChange={e => setBulkForm({ ...bulkForm, notes: e.target.value })}
                placeholder="e.g. Weekly newsletter, IG carousel..."
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
              />
            </div>
            <button
              onClick={handleBulkSubmit}
              disabled={bulkSelected.size === 0 || bulkSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '6px 14px', opacity: bulkSelected.size === 0 ? 0.5 : 1 }}
            >
              {bulkSubmitting ? 'Saving...' : `Add for ${bulkSelected.size} Vendor${bulkSelected.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {tab === 'vendors' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                {bulkMode && <th style={{ width: '40px' }}></th>}
                <th>Vendor</th>
                <th>Category</th>
                <th>Last Shoutout</th>
                <th>Total</th>
                {!bulkMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {vendorStats.map(v => (
                <React.Fragment key={v.id}>
                  <tr
                    style={{
                      background: bulkMode && bulkSelected.has(v.id) ? 'rgba(92, 30, 61, 0.06)' : v.shoutoutCount === 0 ? 'rgba(255, 193, 7, 0.08)' : undefined,
                      cursor: bulkMode ? 'pointer' : undefined
                    }}
                    onClick={bulkMode ? () => toggleBulkVendor(v.id) : undefined}
                  >
                    {bulkMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={bulkSelected.has(v.id)}
                          onChange={() => toggleBulkVendor(v.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width: '16px', height: '16px' }}
                        />
                      </td>
                    )}
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
                    {!bulkMode && (
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
                    )}
                  </tr>
                  {!bulkMode && addingFor === v.id && (
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
