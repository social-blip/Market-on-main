import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const markAsPaid = async (id) => {
    try {
      await api.post(`/payments/${id}/mark-paid`);
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
          Payments
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          Track and manage vendor payments
        </p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div style={{
          padding: '16px 20px',
          marginBottom: '24px',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `4px solid ${message.type === 'success' ? '#28a745' : '#E30613'}`,
          fontFamily: "'Sora', sans-serif",
          fontWeight: 600,
          color: message.type === 'success' ? '#28a745' : '#E30613'
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#000',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#FFD700'
          }}>
            ${totalPaid.toFixed(0)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Collected
          </div>
        </div>
        <div style={{
          background: totalPending > 0 ? '#fff' : '#fff',
          border: totalPending > 0 ? '4px solid #E30613' : '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: totalPending > 0 ? '#E30613' : '#000'
          }}>
            ${totalPending.toFixed(0)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: totalPending > 0 ? '#E30613' : '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Outstanding
          </div>
        </div>
        <div style={{
          background: '#FFD700',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {paidCount}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Paid
          </div>
        </div>
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {pendingCount}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Pending
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: payments.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'paid', label: 'Paid', count: paidCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                padding: '10px 16px',
                background: filter === key ? '#FFD700' : '#fff',
                color: '#000',
                border: filter === key ? '3px solid #000' : '2px solid #000',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div style={{
        background: '#fff',
        border: '4px solid #000'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 2fr 2fr 100px 100px 120px',
          gap: '16px',
          padding: '16px 20px',
          background: '#000',
          color: '#fff'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Date</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Vendor</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Description</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Amount</div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Status</div>
          <div></div>
        </div>

        {/* Table Rows */}
        {filteredPayments.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: "'Sora', sans-serif",
            color: '#666'
          }}>
            No payments found.
          </div>
        ) : (
          filteredPayments.map((payment, index) => (
            <div
              key={payment.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 2fr 2fr 100px 100px 120px',
                gap: '16px',
                padding: '16px 20px',
                alignItems: 'center',
                borderBottom: index < filteredPayments.length - 1 ? '2px solid #eee' : 'none',
                background: payment.status === 'pending' ? '#fff9e6' : '#fff'
              }}
            >
              {/* Date */}
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '13px',
                color: '#666'
              }}>
                {new Date(payment.created_at).toLocaleDateString()}
              </div>

              {/* Vendor */}
              <div>
                <Link
                  to={`/admin/vendors/${payment.vendor_id}`}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000',
                    textDecoration: 'none'
                  }}
                >
                  {payment.business_name}
                </Link>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {payment.contact_name}
                </div>
              </div>

              {/* Description */}
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#333'
              }}>
                {payment.description || 'Market fees'}
              </div>

              {/* Amount */}
              <div style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '16px',
                color: '#000'
              }}>
                ${parseFloat(payment.amount).toFixed(0)}
              </div>

              {/* Status */}
              <div>
                {payment.status === 'paid' ? (
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#d4edda',
                    color: '#28a745',
                    border: '2px solid #28a745',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}>
                    Paid
                  </span>
                ) : (
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#FFD700',
                    color: '#000',
                    border: '2px solid #000',
                    textTransform: 'uppercase',
                    display: 'inline-block'
                  }}>
                    Pending
                  </span>
                )}
              </div>

              {/* Actions */}
              <div>
                {payment.status === 'pending' && (
                  <button
                    onClick={() => markAsPaid(payment.id)}
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '8px 14px',
                      background: '#28a745',
                      color: '#fff',
                      border: '2px solid #28a745',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Responsive Note */}
      <style>{`
        @media (max-width: 900px) {
          .payment-table-header,
          .payment-table-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPayments;
