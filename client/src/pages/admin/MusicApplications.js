import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminMusicApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/music-applications');
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching music applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.put(`/music-applications/${id}`, { status });
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status } : app)
      );
      if (selectedApp?.id === id) {
        setSelectedApp(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.delete(`/music-applications/${id}`);
      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const contactedCount = applications.filter(a => a.status === 'contacted').length;
  const bookedCount = applications.filter(a => a.status === 'booked').length;
  const declinedCount = applications.filter(a => a.status === 'declined').length;

  const parseSocialHandles = (handles) => {
    if (!handles) return {};
    if (typeof handles === 'string') {
      try {
        return JSON.parse(handles);
      } catch {
        return {};
      }
    }
    return handles;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#FFD700', color: '#000', border: '#000' };
      case 'contacted': return { bg: '#e3f2fd', color: '#1976d2', border: '#1976d2' };
      case 'booked': return { bg: '#d4edda', color: '#28a745', border: '#28a745' };
      case 'declined': return { bg: '#f8d7da', color: '#E30613', border: '#E30613' };
      default: return { bg: '#eee', color: '#666', border: '#666' };
    }
  };

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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 48px)',
          color: '#000',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          Music Applications
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          {applications.length} total applications
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: applications.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'contacted', label: 'Contacted', count: contactedCount },
            { key: 'booked', label: 'Booked', count: bookedCount },
            { key: 'declined', label: 'Declined', count: declinedCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                padding: '10px 16px',
                background: filter === key ? '#FFD700' : '#fff',
                color: '#000',
                border: filter === key ? '3px solid #000' : '2px solid #000',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Applications List */}
        <div style={{ flex: selectedApp ? '0 0 400px' : '1' }}>
          <div style={{
            background: '#fff',
            border: '4px solid #000'
          }}>
            {filteredApps.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                fontFamily: "'Sora', sans-serif",
                color: '#666'
              }}>
                No applications found.
              </div>
            ) : (
              filteredApps.map((app, index) => {
                const statusStyle = getStatusColor(app.status);
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: index < filteredApps.length - 1 ? '2px solid #eee' : 'none',
                      cursor: 'pointer',
                      background: selectedApp?.id === app.id ? '#f5f5f5' : app.status === 'pending' ? '#fff9e6' : '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 700,
                          fontSize: '16px',
                          color: '#000'
                        }}>
                          {app.name}
                        </div>
                        <div style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: '13px',
                          color: '#666'
                        }}>
                          {app.email}
                        </div>
                        <div style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '4px'
                        }}>
                          {formatDate(app.created_at)}
                        </div>
                      </div>
                      <span style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: '10px',
                        padding: '4px 8px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `2px solid ${statusStyle.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedApp && (
          <div style={{ flex: 1 }}>
            <div style={{
              background: '#fff',
              border: '4px solid #000',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '24px',
                    margin: '0 0 4px 0'
                  }}>
                    {selectedApp.name}
                  </h2>
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Applied {formatDate(selectedApp.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 12px 0',
                  color: '#666'
                }}>
                  Contact Info
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px' }}>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${selectedApp.email}`} style={{ color: '#0056b3' }}>
                      {selectedApp.email}
                    </a>
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px' }}>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${selectedApp.phone}`} style={{ color: '#0056b3' }}>
                      {selectedApp.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(() => {
                const socials = parseSocialHandles(selectedApp.social_handles);
                const hasSocials = socials.facebook || socials.instagram || socials.x || socials.youtube;
                if (!hasSocials) return null;

                return (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      margin: '0 0 12px 0',
                      color: '#666'
                    }}>
                      Social Links
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {socials.facebook && (
                        <a
                          href={socials.facebook.startsWith('http') ? socials.facebook : `https://facebook.com/${socials.facebook.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: '13px',
                            padding: '6px 12px',
                            background: '#f5f5f5',
                            border: '2px solid #000',
                            color: '#000',
                            textDecoration: 'none'
                          }}
                        >
                          Facebook
                        </a>
                      )}
                      {socials.instagram && (
                        <a
                          href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: '13px',
                            padding: '6px 12px',
                            background: '#f5f5f5',
                            border: '2px solid #000',
                            color: '#000',
                            textDecoration: 'none'
                          }}
                        >
                          Instagram
                        </a>
                      )}
                      {socials.x && (
                        <a
                          href={`https://x.com/${socials.x.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: '13px',
                            padding: '6px 12px',
                            background: '#f5f5f5',
                            border: '2px solid #000',
                            color: '#000',
                            textDecoration: 'none'
                          }}
                        >
                          X/Twitter
                        </a>
                      )}
                      {socials.youtube && (
                        <a
                          href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/${socials.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: '13px',
                            padding: '6px 12px',
                            background: '#f5f5f5',
                            border: '2px solid #000',
                            color: '#000',
                            textDecoration: 'none'
                          }}
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Message */}
              {selectedApp.message && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: '0 0 12px 0',
                    color: '#666'
                  }}>
                    Message
                  </h3>
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '14px',
                    background: '#f5f5f5',
                    padding: '16px',
                    border: '2px solid #ddd',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedApp.message}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 12px 0',
                  color: '#666'
                }}>
                  Update Status
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['pending', 'contacted', 'booked', 'declined'].map(status => {
                    const style = getStatusColor(status);
                    const isActive = selectedApp.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedApp.id, status)}
                        disabled={updating || isActive}
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 700,
                          fontSize: '12px',
                          padding: '8px 16px',
                          background: isActive ? style.bg : '#fff',
                          color: isActive ? style.color : '#000',
                          border: `2px solid ${isActive ? style.border : '#000'}`,
                          cursor: isActive ? 'default' : 'pointer',
                          textTransform: 'uppercase',
                          opacity: updating ? 0.5 : 1
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteApplication(selectedApp.id)}
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '13px',
                  padding: '8px 16px',
                  background: '#fff',
                  color: '#E30613',
                  border: '2px solid #E30613',
                  cursor: 'pointer'
                }}
              >
                Delete Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMusicApplications;
