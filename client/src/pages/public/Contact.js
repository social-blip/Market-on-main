import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    reason: searchParams.get('reason') || '',
    question: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.name && formData.email && formData.reason && formData.question;

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        padding: '40px 20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(36px, 8vw, 56px)',
            color: 'var(--maroon)',
            margin: '0 0 24px 0',
            textTransform: 'uppercase'
          }}>
            Message Sent!
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'var(--dark)',
            marginBottom: '24px'
          }}>
            Thanks for reaching out! We'll get back to you as soon as possible.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px 32px',
              background: 'var(--yellow)',
              color: 'var(--dark)',
              borderRadius: '50px',
              textDecoration: 'none',
              textTransform: 'uppercase'
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        padding: '140px 20px 60px',
        textAlign: 'center',
        background: 'var(--maroon)'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(48px, 10vw, 100px)',
          color: 'var(--cream)',
          margin: '0 0 24px 0',
          textTransform: 'uppercase',
          lineHeight: 1
        }}>
          Contact Us
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'var(--cream)',
          maxWidth: '500px',
          margin: '0 auto',
          opacity: 0.95
        }}>
          Have a question? We'd love to hear from you.
        </p>
      </section>

      {/* Form Section */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              fontFamily: 'var(--font-body)',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="2088675309"
                  style={inputStyle}
                />
              </div>

              {/* Reason Dropdown */}
              <div>
                <label style={labelStyle}>I have a question about... *</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                  required
                >
                  <option value="">Select an option</option>
                  <option value="Being a Vendor">Being a Vendor</option>
                  <option value="Sponsoring">Sponsoring</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Performing at the Market">Performing at the Market</option>
                  <option value="Learning More">Learning More</option>
                </select>
              </div>

              {/* Question */}
              <div>
                <label style={labelStyle}>Your Question *</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              style={{
                width: '100%',
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
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                opacity: isValid && !loading ? 1 : 0.5,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Contact Info */}
          <div style={{
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--gray-dark)',
              marginBottom: '8px'
            }}>
              Or email us directly at
            </p>
            <a
              href="mailto:info@tfmarketonmain.com"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--maroon)',
                textDecoration: 'none'
              }}
            >
              info@tfmarketonmain.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Styles
const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '14px',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--dark)'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid var(--gray-medium)',
  borderRadius: '8px',
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
};

export default Contact;
