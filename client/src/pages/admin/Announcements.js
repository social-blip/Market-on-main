import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_public: false,
    send_email: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/all');
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await api.post('/announcements', formData);
      setFormData({ title: '', content: '', is_public: false, send_email: false });
      setShowForm(false);
      fetchAnnouncements();
      setMessage({ type: 'success', text: 'Announcement created!' + (formData.send_email ? ' Emails sent.' : '') });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create announcement.' });
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
      setMessage({ type: 'success', text: 'Deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 className="mb-1">Announcements</h1>
          <p style={{ color: 'var(--gray-dark)' }}>Communicate with vendors and the public</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}
        >
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      {showForm && (
        <div className="card mb-3">
          <h3 className="mb-2">Create Announcement</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 mb-3">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
                Show on public website
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.send_email}
                  onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                />
                Email vendors
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
          No announcements yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '16px',
                background: a.is_public ? 'var(--maroon)' : 'var(--dark)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {new Date(a.created_at).toLocaleString()}
                    {a.author_name && ` · ${a.author_name}`}
                  </div>
                </div>
                <span className="badge" style={{ background: a.is_public ? 'var(--yellow)' : 'white', color: 'var(--dark)' }}>
                  {a.is_public ? 'Public' : 'Vendors Only'}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: '16px' }}>{a.content}</p>
                <button onClick={() => deleteAnnouncement(a.id)} className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
