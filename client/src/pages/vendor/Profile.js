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
    facebook: '',
    instagram: '',
    x: '',
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
      let handles = { facebook: '', instagram: '', x: '' };
      try {
        const raw = response.data.social_handles;
        if (raw) {
          handles = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
      } catch {}
      setFormData({
        phone: response.data.phone || '',
        website: response.data.website || '',
        facebook: handles.facebook || '',
        instagram: handles.instagram || '',
        x: handles.x || '',
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
      const payload = {
        phone: formData.phone,
        website: formData.website,
        social_handles: JSON.stringify({ facebook: formData.facebook, instagram: formData.instagram, x: formData.x }),
        description: formData.description
      };
      const response = await api.put('/vendors/profile', payload);
      setProfile(response.data);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="vendor-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="vendor-page__header">
        <h1 className="vendor-page__title">My Profile</h1>
        <p className="vendor-page__subtitle">
          Manage your vendor information
        </p>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div className="vendor-card" style={{
          background: message.type === 'success' ? 'var(--cta-green)' : '#fee2e2',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>
            {message.type === 'success' ? '✓' : '!'}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: message.type === 'success' ? 'var(--black)' : '#991b1b'
          }}>
            {message.text}
          </span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {/* Business Info (Read Only) */}
        <div className="vendor-card">
          <div className="vendor-card__header">
            <h3 className="vendor-card__title">Business Information</h3>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--gray-dark)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            Contact us to update this information.
          </p>

          <div className="vendor-profile__field">
            <div className="vendor-profile__label">Business Name</div>
            <div className="vendor-profile__value">{profile?.business_name}</div>
          </div>

          <div className="vendor-profile__field">
            <div className="vendor-profile__label">Contact Name</div>
            <div className="vendor-profile__value">{profile?.contact_name}</div>
          </div>

          <div className="vendor-profile__field">
            <div className="vendor-profile__label">Email</div>
            <div className="vendor-profile__value">{profile?.email}</div>
          </div>

          <div className="vendor-profile__field">
            <div className="vendor-profile__label">Booth Size</div>
            <div className="vendor-profile__value">
              {profile?.booth_size === 'double' ? '20x10 Double Booth' : '10x10 Single Booth'}
            </div>
          </div>

          <div className="vendor-profile__field">
            <div className="vendor-profile__label">Needs Power</div>
            <div className="vendor-profile__value">{profile?.needs_power ? 'Yes' : 'No'}</div>
          </div>

          {profile?.is_nonprofit && (
            <span className="vendor-badge" style={{
              background: 'var(--maroon)',
              color: 'var(--white)',
              marginTop: '8px'
            }}>
              Nonprofit Organization
            </span>
          )}
        </div>

        {/* Editable Info */}
        <div className="vendor-card">
          <div className="vendor-card__header">
            <h3 className="vendor-card__title">Details</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="vendor-card__link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="vendor-form">
              <div className="vendor-form__group">
                <label className="vendor-form__label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="vendor-form__input"
                />
              </div>

              <div className="vendor-form__group">
                <label className="vendor-form__label">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="yourwebsite.com"
                  className="vendor-form__input"
                />
              </div>

              <div className="vendor-form__group">
                <label className="vendor-form__label">Facebook</label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="facebook.com/yourpage"
                  className="vendor-form__input"
                />
              </div>

              <div className="vendor-form__group">
                <label className="vendor-form__label">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="instagram.com/yourpage"
                  className="vendor-form__input"
                />
              </div>

              <div className="vendor-form__group">
                <label className="vendor-form__label">X / Twitter</label>
                <input
                  type="text"
                  value={formData.x}
                  onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                  placeholder="x.com/yourhandle"
                  className="vendor-form__input"
                />
              </div>

              <div className="vendor-form__group">
                <label className="vendor-form__label">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your products or services..."
                  className="vendor-form__textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="vendor-form__btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="vendor-form__btn vendor-form__btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="vendor-profile__field">
                <div className="vendor-profile__label">Phone</div>
                <div className="vendor-profile__value" style={{ color: profile?.phone ? 'var(--black)' : 'var(--gray-medium)' }}>
                  {profile?.phone || 'Not provided'}
                </div>
              </div>

              <div className="vendor-profile__field">
                <div className="vendor-profile__label">Website</div>
                <div className="vendor-profile__value">
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--gray-medium)' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div className="vendor-profile__field">
                <div className="vendor-profile__label">Social Media</div>
                <div className="vendor-profile__value">
                  {(() => {
                    let handles = {};
                    try {
                      const raw = profile?.social_handles;
                      if (raw) handles = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch {}
                    const hasAny = handles.facebook || handles.instagram || handles.x;
                    if (!hasAny) return <span style={{ color: 'var(--gray-medium)' }}>Not provided</span>;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {handles.facebook && <span><strong>FB:</strong> {handles.facebook}</span>}
                        {handles.instagram && <span><strong>IG:</strong> {handles.instagram}</span>}
                        {handles.x && <span><strong>X:</strong> {handles.x}</span>}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="vendor-profile__field">
                <div className="vendor-profile__label">Description</div>
                <div className="vendor-profile__value" style={{
                  color: profile?.description ? 'var(--black)' : 'var(--gray-medium)',
                  lineHeight: 1.6
                }}>
                  {profile?.description || 'Not provided'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Section */}
      <div className="vendor-card" style={{ marginTop: '24px' }}>
        <div className="vendor-card__header">
          <div>
            <h3 className="vendor-card__title">Photos</h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--gray-dark)',
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
              className="vendor-form__btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {uploadingPhotos ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  Uploading...
                </>
              ) : (
                'Upload Photos'
              )}
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--gray-light)',
            borderRadius: '12px',
            border: '2px dashed var(--border-light)'
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--gray-dark)',
              margin: 0
            }}>
              No photos uploaded yet. Upload photos to showcase your products and booth setup.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className="vendor-photo"
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  border: heroPhoto === photo ? '3px solid var(--maroon)' : '1px solid var(--border-light)',
                  background: 'var(--gray-light)',
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
                    background: 'var(--maroon)',
                    color: 'var(--white)',
                    padding: '4px 10px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderRadius: '100px'
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
                  gap: '1px',
                  background: 'var(--border-light)'
                }}>
                  {heroPhoto !== photo && (
                    <button
                      onClick={() => handleSetHero(photo)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'var(--white)',
                        color: 'var(--black)',
                        border: 'none',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        fontSize: '11px',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      Set Hero
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    style={{
                      flex: heroPhoto === photo ? 1 : 0,
                      minWidth: heroPhoto === photo ? 'auto' : '44px',
                      padding: '10px',
                      background: heroPhoto === photo ? 'var(--white)' : '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {heroPhoto === photo ? 'Delete' : '×'}
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
