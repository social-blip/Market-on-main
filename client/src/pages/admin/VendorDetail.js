import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

const CATEGORIES = [
  { value: 'growers', label: 'Growers' },
  { value: 'makers', label: 'Makers' },
  { value: 'eats', label: 'Eats' },
  { value: 'finds', label: 'Finds' }
];

const PRICING = {
  single: { 10: 500, 6: 350, 3: 195 },
  double: { 10: 750, 6: 550, 3: 290 }
};
const POWER_FEE = 15;

const AdminVendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allDates, setAllDates] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalDates, setApprovalDates] = useState([]);
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

  useEffect(() => {
    fetchVendor();
    fetchAllDates();
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

  const toggleActive = async () => {
    if (!data.vendor.is_active) {
      // Opening approval modal instead of immediately approving
      const requestedDates = parseRequestedDates(data.vendor.requested_dates);
      setApprovalDates(requestedDates);
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

  const parseRequestedDates = (raw) => {
    if (!raw) return [];
    try {
      const dates = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(dates) ? dates : [];
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
    const subtotal = base + power;
    const ccFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + ccFee;
    return { base, power, ccFee, total };
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

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
  const bookedCount = bookings.length;

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <Link to="/admin/vendors" style={{ fontSize: '14px', color: '#666' }}>← Back to Vendors</Link>
          <h1 className="page-title">{vendor.business_name}</h1>
          <p className="page-subtitle">{vendor.contact_name}</p>
        </div>
        <div className="flex gap-2">
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
          <h3 style={{ marginBottom: '16px' }}>Vendor Information</h3>

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

          {vendor.social_handles && (
            <div style={{ marginBottom: '12px' }}>
              <strong>Social Media</strong>
              <div style={{ color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                {(() => {
                  try {
                    const handles = typeof vendor.social_handles === 'string'
                      ? JSON.parse(vendor.social_handles)
                      : vendor.social_handles;
                    return (
                      <>
                        {handles.facebook && (
                          <span>
                            <strong>FB:</strong> {handles.facebook}
                          </span>
                        )}
                        {handles.instagram && (
                          <span>
                            <strong>IG:</strong> {handles.instagram}
                          </span>
                        )}
                        {handles.x && (
                          <span>
                            <strong>X:</strong> {handles.x}
                          </span>
                        )}
                      </>
                    );
                  } catch {
                    return <span>{vendor.social_handles}</span>;
                  }
                })()}
              </div>
            </div>
          )}

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
        </div>

        {/* Application Details */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Application Details</h3>

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
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

      {/* Market Dates - All dates with checkboxes */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Market Dates ({bookedCount} of {allDates.length} booked)</h3>

        {allDates.length === 0 ? (
          <p style={{ color: '#666' }}>No market dates configured.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {allDates.map(md => {
              const isBooked = bookings.some(b => b.market_date_id === md.id);
              return (
                <label
                  key={md.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isBooked ? '#f0fdf4' : '#fff'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isBooked}
                    onChange={() => toggleBooking(md)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '14px' }}>{formatDate(md.date)}</span>
                  {isBooked && (
                    <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '11px' }}>Booked</span>
                  )}
                </label>
              );
            })}
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
                  <td>
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
                      <span>CC Fee (3%)</span>
                      <span>${calc.ccFee.toFixed(2)}</span>
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
                const dateStr = md.date.split('T')[0];
                const isChecked = approvalDates.includes(dateStr);
                return (
                  <label
                    key={md.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isChecked ? '#f0fdf4' : '#fff'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleApprovalDate(dateStr)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{formatDate(md.date)}</span>
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
