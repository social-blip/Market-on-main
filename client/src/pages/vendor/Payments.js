import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/client';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Checkout form component
const CheckoutForm = ({ payment, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div style={{
          background: '#fee2e2',
          borderRadius: '8px',
          padding: '12px 16px',
          marginTop: '16px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="vendor-form__btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {processing ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
              Processing...
            </>
          ) : (
            `Pay $${parseFloat(payment.amount).toFixed(2)}`
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="vendor-form__btn vendor-form__btn--secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const VendorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/vendors/payments');
      setPayments(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (payment) => {
    setLoadingPayment(true);
    setPayingInvoice(payment);

    try {
      const response = await api.post(`/vendors/payments/${payment.id}/create-payment-intent`);
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      alert(err.response?.data?.error || 'Failed to initialize payment');
      setPayingInvoice(null);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPayingInvoice(null);
    setClientSecret(null);
    setSuccessMessage('Payment successful! Thank you.');

    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchPayments();

    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handlePaymentCancel = () => {
    setPayingInvoice(null);
    setClientSecret(null);
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalDue = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <div className="vendor-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="vendor-page__header">
        <h1 className="vendor-page__title">Payments</h1>
        <p className="vendor-page__subtitle">
          View your payment history and pay outstanding balances
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="vendor-card" style={{
          background: 'var(--cta-green)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px' }}>{successMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="vendor-payments__summary">
        {/* Amount Due */}
        <div className="vendor-payments__summary-card">
          <div className="vendor-payments__summary-value" style={{ color: totalDue > 0 ? '#991b1b' : 'var(--black)' }}>
            ${totalDue.toFixed(2)}
          </div>
          <div className="vendor-payments__summary-label">Amount Due</div>
        </div>

        {/* Total Paid */}
        <div className="vendor-payments__summary-card vendor-payments__summary-card--green">
          <div className="vendor-payments__summary-value">
            ${totalPaid.toFixed(2)}
          </div>
          <div className="vendor-payments__summary-label">Total Paid</div>
        </div>

        {/* Transactions */}
        <div className="vendor-payments__summary-card">
          <div className="vendor-payments__summary-value">
            {payments.length}
          </div>
          <div className="vendor-payments__summary-label">Transactions</div>
        </div>
      </div>

      {/* Payment Modal */}
      {payingInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="vendor-card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 className="vendor-card__title" style={{ marginBottom: '8px' }}>
              Pay Invoice
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--gray-dark)',
              margin: '0 0 24px 0'
            }}>
              {payingInvoice.description || 'Market vendor fees'}
            </p>

            <div style={{
              background: 'var(--gray-light)',
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--gray-medium)',
                marginBottom: '4px'
              }}>
                Amount to Pay
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '32px',
                color: 'var(--black)'
              }}>
                ${parseFloat(payingInvoice.amount).toFixed(2)}
              </div>
            </div>

            {loadingPayment ? (
              <div className="vendor-loading" style={{ minHeight: '100px' }}>
                <span className="spinner"></span>
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#5B2E48',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '8px'
                    }
                  }
                }}
              >
                <CheckoutForm
                  payment={payingInvoice}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            ) : (
              <button
                onClick={handlePaymentCancel}
                className="vendor-form__btn vendor-form__btn--secondary"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Open Invoices */}
      {pendingPayments.length > 0 && (
        <div className="vendor-card" style={{ marginBottom: '24px' }}>
          <div className="vendor-card__header">
            <h3 className="vendor-card__title" style={{ color: '#991b1b' }}>Open Invoices</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td>{payment.description || 'Market vendor fees'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`vendor-badge ${payment.status === 'overdue' ? 'vendor-badge--danger' : 'vendor-badge--warning'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handlePayNow(payment)}
                        className="vendor-payment__btn"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="vendor-payments__history">
        <div className="vendor-card__header">
          <h3 className="vendor-card__title">Payment History</h3>
        </div>

        {paidPayments.length === 0 ? (
          <p className="vendor-card__empty">No paid invoices yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Paid Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      {payment.paid_date
                        ? new Date(payment.paid_date).toLocaleDateString()
                        : new Date(payment.updated_at).toLocaleDateString()}
                    </td>
                    <td>{payment.description || 'Market vendor fees'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="vendor-badge vendor-badge--success">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPayments;
