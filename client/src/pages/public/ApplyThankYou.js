import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const ApplyThankYou = () => {
  const { state } = useLocation();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      padding: '40px 20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(36px, 8vw, 56px)',
          color: 'var(--maroon)',
          margin: '0 0 24px 0',
          textTransform: 'uppercase'
        }}>
          Application Submitted!
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: 1.7,
          color: 'var(--dark)',
          marginBottom: '24px'
        }}>
          Thank you for applying to Market on Main! Your application is now under review.
        </p>

        {state?.pricing && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'left',
            border: '1px solid var(--gray-medium)'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px',
              textTransform: 'uppercase',
              color: 'var(--dark)'
            }}>
              Your Selection
            </h3>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 2, color: 'var(--dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Booth Size</span>
                <strong>{state.booth_size === 'single' ? 'Single (10\'x10\')' : 'Double (20\'x10\')'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Markets</span>
                <strong>{state.markets_requested} Saturdays</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Dates</span>
                <strong>{state.requested_dates?.join(', ')}</strong>
              </div>
              {state.needs_power && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Power</span>
                  <strong>Yes (+$15)</strong>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--gray-medium)',
                paddingTop: '12px',
                marginTop: '8px',
                fontSize: '18px'
              }}>
                <strong>Estimated Total</strong>
                <strong style={{ color: 'var(--maroon)' }}>${state.pricing.subtotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--gray-dark)'
        }}>
          Once approved, you'll receive an email with your vendor portal login. Your invoice will be available in the portal for payment.
        </p>
        <Link to="/" style={{
          display: 'inline-block',
          marginTop: '24px',
          padding: '16px 32px',
          fontSize: '16px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          background: 'var(--yellow)',
          color: 'var(--dark)',
          border: 'none',
          borderRadius: '50px',
          textTransform: 'uppercase',
          textDecoration: 'none'
        }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ApplyThankYou;
