import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/contact/submissions');
      setSubmissions(response.data);
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const reasons = ['all', 'Being a Vendor', 'Sponsoring', 'Volunteering', 'Performing', 'Learning More'];

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.reason === filter;
  });

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1">Contact Submissions</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>Messages from the contact form</p>

      {/* Filters */}
      <div className="card mb-3">
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          {reasons.map(reason => {
            const count = reason === 'all' ? submissions.length : submissions.filter(s => s.reason === reason).length;
            return (
              <button
                key={reason}
                onClick={() => setFilter(reason)}
                className={filter === reason ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                {reason === 'all' ? 'All' : reason} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Reason</th>
              <th>Question</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                  No submissions found.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map(sub => (
                <tr key={sub.id}>
                  <td style={{ fontSize: '13px', color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{sub.name}</td>
                  <td>
                    <a href={`mailto:${sub.email}`} style={{ color: 'var(--maroon)' }}>{sub.email}</a>
                  </td>
                  <td style={{ fontSize: '13px' }}>{sub.phone || '--'}</td>
                  <td>
                    <span className="badge">{sub.reason}</span>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '300px' }}>{sub.question}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactSubmissions;
