import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [markingPaid, setMarkingPaid] = useState(null); // payment id being marked
  const [paymentMethod, setPaymentMethod] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMarkPaid = (id) => {
    setMarkingPaid(id);
    setPaymentMethod('');
    setMemo('');
  };

  const markAsPaid = async () => {
    if (!paymentMethod) return;
    try {
      await api.post(`/payments/${markingPaid}/mark-paid`, { payment_method: paymentMethod, memo });
      setMarkingPaid(null);
      fetchPayments();
      setMessage({ type: 'success', text: 'Payment marked as paid!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update payment.' });
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'pending') return p.status === 'pending';
    if (filter === 'paid') return p.status === 'paid';
    return true;
  });

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1">Payments</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>Track and manage vendor payments</p>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      {/* Stats */}
      <div className="grid grid-4 mb-4" style={{ gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center', background: 'var(--maroon)', color: 'var(--cream)' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--yellow)' }}>${totalPaid.toFixed(0)}</div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Collected</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderColor: totalPending > 0 ? 'var(--danger)' : undefined }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: totalPending > 0 ? 'var(--danger)' : 'var(--dark)' }}>
            ${totalPending.toFixed(0)}
          </div>
          <div style={{ fontSize: '12px', color: totalPending > 0 ? 'var(--danger)' : 'var(--gray-dark)', textTransform: 'uppercase' }}>
            Outstanding
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--maroon)' }}>{paidCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Paid</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700 }}>{pendingCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All', count: payments.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'paid', label: 'Paid', count: paidCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                  No payments found.
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} style={{ background: payment.status === 'pending' ? '#fff9e6' : undefined }}>
                  <td style={{ fontSize: '13px', color: 'var(--gray)' }}>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/admin/vendors/${payment.vendor_id}`} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
                      {payment.business_name}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{payment.contact_name}</div>
                  </td>
                  <td>{payment.description || 'Market fees'}</td>
                  <td style={{ fontWeight: 700, fontSize: '16px' }}>${parseFloat(payment.amount).toFixed(0)}</td>
                  <td>
                    {payment.status === 'paid' ? (
                      <span className="badge badge-success">Paid</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--gray)' }}>
                    {payment.payment_method && <div>{payment.payment_method}</div>}
                    {payment.memo && <div style={{ fontStyle: 'italic' }}>{payment.memo}</div>}
                  </td>
                  <td>
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => openMarkPaid(payment.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>
                Memo (optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="e.g. Check #1234"
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={markAsPaid} disabled={!paymentMethod} className="btn btn-primary" style={{ fontSize: '13px', opacity: !paymentMethod ? 0.5 : 1 }}>
                Confirm Paid
              </button>
              <button onClick={() => setMarkingPaid(null)} className="btn btn-secondary" style={{ fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
