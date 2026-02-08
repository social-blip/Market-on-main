import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

const CATEGORY_LABELS = {
  growers: 'Grower',
  makers: 'Maker',
  eats: 'Eats',
  finds: 'Finds'
};

const VendorDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await api.get(`/vendors/public/${id}`);
      setVendor(response.data);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAllImages = () => {
    const images = [];
    if (vendor.image_url) {
      images.push(vendor.image_url);
    }
    if (vendor.images && Array.isArray(vendor.images)) {
      // Only add images that aren't already the hero image
      vendor.images.forEach(img => {
        if (img !== vendor.image_url) {
          images.push(img);
        }
      });
    }
    return images;
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const images = getAllImages();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const images = getAllImages();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'ArrowLeft') prevImage(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)'
      }}>
        <span className="spinner"></span>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '48px',
          marginBottom: '20px',
          color: 'var(--maroon)'
        }}>
          Vendor Not Found
        </h1>
        <Link
          to="/vendors"
          style={{
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
          Back to Vendors
        </Link>
      </div>
    );
  }

  const images = getAllImages();

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)'
            }}
          >
            ✕
          </button>

          {/* Previous Button */}
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--yellow)',
              border: 'none',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)'
            }}
          >
            ←
          </button>

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${vendor.business_name} ${lightboxIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Next Button */}
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--yellow)',
              border: 'none',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)'
            }}
          >
            →
          </button>

          {/* Image Counter */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--maroon)',
            color: 'white',
            padding: '10px 20px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '16px',
            borderRadius: '50px'
          }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        background: 'var(--maroon)',
        padding: '120px 20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            borderRadius: '16px 16px 0 0',
            background: 'white',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Hero Image */}
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={vendor.business_name}
                onClick={() => openLightbox(0)}
                style={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'pointer'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '450px',
                background: 'linear-gradient(135deg, var(--cream) 0%, #e8e4dc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '120px',
                  color: 'rgba(0,0,0,0.1)'
                }}>
                  {vendor.business_name.charAt(0)}
                </span>
              </div>
            )}

            {/* Name Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              padding: '24px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--dark)',
                background: 'var(--yellow)',
                padding: '8px 16px',
                borderRadius: '50px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                {CATEGORY_LABELS[vendor.category] || 'Vendor'}
              </span>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 5vw, 56px)',
                color: 'white',
                margin: 0,
                textTransform: 'uppercase'
              }}>
                {vendor.business_name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Left Column - About */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              background: 'var(--maroon)',
              padding: '16px 24px'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                margin: 0,
                textTransform: 'uppercase',
                color: 'var(--cream)'
              }}>
                About the {CATEGORY_LABELS[vendor.category] || 'Vendor'}
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.7,
                margin: 0,
                color: 'var(--gray-dark)'
              }}>
                {vendor.description || 'Local vendor at Market on Main.'}
              </p>
            </div>
          </div>

          {/* Right Column - Info Boxes */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Next Market Day */}
            {(() => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const futureDates = vendor.upcoming_dates
                ?.filter(d => new Date(d.date.split('T')[0] + 'T12:00:00') >= now)
                .sort((a, b) => new Date(a.date.split('T')[0] + 'T12:00:00') - new Date(b.date.split('T')[0] + 'T12:00:00'));
              const nextDate = futureDates?.[0];

              if (nextDate) {
                return (
                  <div style={{
                    background: 'var(--yellow)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '14px',
                      margin: '0 0 8px 0',
                      textTransform: 'uppercase',
                      color: 'var(--dark)'
                    }}>
                      Next Market Day
                    </h3>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '32px',
                      color: 'var(--dark)'
                    }}>
                      {new Date(nextDate.date.split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* All Market Days */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                background: 'var(--dark)',
                padding: '16px 24px'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '16px',
                  margin: 0,
                  textTransform: 'uppercase',
                  color: 'white'
                }}>
                  All Market Days
                </h3>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {vendor.upcoming_dates && vendor.upcoming_dates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      // Group dates by month
                      const grouped = {};
                      vendor.upcoming_dates.forEach(d => {
                        const date = new Date(d.date.split('T')[0] + 'T12:00:00');
                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                        if (!grouped[month]) grouped[month] = [];
                        grouped[month].push(date.getDate());
                      });

                      return Object.entries(grouped).map(([month, days]) => (
                        <div key={month} style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '15px',
                          color: 'var(--gray-dark)'
                        }}>
                          <strong style={{ color: 'var(--dark)' }}>{month}:</strong> {days.join(', ')}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    margin: 0,
                    color: 'var(--gray-dark)'
                  }}>
                    Schedule coming soon
                  </p>
                )}
              </div>
            </div>

            {/* Booth Location - only show if available */}
            {vendor.booth_location && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  color: 'var(--gray-dark)'
                }}>
                  Find Us at Booth
                </h3>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '48px',
                  color: 'var(--maroon)'
                }}>
                  {vendor.booth_location}
                </div>
              </div>
            )}

            {/* Contact & Social */}
            {(vendor.website || vendor.social_handles) && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  background: 'var(--dark)',
                  padding: '16px 24px'
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '16px',
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'white'
                  }}>
                    Connect
                  </h3>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  {vendor.website && (
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      margin: '0 0 12px 0'
                    }}>
                      <strong style={{ color: 'var(--dark)' }}>Website:</strong>{' '}
                      <a
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                      >
                        {vendor.website.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                  {vendor.social_handles && (() => {
                    try {
                      const handles = typeof vendor.social_handles === 'string'
                        ? JSON.parse(vendor.social_handles)
                        : vendor.social_handles;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {handles.facebook && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', margin: 0 }}>
                              <strong style={{ color: 'var(--dark)' }}>Facebook:</strong>{' '}
                              <a
                                href={handles.facebook.includes('http') ? handles.facebook : `https://facebook.com/${handles.facebook.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                              >
                                {handles.facebook}
                              </a>
                            </p>
                          )}
                          {handles.instagram && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', margin: 0 }}>
                              <strong style={{ color: 'var(--dark)' }}>Instagram:</strong>{' '}
                              <a
                                href={`https://instagram.com/${handles.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                              >
                                {handles.instagram}
                              </a>
                            </p>
                          )}
                          {handles.x && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', margin: 0 }}>
                              <strong style={{ color: 'var(--dark)' }}>X:</strong>{' '}
                              <a
                                href={`https://x.com/${handles.x.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--maroon)', textDecoration: 'underline' }}
                              >
                                {handles.x}
                              </a>
                            </p>
                          )}
                        </div>
                      );
                    } catch {
                      return (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', margin: 0 }}>
                          <strong style={{ color: 'var(--dark)' }}>Social:</strong> {vendor.social_handles}
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      {images.length > 1 && (
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px 40px'
        }}>
          {/* Gallery Header */}
          <div style={{
            background: 'var(--dark)',
            padding: '16px 24px',
            borderRadius: '16px 16px 0 0'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              margin: 0,
              textTransform: 'uppercase',
              color: 'white',
              textAlign: 'center'
            }}>
              Photo Gallery
            </h2>
          </div>

          {/* Gallery Grid */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '0 0 16px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(idx)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={img}
                    alt={`${vendor.business_name} ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Button */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px 60px'
      }}>
        <Link
          to="/vendors"
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px 32px',
            background: 'var(--yellow)',
            color: 'var(--dark)',
            borderRadius: '50px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}
        >
          ← Back to All Vendors
        </Link>
      </section>
    </div>
  );
};

export default VendorDetail;
