import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { value: 'growers', label: 'Growers' },
  { value: 'makers', label: 'Makers' },
  { value: 'eats', label: 'Eats' },
  { value: 'finds', label: 'Finds' }
];

const MARKET_DATE_LABELS = [
  'June 6', 'June 13', 'June 20', 'June 27',
  'July 4', 'July 11', 'July 18', 'July 25',
  'August 1', 'August 8'
];

const PRICING = {
  single: { 10: 500, 6: 350, 3: 195 },
  double: { 10: 750, 6: 550, 3: 290 }
};
const POWER_FEE = 15;

const AdminVendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loginAsVendor } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allDates, setAllDates] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalDates, setApprovalDates] = useState([]);
  const [alternateDateSet, setAlternateDateSet] = useState(new Set());
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTab, setInvoiceTab] = useState('pricelist');
  const [invoiceForm, setInvoiceForm] = useState({
    booth_size: 'single',
    markets: '10',
    power: false,
    manual_amount: '',
    manual_description: '',
    manual_due_date: ''
  });
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [memo, setMemo] = useState('');
  const [reviewDecisions, setReviewDecisions] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editingApp, setEditingApp] = useState(false);
  const [appEditData, setAppEditData] = useState({});
  const [shoutouts, setShoutouts] = useState([]);
  const [showShoutoutForm, setShowShoutoutForm] = useState(false);
  const [shoutoutForm, setShoutoutForm] = useState({ platform: 'Instagram', posted_at: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    fetchVendor();
    fetchAllDates();
    fetchShoutouts();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await api.get(`/admin/vendors/${id}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDates = async () => {
    try {
      const response = await api.get('/dates/');
      setAllDates(response.data);
    } catch (err) {
      console.error('Error fetching dates:', err);
    }
  };

  const fetchShoutouts = async () => {
    try {
      const response = await api.get('/admin/vendor-shoutouts');
      setShoutouts(response.data.filter(s => s.vendor_id === parseInt(id)));
    } catch (err) {
      console.error('Error fetching shoutouts:', err);
    }
  };

  const addShoutout = async () => {
    try {
      await api.post('/admin/vendor-shoutouts', {
        vendor_id: parseInt(id),
        platform: shoutoutForm.platform,
        posted_at: shoutoutForm.posted_at,
        notes: shoutoutForm.notes || null
      });
      setShowShoutoutForm(false);
      setShoutoutForm({ platform: 'Instagram', posted_at: new Date().toISOString().split('T')[0], notes: '' });
      fetchShoutouts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add shoutout.' });
    }
  };

  const deleteShoutout = async (shoutoutId) => {
    try {
      await api.delete(`/admin/vendor-shoutouts/${shoutoutId}`);
      setShoutouts(shoutouts.filter(s => s.id !== shoutoutId));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete shoutout.' });
    }
  };

  const toggleActive = async () => {
    if (!data.vendor.is_active) {
      // Opening approval modal instead of immediately approving
      const requestedDates = parseRequestedDates(data.vendor.requested_dates);
      const altDates = parseRequestedDates(data.vendor.alternate_dates);
      setApprovalDates([...requestedDates, ...altDates]);
      setAlternateDateSet(new Set(altDates));
      setShowApproveModal(true);
    } else {
      // Deactivating - remove all bookings first
      try {
        for (const booking of data.bookings) {
          await api.delete(`/admin/bookings/${booking.id}`);
        }
        await api.put(`/admin/vendors/${id}`, { is_active: false });
        fetchVendor();
        setMessage({ type: 'success', text: 'Vendor deactivated.' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to update vendor status.' });
      }
    }
  };

  const confirmApproval = async () => {
    try {
      await api.post(`/admin/vendors/${id}/approve`, { requested_dates: approvalDates });
      setShowApproveModal(false);
      fetchVendor();
      setMessage({ type: 'success', text: 'Vendor approved! Invoice created and welcome email sent.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to approve vendor.' });
    }
  };

  const toggleApprovalDate = (dateStr) => {
    setApprovalDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const toggleBooking = async (marketDate) => {
    const existing = data.bookings.find(b => b.market_date_id === marketDate.id);
    try {
      if (existing) {
        await api.delete(`/admin/bookings/${existing.id}`);
      } else {
        await api.post('/admin/bookings', {
          vendor_id: parseInt(id),
          market_date_id: marketDate.id,
          status: 'confirmed'
        });
      }
      fetchVendor();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update booking.' });
    }
  };

  const submitReview = async () => {
    const approve_ids = Object.entries(reviewDecisions).filter(([, v]) => v === 'approve').map(([k]) => parseInt(k));
    const deny_ids = Object.entries(reviewDecisions).filter(([, v]) => v === 'deny').map(([k]) => parseInt(k));

    if (approve_ids.length === 0 && deny_ids.length === 0) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/admin/bookings/review', { approve_ids, deny_ids });
      setReviewDecisions({});
      fetchVendor();
      const parts = [];
      if (res.data.approved > 0) parts.push(`${res.data.approved} approved`);
      if (res.data.denied > 0) parts.push(`${res.data.denied} denied`);
      setMessage({ type: 'success', text: `${parts.join(', ')}. Vendor notified by email.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit review.' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const parseRequestedDates = (raw) => {
    if (!raw) return [];
    try {
      const dates = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(dates)) return [];
      return dates;
    } catch {
      return [];
    }
  };

  const updateCategory = async (category) => {
    try {
      await api.put(`/admin/vendors/${id}`, { category });
      fetchVendor();
      setMessage({ type: 'success', text: 'Category updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update category.' });
    }
  };

  const deletePayment = async (paymentId) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/admin/payments/${paymentId}`);
      fetchVendor();
      setMessage({ type: 'success', text: 'Invoice deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete invoice.' });
    }
  };

  const openMarkPaid = (paymentId) => {
    setMarkingPaid(paymentId);
    setPaymentMethod('');
    setMemo('');
  };

  const markAsPaid = async () => {
    if (!paymentMethod) return;
    try {
      await api.post(`/payments/${markingPaid}/mark-paid`, { payment_method: paymentMethod, memo });
      setMarkingPaid(null);
      fetchVendor();
      setMessage({ type: 'success', text: 'Payment marked as paid!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update payment.' });
    }
  };

  const deleteVendor = async () => {
    if (!window.confirm(`Are you sure you want to delete "${data.vendor.business_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/vendors/${id}`);
      navigate('/admin/vendors');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete vendor.' });
    }
  };

  const startEditing = () => {
    let handles = {};
    try {
      const raw = data.vendor.social_handles;
      if (raw) handles = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      if (data.vendor.social_handles) handles = { instagram: data.vendor.social_handles };
    }
    setEditData({
      business_name: data.vendor.business_name || '',
      contact_name: data.vendor.contact_name || '',
      email: data.vendor.email || '',
      phone: data.vendor.phone || '',
      website: data.vendor.website || '',
      facebook: handles.facebook || '',
      instagram: handles.instagram || '',
      x: handles.x || '',
      description: data.vendor.description || '',
      booth_size: data.vendor.booth_size || 'single',
      needs_power: !!data.vendor.needs_power,
      is_nonprofit: !!data.vendor.is_nonprofit
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      const payload = {
        business_name: editData.business_name,
        contact_name: editData.contact_name,
        email: editData.email,
        phone: editData.phone,
        website: editData.website,
        social_handles: JSON.stringify({
          facebook: editData.facebook,
          instagram: editData.instagram,
          x: editData.x
        }),
        description: editData.description,
        booth_size: editData.booth_size,
        needs_power: editData.needs_power,
        is_nonprofit: editData.is_nonprofit
      };
      await api.put(`/admin/vendors/${id}`, payload);
      setEditing(false);
      fetchVendor();
      setMessage({ type: 'success', text: 'Vendor information updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update vendor.' });
    }
  };

  const startEditingApp = () => {
    let reqDates = [];
    let altDates = [];
    try {
      const raw = vendor.requested_dates;
      reqDates = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    } catch { /* ignore */ }
    try {
      const raw = vendor.alternate_dates;
      altDates = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    } catch { /* ignore */ }
    setAppEditData({
      markets_requested: String(vendor.markets_requested || '10'),
      requested_dates: reqDates,
      alternate_dates: altDates
    });
    setEditingApp(true);
  };

  const toggleAppDate = (date) => {
    setAppEditData(prev => {
      const N = parseInt(prev.markets_requested) || 0;
      const inPrimary = prev.requested_dates.includes(date);
      const inAlternate = prev.alternate_dates.includes(date);
      if (inPrimary) {
        const newPrimary = prev.requested_dates.filter(d => d !== date);
        if (prev.alternate_dates.length > 0) {
          return { ...prev, requested_dates: [...newPrimary, prev.alternate_dates[0]], alternate_dates: prev.alternate_dates.slice(1) };
        }
        return { ...prev, requested_dates: newPrimary };
      }
      if (inAlternate) {
        return { ...prev, alternate_dates: prev.alternate_dates.filter(d => d !== date) };
      }
      if (prev.requested_dates.length < N) {
        return { ...prev, requested_dates: [...prev.requested_dates, date] };
      }
      return { ...prev, alternate_dates: [...prev.alternate_dates, date] };
    });
  };

  const handleAppMarketsChange = (value) => {
    setAppEditData(prev => {
      const N = parseInt(value) || 0;
      const all = [...prev.requested_dates, ...prev.alternate_dates];
      return { ...prev, markets_requested: value, requested_dates: all.slice(0, N), alternate_dates: all.slice(N) };
    });
  };

  const saveAppEdit = async () => {
    try {
      const boothSize = vendor.booth_size || 'single';
      const mkts = parseInt(appEditData.markets_requested);
      const baseAmount = PRICING[boothSize]?.[mkts] || 0;
      const powerFee = vendor.needs_power ? POWER_FEE : 0;
      const totalAmount = baseAmount + powerFee;
      await api.put(`/admin/vendors/${id}`, {
        markets_requested: mkts,
        requested_dates: JSON.stringify(appEditData.requested_dates),
        alternate_dates: JSON.stringify(appEditData.alternate_dates),
        base_amount: baseAmount,
        power_fee: powerFee,
        total_amount: totalAmount
      });
      setEditingApp(false);
      fetchVendor();
      setMessage({ type: 'success', text: 'Application details updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update application details.' });
    }
  };

  const openInvoiceModal = () => {
    setInvoiceForm({
      booth_size: data.vendor.booth_size || 'single',
      markets: String(data.vendor.markets_requested || '10'),
      power: !!data.vendor.needs_power,
      manual_amount: '',
      manual_description: '',
      manual_due_date: ''
    });
    setInvoiceTab('pricelist');
    setShowInvoiceModal(true);
  };

  const calculateInvoice = () => {
    const base = PRICING[invoiceForm.booth_size]?.[parseInt(invoiceForm.markets)] || 0;
    const power = invoiceForm.power ? POWER_FEE : 0;
    const total = base + power;
    return { base, power, total };
  };

  const submitInvoice = async () => {
    setInvoiceSubmitting(true);
    try {
      let amount, description;
      if (invoiceTab === 'pricelist') {
        const calc = calculateInvoice();
        amount = calc.total;
        const sizeLabel = invoiceForm.booth_size === 'double' ? 'Double' : 'Single';
        description = `2026 Season - ${sizeLabel} Booth (${invoiceForm.markets} markets)${invoiceForm.power ? ' + Power' : ''}`;
      } else {
        amount = parseFloat(invoiceForm.manual_amount);
        description = invoiceForm.manual_description;
        if (!amount || amount <= 0) {
          setMessage({ type: 'error', text: 'Please enter a valid amount.' });
          setInvoiceSubmitting(false);
          return;
        }
      }
      const payload = { vendor_id: parseInt(id), amount, description };
      if (invoiceTab === 'manual' && invoiceForm.manual_due_date) {
        payload.due_date = invoiceForm.manual_due_date;
      }
      await api.post('/payments', payload);
      setShowInvoiceModal(false);
      fetchVendor();
      setMessage({ type: 'success', text: 'Invoice created successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create invoice.' });
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const removeAlternateDate = async (dateStr) => {
    try {
      const raw = data.vendor.alternate_dates;
      const current = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      const updated = current.filter(d => d !== dateStr);
      await api.put(`/admin/vendors/${id}`, { alternate_dates: JSON.stringify(updated) });
      fetchVendor();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update alternate dates.' });
    }
  };

  const formatDate = (dateStr) => dateStr;

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p>Vendor not found.</p>
        <Link to="/admin/vendors">← Back to Vendors</Link>
      </div>
    );
  }

  const { vendor, bookings, payments } = data;
  const bookedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <Link to="/admin/vendors" style={{ fontSize: '14px', color: '#666' }}>← Back to Vendors</Link>
          <h1 className="page-title">{vendor.business_name}</h1>
          <p className="page-subtitle">{vendor.contact_name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await loginAsVendor(id);
                navigate('/vendor/dashboard');
              } catch (err) {
                setMessage({ type: 'error', text: 'Failed to login as vendor.' });
              }
            }}
            className="btn"
            style={{ background: '#2563eb', color: '#fff' }}
          >
            Login as Vendor
          </button>
          <button onClick={toggleActive} className={`btn ${vendor.is_active ? 'btn-danger' : 'btn-primary'}`}>
            {vendor.is_active ? 'Deactivate' : 'Approve'}
          </button>
          <button onClick={deleteVendor} className="btn" style={{ background: '#dc3545', color: '#fff' }}>
            Delete Vendor
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="grid grid-2">
        {/* Vendor Info */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Vendor Information</h3>
            {!editing && (
              <button onClick={startEditing} className="btn" style={{ fontSize: '13px', padding: '6px 14px' }}>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Business Name</label>
                <input type="text" className="form-control" value={editData.business_name} onChange={e => setEditData(prev => ({ ...prev, business_name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Contact Name</label>
                <input type="text" className="form-control" value={editData.contact_name} onChange={e => setEditData(prev => ({ ...prev, contact_name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Email</label>
                <input type="email" className="form-control" value={editData.email} onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Phone</label>
                <input type="tel" className="form-control" value={editData.phone} onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Website</label>
                <input type="text" className="form-control" value={editData.website} onChange={e => setEditData(prev => ({ ...prev, website: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Facebook</label>
                <input type="text" className="form-control" value={editData.facebook} onChange={e => setEditData(prev => ({ ...prev, facebook: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Instagram</label>
                <input type="text" className="form-control" value={editData.instagram} onChange={e => setEditData(prev => ({ ...prev, instagram: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>X / Twitter</label>
                <input type="text" className="form-control" value={editData.x} onChange={e => setEditData(prev => ({ ...prev, x: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Description</label>
                <textarea className="form-control" rows={3} value={editData.description} onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Booth Size</label>
                <select className="form-control" style={{ maxWidth: '200px' }} value={editData.booth_size} onChange={e => setEditData(prev => ({ ...prev, booth_size: e.target.value }))}>
                  <option value="single">Single (10x10)</option>
                  <option value="double">Double (20x10)</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editData.needs_power} onChange={e => setEditData(prev => ({ ...prev, needs_power: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Needs Power</span>
                </label>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editData.is_nonprofit} onChange={e => setEditData(prev => ({ ...prev, is_nonprofit: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Nonprofit</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={saveEdit} className="btn btn-primary" style={{ fontSize: '13px' }}>Save</button>
                <button onClick={() => setEditing(false)} className="btn" style={{ fontSize: '13px' }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '12px' }}>
                <strong>Email</strong>
                <p style={{ color: '#666' }}>{vendor.email}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Phone</strong>
                <p style={{ color: '#666' }}>{vendor.phone || 'Not provided'}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Booth Size</strong>
                <p style={{ color: '#666' }}>{vendor.booth_size === 'double' ? '20x10 Double Booth' : '10x10 Single Booth'}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Needs Power</strong>
                <p style={{ color: '#666' }}>{vendor.needs_power ? 'Yes' : 'No'}</p>
              </div>

              {vendor.website && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Website</strong>
                  <p style={{ color: '#666' }}>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer">{vendor.website}</a>
                  </p>
                </div>
              )}

              {(() => {
                let handles = {};
                try {
                  const raw = vendor.social_handles;
                  if (raw) handles = typeof raw === 'string' ? JSON.parse(raw) : raw;
                } catch {
                  if (vendor.social_handles) handles = { instagram: vendor.social_handles };
                }
                return (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Facebook</strong>
                      <p style={{ color: '#666' }}>{handles.facebook || 'Not provided'}</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Instagram</strong>
                      <p style={{ color: '#666' }}>{handles.instagram || 'Not provided'}</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>X / Twitter</strong>
                      <p style={{ color: '#666' }}>{handles.x || 'Not provided'}</p>
                    </div>
                  </>
                );
              })()}

              <div style={{ marginBottom: '12px' }}>
                <strong>Category</strong>
                <p>
                  <select
                    value={vendor.category || 'makers'}
                    onChange={(e) => updateCategory(e.target.value)}
                    className="form-control"
                    style={{ maxWidth: '200px' }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Status</strong>
                <p>
                  <span className={`badge badge-${vendor.is_active ? 'success' : 'danger'}`}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {vendor.is_nonprofit && <span className="badge badge-info" style={{ marginLeft: '8px' }}>Nonprofit</span>}
                </p>
              </div>

              {vendor.description && (
                <div>
                  <strong>Description</strong>
                  <p style={{ color: '#666' }}>{vendor.description}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Application Details */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Application Details</h3>
            {!editingApp && (
              <button onClick={startEditingApp} className="btn" style={{ fontSize: '13px', padding: '6px 14px' }}>
                Edit
              </button>
            )}
          </div>

          {editingApp ? (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Markets Requested</label>
                <select className="form-control" style={{ maxWidth: '200px' }} value={appEditData.markets_requested} onChange={e => handleAppMarketsChange(e.target.value)}>
                  <option value="10">10 (Full Season)</option>
                  <option value="6">6 markets</option>
                  <option value="3">3 markets</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
                  Requested Dates ({appEditData.requested_dates.length} primary, {appEditData.alternate_dates.length} alternate)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {MARKET_DATE_LABELS.map(label => {
                    const isPrimary = appEditData.requested_dates.includes(label);
                    const isAlternate = appEditData.alternate_dates.includes(label);
                    return (
                      <div
                        key={label}
                        onClick={() => toggleAppDate(label)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: isPrimary ? '2px solid var(--maroon, #5c1e3d)' : isAlternate ? '2px dashed #999' : '2px solid #ddd',
                          background: isPrimary ? '#f0fdf4' : isAlternate ? '#f5f5f5' : '#fff',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <input type="checkbox" checked={isPrimary || isAlternate} readOnly style={{ pointerEvents: 'none' }} />
                        <span>{label}</span>
                        {isAlternate && <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#999', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>Alt</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Pricing (auto-calculated)</label>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {(() => {
                    const boothSize = vendor.booth_size || 'single';
                    const mkts = parseInt(appEditData.markets_requested);
                    const base = PRICING[boothSize]?.[mkts] || 0;
                    const power = vendor.needs_power ? POWER_FEE : 0;
                    return <span>${(base + power).toFixed(2)} ({boothSize}, {mkts} markets{vendor.needs_power ? ' + power' : ''})</span>;
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={saveAppEdit} className="btn btn-primary" style={{ fontSize: '13px' }}>Save</button>
                <button onClick={() => setEditingApp(false)} className="btn" style={{ fontSize: '13px' }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '12px' }}>
                <strong>Application Status</strong>
                <p>
                  <span className={`badge badge-${vendor.application_status === 'approved' ? 'success' : vendor.application_status === 'rejected' ? 'danger' : 'warning'}`}>
                    {vendor.application_status || 'pending'}
                  </span>
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Markets Requested</strong>
                <p style={{ color: '#666' }}>{vendor.markets_requested || 'N/A'} markets</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Requested Dates</strong>
                <div style={{ color: '#666' }}>
                  {vendor.requested_dates ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {(() => {
                        try {
                          const dates = typeof vendor.requested_dates === 'string'
                            ? JSON.parse(vendor.requested_dates)
                            : vendor.requested_dates;
                          return Array.isArray(dates) ? dates.map((date, idx) => (
                            <span key={idx} style={{
                              background: '#f0f0f0',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}>
                              {date}
                            </span>
                          )) : <span>{vendor.requested_dates}</span>;
                        } catch {
                          return <span>{vendor.requested_dates}</span>;
                        }
                      })()}
                    </div>
                  ) : (
                    <p>No dates specified</p>
                  )}
                </div>
              </div>

              {vendor.alternate_dates && (() => {
                try {
                  const altDates = typeof vendor.alternate_dates === 'string'
                    ? JSON.parse(vendor.alternate_dates)
                    : vendor.alternate_dates;
                  if (Array.isArray(altDates) && altDates.length > 0) {
                    return (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Alternate Dates</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {altDates.map((date, idx) => (
                            <span key={idx} style={{
                              background: '#e8e8e8',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              border: '1px dashed #999',
                              color: '#666'
                            }}>
                              {date}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch { /* ignore */ }
                return null;
              })()}

              <div style={{ marginBottom: '12px' }}>
                <strong>Pricing</strong>
                <div style={{ color: '#666', marginTop: '4px' }}>
                  <div>Base Amount: ${parseFloat(vendor.base_amount || 0).toFixed(2)}</div>
                  {vendor.power_fee > 0 && <div>Power Fee: ${parseFloat(vendor.power_fee).toFixed(2)}</div>}
                  <div style={{ fontWeight: 'bold', marginTop: '4px' }}>
                    Total: ${parseFloat(vendor.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}

          {vendor.images && vendor.images.length > 0 && (
            <div>
              <strong>Uploaded Images</strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {vendor.images.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requested Dates Review */}
      {bookings.filter(b => b.status === 'requested').length > 0 && (
        <div className="card mt-3" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ marginBottom: '4px' }}>Date Requests</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            Mark each requested date as Approve or Deny, then submit all at once. The vendor will receive one email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {bookings.filter(b => b.status === 'requested').map(booking => {
              const decision = reviewDecisions[booking.id];
              return (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: decision === 'approve' ? '#f0fdf4' : decision === 'deny' ? '#fef2f2' : '#fffbeb'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>{formatDate(booking.date)}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setReviewDecisions(prev => ({ ...prev, [booking.id]: prev[booking.id] === 'approve' ? undefined : 'approve' }))}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: decision === 'approve' ? '2px solid #16a34a' : '1px solid #ddd',
                        background: decision === 'approve' ? '#dcfce7' : '#fff',
                        color: decision === 'approve' ? '#16a34a' : '#333'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setReviewDecisions(prev => ({ ...prev, [booking.id]: prev[booking.id] === 'deny' ? undefined : 'deny' }))}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: decision === 'deny' ? '2px solid #dc2626' : '1px solid #ddd',
                        background: decision === 'deny' ? '#fee2e2' : '#fff',
                        color: decision === 'deny' ? '#dc2626' : '#333'
                      }}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={submitReview}
              disabled={reviewSubmitting || Object.values(reviewDecisions).filter(Boolean).length === 0}
              className="btn btn-primary"
              style={{
                fontSize: '13px',
                padding: '8px 16px',
                opacity: (reviewSubmitting || Object.values(reviewDecisions).filter(Boolean).length === 0) ? 0.5 : 1
              }}
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Decisions'}
            </button>
            <button
              onClick={() => {
                const requestedIds = bookings.filter(b => b.status === 'requested').reduce((acc, b) => ({ ...acc, [b.id]: 'approve' }), {});
                setReviewDecisions(requestedIds);
              }}
              style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Approve All
            </button>
            <button
              onClick={() => {
                const requestedIds = bookings.filter(b => b.status === 'requested').reduce((acc, b) => ({ ...acc, [b.id]: 'deny' }), {});
                setReviewDecisions(requestedIds);
              }}
              style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Deny All
            </button>
          </div>
        </div>
      )}

      {/* Market Dates - All dates with checkboxes */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Market Dates ({bookedCount} of {allDates.length} booked)</h3>

        {allDates.length === 0 ? (
          <p style={{ color: '#666' }}>No market dates configured.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {(() => {
              let adminAltDates = new Set();
              try {
                const raw = vendor.alternate_dates;
                const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
                if (Array.isArray(parsed)) adminAltDates = new Set(parsed);
              } catch { /* ignore */ }
              return allDates.map(md => {
              const booking = bookings.find(b => b.market_date_id === md.id);
              const isBooked = booking && booking.status === 'confirmed';
              const isRequested = booking && booking.status === 'requested';
              const isAlt = adminAltDates.has(md.date);
              return (
                <div
                  key={md.id}
                  onClick={() => !isRequested && toggleBooking(md)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: isBooked ? '1px solid #800000' : isRequested ? '1px solid #d4a017' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: isRequested ? 'default' : 'pointer',
                    background: isRequested ? '#fffbeb' : isBooked ? '#800000' : '#fff',
                    color: isBooked && !isRequested ? '#fff' : '#333',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: isBooked ? 600 : 400 }}>{formatDate(md.date)}</span>
                  {isAlt && (
                    <span
                      title="Click to promote to regular booking"
                      onClick={(e) => { e.stopPropagation(); removeAlternateDate(md.date); }}
                      style={{ fontSize: '10px', background: isBooked ? 'rgba(255,255,255,0.3)' : '#999', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 600, cursor: 'pointer' }}
                    >Alt ✕</span>
                  )}
                  {isBooked && !isAlt && (
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '3px', fontWeight: 600 }}>Booked</span>
                  )}
                  {isRequested && (
                    <span style={{ fontSize: '11px', background: '#d4a017', color: '#fff', padding: '2px 8px', borderRadius: '3px', fontWeight: 600 }}>Pending</span>
                  )}
                </div>
              );
            });
            })()}
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="card mt-3">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Payments</h3>
          <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={openInvoiceModal}>
            + Add Invoice
          </button>
        </div>

        {payments.length === 0 ? (
          <p style={{ color: '#666' }}>No payments recorded.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td>{payment.description || 'Market fees'}</td>
                  <td>${parseFloat(payment.amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${payment.status === 'paid' ? 'success' : 'warning'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>
                    {payment.payment_method && <div>{payment.payment_method}</div>}
                    {payment.memo && <div style={{ fontStyle: 'italic' }}>{payment.memo}</div>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => openMarkPaid(payment.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '4px 10px', marginRight: '8px' }}
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => deletePayment(payment.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Shoutouts */}
      <div className="card mt-3">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Shoutouts</h3>
          <button
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
            onClick={() => setShowShoutoutForm(!showShoutoutForm)}
          >
            {showShoutoutForm ? 'Cancel' : '+ Add Shoutout'}
          </button>
        </div>

        {showShoutoutForm && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Platform</label>
              <select
                value={shoutoutForm.platform}
                onChange={e => setShoutoutForm({ ...shoutoutForm, platform: e.target.value })}
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                value={shoutoutForm.posted_at}
                onChange={e => setShoutoutForm({ ...shoutoutForm, posted_at: e.target.value })}
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
              <input
                type="text"
                value={shoutoutForm.notes}
                onChange={e => setShoutoutForm({ ...shoutoutForm, notes: e.target.value })}
                placeholder="e.g. Reel, Story, Collab post..."
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
              />
            </div>
            <button onClick={addShoutout} className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}>
              Save
            </button>
          </div>
        )}

        {shoutouts.length === 0 ? (
          <p style={{ color: '#666' }}>No shoutouts recorded.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Platform</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shoutouts.map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(s.posted_at).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </td>
                  <td><span className="badge">{s.platform}</span></td>
                  <td style={{ fontSize: '13px', color: '#666' }}>{s.notes || '--'}</td>
                  <td>
                    <button
                      onClick={() => deleteShoutout(s.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mark Paid Modal */}
      {markingPaid && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setMarkingPaid(null)}>
          <div className="card" style={{ width: '400px', margin: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0' }}>Mark as Paid</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="form-control"
              >
                <option value="">Select...</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Venmo">Venmo</option>
                <option value="Zelle">Zelle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
                Memo (optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="e.g. Check #1234"
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={markAsPaid} disabled={!paymentMethod} className="btn btn-primary" style={{ fontSize: '13px', opacity: !paymentMethod ? 0.5 : 1 }}>
                Confirm Paid
              </button>
              <button onClick={() => setMarkingPaid(null)} className="btn" style={{ fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Add Invoice for {vendor.business_name}</h3>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
              <button
                onClick={() => setInvoiceTab('pricelist')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: invoiceTab === 'pricelist' ? '2px solid #333' : '2px solid transparent',
                  fontWeight: invoiceTab === 'pricelist' ? 700 : 400,
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                From Price List
              </button>
              <button
                onClick={() => setInvoiceTab('manual')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: invoiceTab === 'manual' ? '2px solid #333' : '2px solid transparent',
                  fontWeight: invoiceTab === 'manual' ? 700 : 400,
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                Manual
              </button>
            </div>

            {invoiceTab === 'pricelist' && (() => {
              const calc = calculateInvoice();
              return (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Booth Size</label>
                    <select
                      className="form-control"
                      value={invoiceForm.booth_size}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, booth_size: e.target.value }))}
                    >
                      <option value="single">Single (10x10)</option>
                      <option value="double">Double (20x10)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Markets</label>
                    <select
                      className="form-control"
                      value={invoiceForm.markets}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, markets: e.target.value }))}
                    >
                      <option value="10">10 markets (Full Season)</option>
                      <option value="6">6 markets</option>
                      <option value="3">3 markets</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={invoiceForm.power}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, power: e.target.checked }))}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Needs Power (+$15)</span>
                    </label>
                  </div>

                  {/* Breakdown */}
                  <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Base ({invoiceForm.booth_size === 'double' ? 'Double' : 'Single'}, {invoiceForm.markets} markets)</span>
                      <span>${calc.base.toFixed(2)}</span>
                    </div>
                    {calc.power > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Power</span>
                        <span>${calc.power.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#888', fontStyle: 'italic' }}>
                      <span>3% CC fee added at checkout</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px', fontWeight: 700, fontSize: '16px' }}>
                      <span>Total</span>
                      <span>${calc.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                    Description: "2026 Season - {invoiceForm.booth_size === 'double' ? 'Double' : 'Single'} Booth ({invoiceForm.markets} markets){invoiceForm.power ? ' + Power' : ''}"
                  </p>
                </div>
              );
            })()}

            {invoiceTab === 'manual' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={invoiceForm.manual_amount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, manual_amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceForm.manual_description}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, manual_description: e.target.value }))}
                    placeholder="e.g. No-show fee, Additional market date"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Due Date (optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invoiceForm.manual_due_date}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, manual_due_date: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitInvoice} disabled={invoiceSubmitting}>
                {invoiceSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '8px' }}>Approve {vendor.business_name}</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
              Select which market dates to book for this vendor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {allDates.map(md => {
                const dateStr = md.date;
                const isChecked = approvalDates.includes(dateStr);
                const isAlt = alternateDateSet.has(dateStr);
                return (
                  <label
                    key={md.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      border: isAlt && isChecked ? '1px dashed #999' : '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isChecked ? (isAlt ? '#f5f5f5' : '#f0fdf4') : '#fff'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleApprovalDate(dateStr)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{formatDate(md.date)}</span>
                    {isAlt && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        background: '#999',
                        color: '#fff',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 600
                      }}>Alt</span>
                    )}
                  </label>
                );
              })}
            </div>

            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              {approvalDates.length} date{approvalDates.length !== 1 ? 's' : ''} selected
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmApproval}>
                Approve & Book {approvalDates.length} Date{approvalDates.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorDetail;
