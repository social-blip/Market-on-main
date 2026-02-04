import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const VendorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Photo state
  const [photos, setPhotos] = useState([]);
  const [heroPhoto, setHeroPhoto] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    phone: '',
    website: '',
    social_handles: '',
    description: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchPhotos();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/vendors/profile');
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        website: response.data.website || '',
        social_handles: response.data.social_handles || '',
        description: response.data.description || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/vendors/photos');
      setPhotos(response.data.images || []);
      setHeroPhoto(response.data.image_url || null);
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const response = await api.post('/vendors/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos(response.data.images || []);
      setHeroPhoto(response.data.image_url || null);
      setMessage({ type: 'success', text: 'Photos uploaded successfully!' });
    } catch (err) {
      console.error('Error uploading photos:', err);
      setMessage({ type: 'error', text: 'Failed to upload photos. Please try again.' });
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetHero = async (imageUrl) => {
    try {
      const response = await api.put('/vendors/photos/hero', { image_url: imageUrl });
      setHeroPhoto(response.data.image_url);
      setMessage({ type: 'success', text: 'Hero photo updated!' });
    } catch (err) {
      console.error('Error setting hero photo:', err);
      setMessage({ type: 'error', text: 'Failed to set hero photo.' });
    }
  };

  const handleDeletePhoto = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await api.delete('/vendors/photos', { data: { image_url: imageUrl } });
      setPhotos(response.data.images || []);
      setHeroPhoto(response.data.image_url || null);
      setMessage({ type: 'success', text: 'Photo deleted.' });
    } catch (err) {
      console.error('Error deleting photo:', err);
      setMessage({ type: 'error', text: 'Failed to delete photo.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/vendors/profile', formData);
      setProfile(response.data);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontFamily: "'Sora', sans-serif",
    fontSize: '16px',
    border: '3px solid #000',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    color: '#000',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: '#000',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          My Profile
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#666',
          margin: 0
        }}>
          Manage your vendor information
        </p>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div style={{
          background: message.type === 'success' ? '#e8f5e9' : '#fee',
          border: `4px solid ${message.type === 'success' ? '#4CAF50' : '#E30613'}`,
          padding: '16px 20px',
          marginBottom: '24px',
          fontFamily: "'Sora', sans-serif",
          fontSize: '14px',
          color: message.type === 'success' ? '#2e7d32' : '#E30613'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Business Info (Read Only) */}
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
            margin: '0 0 8px 0',
            textTransform: 'uppercase'
          }}>
            Business Information
          </h3>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            color: '#666',
            fontSize: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '3px solid #000',
            margin: '0 0 24px 0'
          }}>
            Contact us to update this information.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>Business Name</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#000'
            }}>{profile?.business_name}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>Contact Name</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#000'
            }}>{profile?.contact_name}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>Email</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#000'
            }}>{profile?.email}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>Booth Size</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#000'
            }}>{profile?.booth_size === 'double' ? '20x10 Double Booth' : '10x10 Single Booth'}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>Needs Power</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#000'
            }}>{profile?.needs_power ? 'Yes' : 'No'}</div>
          </div>

          {profile?.is_nonprofit && (
            <span style={{
              display: 'inline-block',
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              padding: '8px 14px',
              background: '#0056b3',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Nonprofit Organization
            </span>
          )}
        </div>

        {/* Editable Info */}
        <div style={{
          background: '#fff',
          border: '4px solid #000',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '3px solid #000'
          }}>
            <h3 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              color: '#000',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              Contact Details
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '8px 16px',
                  background: '#fff',
                  color: '#000',
                  border: '3px solid #000',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Social Media Handles</label>
                <input
                  type="text"
                  value={formData.social_handles}
                  onChange={(e) => setFormData({ ...formData, social_handles: e.target.value })}
                  placeholder="@instagram, facebook.com/page"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your products or services..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '12px 24px',
                    background: '#FFD700',
                    color: '#000',
                    border: '3px solid #000',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '12px 24px',
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
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>Phone</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '16px',
                  color: profile?.phone ? '#000' : '#999'
                }}>{profile?.phone || 'Not provided'}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>Website</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '16px',
                  color: profile?.website ? '#000' : '#999'
                }}>
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#000', textDecoration: 'underline' }}
                    >
                      {profile.website}
                    </a>
                  ) : 'Not provided'}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>Social Media</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '16px',
                  color: profile?.social_handles ? '#000' : '#999'
                }}>{profile?.social_handles || 'Not provided'}</div>
              </div>

              <div>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>Description</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '16px',
                  color: profile?.description ? '#000' : '#999',
                  lineHeight: 1.6
                }}>{profile?.description || 'Not provided'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Section */}
      <div style={{
        background: '#fff',
        border: '4px solid #000',
        padding: '24px',
        marginTop: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '3px solid #000'
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              color: '#000',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              Photos
            </h3>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              color: '#666',
              margin: '8px 0 0 0'
            }}>
              Upload photos of your products and booth. The hero photo will be displayed on the vendors page.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhotos}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                fontSize: '12px',
                padding: '10px 20px',
                background: '#FFD700',
                color: '#000',
                border: '3px solid #000',
                cursor: uploadingPhotos ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: uploadingPhotos ? 0.7 : 1
              }}
            >
              {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#f5f5f0',
            border: '3px dashed #ccc'
          }}>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              color: '#666',
              margin: 0
            }}>
              No photos uploaded yet. Upload photos to showcase your products and booth setup.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {photos.map((photo, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  border: heroPhoto === photo ? '4px solid #FFD700' : '3px solid #000',
                  background: '#f5f5f0',
                  aspectRatio: '1',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={`${API_URL}${photo}`}
                  alt={`Vendor photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {heroPhoto === photo && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#FFD700',
                    color: '#000',
                    padding: '4px 8px',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '2px solid #000'
                  }}>
                    Hero
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  gap: '0'
                }}>
                  {heroPhoto !== photo && (
                    <button
                      onClick={() => handleSetHero(photo)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#FFD700',
                        color: '#000',
                        border: 'none',
                        borderTop: '3px solid #000',
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 600,
                        fontSize: '11px',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      Set as Hero
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    style={{
                      flex: heroPhoto === photo ? 1 : 0,
                      minWidth: heroPhoto === photo ? 'auto' : '40px',
                      padding: '8px',
                      background: '#E30613',
                      color: '#fff',
                      border: 'none',
                      borderTop: '3px solid #000',
                      borderLeft: heroPhoto !== photo ? '3px solid #000' : 'none',
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {heroPhoto === photo ? 'Delete' : 'X'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfile;
