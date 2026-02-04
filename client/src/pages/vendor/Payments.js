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
          background: '#fee',
          border: '2px solid #E30613',
          padding: '12px',
          marginTop: '16px',
          fontFamily: "'Sora', sans-serif",
          fontSize: '14px',
          color: '#E30613'
        }}>
          {error}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '14px',
            padding: '14px 28px',
            background: processing ? '#ccc' : '#FFD700',
            color: '#000',
            border: '3px solid #000',
            cursor: processing ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
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
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            padding: '14px 28px',
            background: '#fff',
            color: '#000',
            border: '3px solid #000',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
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

    // Wait a moment for webhook to process, then refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchPayments();

    // Clear success message after a few seconds
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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 40px)',
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
          View your payment history and pay outstanding balances
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#d4edda',
          border: '4px solid #28a745',
          padding: '16px 24px',
          marginBottom: '24px',
          fontFamily: "'Sora', sans-serif",
          fontSize: '16px',
          color: '#155724',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          {successMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Amount Due */}
        <div style={{
          background: totalDue > 0 ? '#fff' : '#fff',
          border: totalDue > 0 ? '4px solid #E30613' : '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '40px',
            color: totalDue > 0 ? '#E30613' : '#000',
            lineHeight: 1
          }}>
            ${totalDue.toFixed(2)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: totalDue > 0 ? '#E30613' : '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Amount Due
          </div>
        </div>

        {/* Total Paid */}
        <div style={{
          background: '#FFD700',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '40px',
            color: '#000',
            lineHeight: 1
          }}>
            ${totalPaid.toFixed(2)}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Total Paid
          </div>
        </div>

        {/* Transactions */}
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '40px',
            color: '#000',
            lineHeight: 1
          }}>
            {payments.length}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px'
          }}>
            Transactions
          </div>
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
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            border: '4px solid #000',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '24px',
              color: '#000',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>
              Pay Invoice
            </h2>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              color: '#666',
              margin: '0 0 24px 0'
            }}>
              {payingInvoice.description || 'Market vendor fees'}
            </p>

            <div style={{
              background: '#f5f5f5',
              padding: '16px',
              marginBottom: '24px',
              border: '2px solid #000'
            }}>
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#666',
                marginBottom: '4px'
              }}>
                Amount to Pay
              </div>
              <div style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#000'
              }}>
                ${parseFloat(payingInvoice.amount).toFixed(2)}
              </div>
            </div>

            {loadingPayment ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px'
              }}>
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
                      colorPrimary: '#000',
                      fontFamily: "'Sora', sans-serif"
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
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '14px 28px',
                  background: '#fff',
                  color: '#000',
                  border: '3px solid #000',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Open Invoices */}
      {pendingPayments.length > 0 && (
        <div style={{
          background: '#fff',
          border: '4px solid #E30613',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            color: '#E30613',
            margin: '0 0 20px 0',
            paddingBottom: '16px',
            borderBottom: '3px solid #E30613',
            textTransform: 'uppercase'
          }}>
            Open Invoices
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Sora', sans-serif"
            }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Date</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Description</th>
                  <th style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Amount</th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Status</th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '2px solid #eee' }}>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      {payment.description || 'Market vendor fees'}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: 600
                    }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        padding: '6px 12px',
                        background: payment.status === 'overdue' ? '#E30613' : '#fff',
                        color: payment.status === 'overdue' ? '#fff' : '#000',
                        border: '3px solid #000',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handlePayNow(payment)}
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 800,
                          fontSize: '12px',
                          padding: '10px 20px',
                          background: '#FFD700',
                          color: '#000',
                          border: '3px solid #000',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
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
      <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '24px'
      }}>
        <h3 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: '20px',
          color: '#000',
          margin: '0 0 20px 0',
          paddingBottom: '16px',
          borderBottom: '3px solid #000',
          textTransform: 'uppercase'
        }}>
          Payment History
        </h3>

        {paidPayments.length === 0 ? (
          <p style={{
            fontFamily: "'Sora', sans-serif",
            color: '#666',
            margin: 0
          }}>
            No paid invoices yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Sora', sans-serif"
            }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Paid Date</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Description</th>
                  <th style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Amount</th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '2px solid #eee' }}>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      {payment.paid_date
                        ? new Date(payment.paid_date).toLocaleDateString()
                        : new Date(payment.updated_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      {payment.description || 'Market vendor fees'}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: 600
                    }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        padding: '6px 12px',
                        background: '#FFD700',
                        color: '#000',
                        border: '3px solid #000',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Paid
                      </span>
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
