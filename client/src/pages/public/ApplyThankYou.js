import React from 'react';

const ApplyThankYou = () => {
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
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--gray-dark)'
        }}>
          Once approved, you'll receive an email with your vendor portal login. Your invoice will be available in the portal for payment.
        </p>
      </div>
    </div>
  );
};

export default ApplyThankYou;
