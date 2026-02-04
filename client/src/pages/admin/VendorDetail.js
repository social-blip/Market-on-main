import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

const CATEGORIES = [
  { value: 'growers', label: 'Growers' },
  { value: 'makers', label: 'Makers' },
  { value: 'eats', label: 'Eats' },
  { value: 'vintage', label: 'Vintage & Finds' }
];

const AdminVendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchVendor();
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

  const toggleActive = async () => {
    try {
      if (!data.vendor.is_active) {
        // Approving - use the approve endpoint
        await api.post(`/admin/vendors/${id}/approve`);
        fetchVendor();
        setMessage({ type: 'success', text: 'Vendor approved! Invoice created and welcome email sent.' });
      } else {
        // Deactivating
        await api.put(`/admin/vendors/${id}`, { is_active: false });
        fetchVendor();
        setMessage({ type: 'success', text: 'Vendor deactivated.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update vendor status.' });
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
                  <a key={idx} href={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${img}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${img}`}
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

      {/* Bookings */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Market Dates ({bookings.length})</h3>

        {bookings.length === 0 ? (
          <p style={{ color: '#666' }}>No bookings yet.</p>
        ) : (
          <div>
            {bookings.map(booking => (
              <div
                key={booking.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{formatDate(booking.date)}</strong>
                  {booking.booth_location && (
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                      Booth: {booking.booth_location}
                    </span>
                  )}
                </div>
                <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Payments</h3>

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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminVendorDetail;
