import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const VendorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, false);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setError('');

    try {
      const res = await api.post('/auth/vendor/forgot-password', { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '32px',
            color: 'var(--maroon)',
            margin: '0 0 8px 0',
            textTransform: 'uppercase'
          }}>
            Vendor Portal
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--gray-dark)',
            margin: 0,
            fontSize: '16px'
          }}>
            Market on Main
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {forgotMessage && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: '#16a34a'
          }}>
            {forgotMessage}
          </div>
        )}

        {!showForgot ? (
          <>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--dark)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    border: '1px solid var(--gray-medium)',
                    borderRadius: '8px',
                    background: 'white',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--maroon)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-medium)'}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--dark)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    border: '1px solid var(--gray-medium)',
                    borderRadius: '8px',
                    background: 'white',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--maroon)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-medium)'}
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setError(''); setForgotMessage(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--maroon)',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--dark)',
                  background: 'var(--yellow)',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--gray-dark)',
              marginBottom: '20px',
              marginTop: 0
            }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--dark)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    border: '1px solid var(--gray-medium)',
                    borderRadius: '8px',
                    background: 'white',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--maroon)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-medium)'}
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--dark)',
                  background: 'var(--yellow)',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: forgotLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.2s',
                  opacity: forgotLoading ? 0.7 : 1
                }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setShowForgot(false); setError(''); setForgotMessage(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--maroon)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--maroon)',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            ← Back to Market on Main
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
