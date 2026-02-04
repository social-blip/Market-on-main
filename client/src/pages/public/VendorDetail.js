import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const CATEGORY_LABELS = {
  growers: 'Grower',
  makers: 'Maker',
  eats: 'Eats',
  vintage: 'Vintage & Finds'
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
      images.push(...vendor.images);
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
        background: '#f5f5f0'
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
        background: '#f5f5f0',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          Vendor Not Found
        </h1>
        <Link
          to="/vendors"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            padding: '16px 32px',
            background: '#FFD700',
            color: '#000',
            border: '4px solid #000',
            textDecoration: 'none'
          }}
        >
          Back to Vendors
        </Link>
      </div>
    );
  }

  const images = getAllImages();

  return (
    <div style={{ background: '#f5f5f0', minHeight: '100vh' }}>
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
              background: '#fff',
              border: '4px solid #000',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Bricolage Grotesque', sans-serif"
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
              background: '#FFD700',
              border: '4px solid #000',
              width: '60px',
              height: '60px',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Bricolage Grotesque', sans-serif"
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
              border: '5px solid #fff'
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
              background: '#FFD700',
              border: '4px solid #000',
              width: '60px',
              height: '60px',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Bricolage Grotesque', sans-serif"
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
            background: '#000',
            color: '#fff',
            padding: '10px 20px',
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            border: '3px solid #fff'
          }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
      {/* Hero Image with Vendor Name Overlay */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px 0'
      }}>
        <div style={{
          border: '5px solid #000',
          background: '#fff',
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
              background: 'linear-gradient(135deg, #f5f5f0 0%, #e0e0d8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
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
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 56px)',
              color: '#fff',
              margin: 0,
              textTransform: 'uppercase',
              background: '#000',
              padding: '10px 20px',
              display: 'inline-block'
            }}>
              {vendor.business_name}
            </h1>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '16px',
              color: '#000',
              background: '#FFD700',
              padding: '8px 16px',
              textTransform: 'uppercase',
              marginTop: '8px',
              border: '3px solid #000'
            }}>
              {CATEGORY_LABELS[vendor.category] || 'Vendor'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Left Column - About */}
          <div style={{
            background: '#fff',
            border: '4px solid #000'
          }}>
            <div style={{
              background: '#FFD700',
              padding: '12px 20px',
              borderBottom: '4px solid #000'
            }}>
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                margin: 0,
                textTransform: 'uppercase'
              }}>
                About the {CATEGORY_LABELS[vendor.category] || 'Vendor'}
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '18px',
                lineHeight: 1.6,
                margin: 0,
                color: '#000'
              }}>
                {vendor.description || 'Local vendor at Market on Main.'}
              </p>
            </div>
          </div>

          {/* Right Column - Info Boxes */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Next Market Day */}
            {(() => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const futureDates = vendor.upcoming_dates
                ?.filter(d => new Date(d.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
              const nextDate = futureDates?.[0];

              if (nextDate) {
                return (
                  <div style={{
                    background: '#FFD700',
                    border: '4px solid #000'
                  }}>
                    <div style={{
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 800,
                        fontSize: '14px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}>
                        Next Market Day
                      </h3>
                      <div style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 800,
                        fontSize: '28px'
                      }}>
                        {new Date(nextDate.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* All Market Days */}
            <div style={{
              background: '#fff',
              border: '4px solid #000'
            }}>
              <div style={{
                background: '#000',
                padding: '12px 20px'
              }}>
                <h3 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '18px',
                  margin: 0,
                  textTransform: 'uppercase',
                  color: '#fff'
                }}>
                  All Market Days
                </h3>
              </div>
              <div style={{ padding: '16px' }}>
                {vendor.upcoming_dates && vendor.upcoming_dates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      // Group dates by month
                      const grouped = {};
                      vendor.upcoming_dates.forEach(d => {
                        const date = new Date(d.date);
                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                        if (!grouped[month]) grouped[month] = [];
                        grouped[month].push(date.getDate());
                      });

                      return Object.entries(grouped).map(([month, days]) => (
                        <div key={month} style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: '16px'
                        }}>
                          <strong>{month}:</strong> {days.join(', ')}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '16px',
                    margin: 0,
                    color: '#666'
                  }}>
                    Schedule coming soon
                  </p>
                )}
              </div>
            </div>

            {/* Booth Location - only show if available */}
            {vendor.booth_location && (
              <div style={{
                background: '#fff',
                border: '4px solid #000'
              }}>
                <div style={{
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '18px',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase'
                  }}>
                    Find Us at Booth
                  </h3>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '48px'
                  }}>
                    {vendor.booth_location}
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Social */}
            {(vendor.website || vendor.social_handles) && (
              <div style={{
                background: '#fff',
                border: '4px solid #000'
              }}>
                <div style={{
                  background: '#000',
                  padding: '12px 20px'
                }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '18px',
                    margin: 0,
                    textTransform: 'uppercase',
                    color: '#fff'
                  }}>
                    Contact & Social
                  </h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {vendor.website && (
                    <p style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '16px',
                      margin: '0 0 8px 0'
                    }}>
                      <strong>WEBSITE:</strong>{' '}
                      <a
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#000', textDecoration: 'underline' }}
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
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', margin: 0 }}>
                              <strong>FACEBOOK:</strong>{' '}
                              <a
                                href={handles.facebook.includes('http') ? handles.facebook : `https://facebook.com/${handles.facebook.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#000', textDecoration: 'underline' }}
                              >
                                {handles.facebook}
                              </a>
                            </p>
                          )}
                          {handles.instagram && (
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', margin: 0 }}>
                              <strong>INSTAGRAM:</strong>{' '}
                              <a
                                href={`https://instagram.com/${handles.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#000', textDecoration: 'underline' }}
                              >
                                {handles.instagram}
                              </a>
                            </p>
                          )}
                          {handles.x && (
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', margin: 0 }}>
                              <strong>X:</strong>{' '}
                              <a
                                href={`https://x.com/${handles.x.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#000', textDecoration: 'underline' }}
                              >
                                {handles.x}
                              </a>
                            </p>
                          )}
                        </div>
                      );
                    } catch {
                      // Fallback for old string format
                      return (
                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', margin: 0 }}>
                          <strong>SOCIAL:</strong> {vendor.social_handles}
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
      {images.length > 0 && (
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px 40px'
        }}>
          {/* Gallery Header */}
          <div style={{
            background: '#000',
            padding: '12px 20px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              margin: 0,
              textTransform: 'uppercase',
              color: '#fff',
              textAlign: 'center'
            }}>
              Photo Gallery
            </h2>
          </div>

          {/* Gallery Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {images.slice(0, 6).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                style={{
                  border: '4px solid #000',
                  background: '#fff',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    e.currentTarget.style.transform = 'translate(-3px, -3px)';
                    e.currentTarget.style.boxShadow = '5px 5px 0px #000';
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
                    height: '200px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{ height: '5px', background: '#000' }}></div>
      </div>

      {/* Back Button */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <Link
          to="/vendors"
          style={{
            display: 'block',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            padding: '16px 32px',
            background: '#FFD700',
            color: '#000',
            border: '4px solid #000',
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
