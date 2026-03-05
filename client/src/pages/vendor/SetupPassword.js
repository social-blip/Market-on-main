import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Check if token is expired on mount (decode without verifying)
  useState(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          setExpired(true);
        }
      } catch (e) {
        // malformed token, let the form submit handle it
      }
    }
  });

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/vendor/forgot-password', { email });
      setResent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/vendor/setup-password', {
        email,
        password,
        token
      });

      localStorage.setItem('token', response.data.token);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set up password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '20px'
      }}>
        <div className="card text-center" style={{ maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '16px' }}>Invalid Link</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            This password setup link is invalid or has expired.
            Please contact info@tfmarketonmain.com for assistance.
          </p>
          <Link to="/vendor/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Set Up Your Account</h1>
          <p style={{ color: '#666' }}>Create a password for {email}</p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {expired ? (
          <div style={{ textAlign: 'center' }}>
            {resent ? (
              <p style={{ color: '#16a34a', fontWeight: 600 }}>
                A new link has been sent to {email}. Check your inbox!
              </p>
            ) : (
              <>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  This link has expired.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Send Me a New Link'}
                </button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetupPassword;
