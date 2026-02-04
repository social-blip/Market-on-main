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
      setMessage({ type: 'success', text: 'Announcement created successfully!' + (formData.send_email ? ' Emails sent to vendors.' : '') });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create announcement.' });
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
      setMessage({ type: 'success', text: 'Announcement deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete announcement.' });
    }
  };

  const publicCount = announcements.filter(a => a.is_public).length;
  const vendorOnlyCount = announcements.filter(a => !a.is_public).length;

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 48px)',
            color: '#000',
            margin: '0 0 8px 0',
            textTransform: 'uppercase'
          }}>
            Announcements
          </h1>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '18px',
            color: '#666',
            margin: 0
          }}>
            Communicate with vendors and the public
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '14px',
            padding: '14px 24px',
            background: showForm ? '#fff' : '#FFD700',
            color: '#000',
            border: '4px solid #000',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#FFD700',
          border: '4px solid #000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {announcements.length}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total
          </div>
        </div>
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {publicCount}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Public
          </div>
        </div>
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#000'
          }}>
            {vendorOnlyCount}
          </div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Vendor Only
          </div>
        </div>
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

      {/* Create Form */}
      {showForm && (
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px',
          marginBottom: '24px'
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
            Create Announcement
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '14px',
                  border: '3px solid #000',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                Content
              </label>
              <textarea
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '14px',
                  border: '3px solid #000',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <label style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                Show on public website
              </label>

              <label style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.send_email}
                  onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                Send email to all active vendors
              </label>
            </div>

            <button
              type="submit"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                padding: '14px 32px',
                background: '#FFD700',
                color: '#000',
                border: '4px solid #000',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Create Announcement
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {announcements.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '4px solid #000',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              color: '#666',
              margin: 0
            }}>
              No announcements yet. Create one to get started.
            </p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              style={{
                background: '#fff',
                border: '4px solid #000',
                overflow: 'hidden'
              }}
            >
              {/* Announcement Header */}
              <div style={{
                background: announcement.is_public ? '#FFD700' : '#000',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '18px',
                    color: announcement.is_public ? '#000' : '#fff',
                    margin: 0
                  }}>
                    {announcement.title}
                  </h3>
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '12px',
                    color: announcement.is_public ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                    marginTop: '4px'
                  }}>
                    {new Date(announcement.created_at).toLocaleString()}
                    {announcement.author_name && ` • ${announcement.author_name}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 12px',
                    background: announcement.is_public ? '#fff' : '#FFD700',
                    color: '#000',
                    border: '2px solid #000',
                    textTransform: 'uppercase'
                  }}>
                    {announcement.is_public ? 'Public' : 'Vendors Only'}
                  </span>
                </div>
              </div>

              {/* Announcement Content */}
              <div style={{ padding: '20px' }}>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  margin: '0 0 20px 0'
                }}>
                  {announcement.content}
                </p>

                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '10px 20px',
                    background: '#fff',
                    color: '#E30613',
                    border: '3px solid #E30613',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
