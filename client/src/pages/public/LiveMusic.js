import React, { useState } from 'react';
import api from '../../api/client';

const LiveMusic = () => {
  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    x_handle: '',
    youtube: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Schedule data with band info
  const schedule = [
    { date: 'June 6', dayOfWeek: 'Saturday', slot1: null, slot2: { name: 'Paige and Morgan', url: '#' } },
    { date: 'June 13', dayOfWeek: 'Saturday', slot1: null, slot2: { name: 'Avery Soloaga', url: '#' } },
    { date: 'June 20', dayOfWeek: 'Saturday', slot1: null, slot2: { name: 'Devon Tyler', url: '#' } },
    { date: 'June 27', dayOfWeek: 'Saturday', slot1: null, slot2: { name: 'Cliftonite Acoustics', url: '#' } },
    { date: 'July 4', dayOfWeek: 'Friday', slot1: null, slot2: null },
    { date: 'July 11', dayOfWeek: 'Saturday', slot1: { name: 'Cliftonite Acoustics', url: '#' }, slot2: { name: 'Avery Soloaga', url: '#' } },
    { date: 'July 18', dayOfWeek: 'Saturday', slot1: null, slot2: null },
    { date: 'July 25', dayOfWeek: 'Saturday', slot1: { name: 'Paige and Morgan', url: '#' }, slot2: { name: 'Devon Tyler', url: '#' } },
    { date: 'August 1', dayOfWeek: 'Saturday', slot1: { name: 'Paige and Morgan', url: '#' }, slot2: { name: 'Avery Soloaga', url: '#' } },
    { date: 'August 8', dayOfWeek: 'Saturday', slot1: { name: 'Cliftonite Acoustics', url: '#' }, slot2: { name: 'Devon Tyler', url: '#' } },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/music-applications/submit', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // Reset form if it was submitted
    if (submitted) {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        facebook: '',
        instagram: '',
        x_handle: '',
        youtube: '',
        message: ''
      });
    }
  };

  const renderSlot = (band) => {
    if (band) {
      return (
        <a
          href={band.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0056b3',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {band.name}
          <span style={{ fontSize: '14px' }}>→</span>
        </a>
      );
    }
    return (
      <span style={{ color: '#999', fontStyle: 'italic' }}>OPEN</span>
    );
  };

  // Styles
  const labelStyle = {
    display: 'block',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '3px solid #000',
    fontFamily: "'Sora', sans-serif",
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div>
      {/* ===== HERO SECTION (Red) ===== */}
      <section style={{
        background: '#E30613',
        padding: '40px 20px 80px 20px',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(60px, 12vw, 150px)',
            color: '#fff',
            margin: '0 0 24px 0',
            lineHeight: 1,
            letterSpacing: '-2px'
          }}>
            The Soundtrack<br />to Saturday
          </h1>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#fff',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Every market day, local artists take the stage and bring the energy.
            From acoustic sets to full bands, there's always something playing.
          </p>
        </div>
      </section>

      {/* ===== SCHEDULE SECTION (White) ===== */}
      <section style={{
        background: '#fff',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 8vw, 72px)',
            color: '#0056b3',
            textAlign: 'center',
            margin: '0 0 50px 0',
            lineHeight: 1,
            letterSpacing: '0.04em'
          }}>
            2026 Schedule
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {schedule.map((day) => (
              <div
                key={day.date}
                style={{
                  border: '4px solid #000',
                  background: '#fff',
                  overflow: 'hidden'
                }}
              >
                {/* Date Header */}
                <div style={{
                  background: '#FFD700',
                  padding: '16px 20px',
                  borderBottom: '4px solid #000'
                }}>
                  <div style={{
                    fontFamily: "'Archivo Black', sans-serif",
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#000'
                  }}>
                    {day.dayOfWeek}
                  </div>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#000'
                  }}>
                    {day.date}
                  </div>
                </div>

                {/* Time Slots */}
                <div style={{ padding: '0' }}>
                  {/* Slot 1 */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '2px solid #eee'
                  }}>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '4px'
                    }}>
                      9:00 - 11:30 AM
                    </div>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '18px'
                    }}>
                      {renderSlot(day.slot1)}
                    </div>
                  </div>

                  {/* Slot 2 */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '4px'
                    }}>
                      11:30 AM - 2:00 PM
                    </div>
                    <div style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '18px'
                    }}>
                      {renderSlot(day.slot2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Want to Play CTA Card */}
            <div
              style={{
                border: '4px solid #000',
                background: '#E30613',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '32px 24px',
                textAlign: 'center'
              }}
            >
              <h3 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '32px',
                color: '#fff',
                margin: '0 0 12px 0',
                lineHeight: 1.1
              }}>
                Want to Play?
              </h3>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px',
                color: '#fff',
                margin: '0 0 20px 0',
                lineHeight: 1.5
              }}>
                We're always looking for talented local musicians to perform at the market. Fill out our request form and we'll be in touch!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="brutal-btn"
                style={{
                  background: '#FFD700',
                  color: '#000',
                  border: '4px solid #000',
                  padding: '14px 28px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  alignSelf: 'center'
                }}
              >
                Apply to Perform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPONSORS SECTION (Blue) ===== */}
      <section className="brutal-section brutal-section-blue">
        <h2 className="brutal-section-heading brutal-section-heading-white" style={{
          fontSize: 'clamp(48px, 10vw, 100px)',
          marginBottom: '10px',
          letterSpacing: '0.08em'
        }}>
          Made Possible By
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#fff',
          fontFamily: "'Sora', sans-serif",
          fontSize: '20px',
          marginBottom: '40px'
        }}>
          Live music at the market is sponsored 100% by local businesses.
        </p>
        <div className="brutal-sponsors-grid">
          <a href="https://floatmagicvalley.com/" target="_blank" rel="noopener noreferrer" style={{ background: '#1a1a2e' }}>
            <img src="/images/sponsors/float-magic-valley.webp" alt="Float Magic Valley" />
          </a>
          <a href="https://www.csassocinsurance.com/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/cricket-sterling.webp" alt="Cricket Sterling Insurance" />
          </a>
          <a href="https://ontheballplumbing.com/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/on-the-ball-plumbing.png" alt="On The Ball Plumbing" />
          </a>
          <a href="https://www.facebook.com/odunkens/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/odunkens.png" alt="O'Dunkens" />
          </a>
          <a href="https://wolfelighting.net/" target="_blank" rel="noopener noreferrer" style={{ background: '#1a1a2e' }}>
            <img src="/images/sponsors/wolfe-lighting.webp" alt="Wolfe Lighting" />
          </a>
          <a href="https://milnersgate.com/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/milners-gate.svg" alt="Milner's Gate" />
          </a>
          <a href="https://it83fitness.com/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/it83-fitness.webp" alt="IT 83 Fitness" />
          </a>
          <a href="https://tommys-express.com/locations/id53/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/tommys-express.svg" alt="Tommy's Express Car Wash" />
          </a>
          <a href="https://www.majesticaestheticswellness.com/" target="_blank" rel="noopener noreferrer">
            <img src="/images/sponsors/majestic-aesthetics.png" alt="Majestic Aesthetics & Wellness" />
          </a>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '4px solid #000',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: '#E30613',
              padding: '24px 32px',
              borderBottom: '4px solid #000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: '28px',
                color: '#fff',
                margin: 0
              }}>
                Apply to Perform
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '32px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 800,
                    fontSize: '28px',
                    color: '#28a745',
                    margin: '0 0 16px 0'
                  }}>
                    Application Submitted!
                  </h3>
                  <p style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '16px',
                    color: '#333',
                    marginBottom: '24px'
                  }}>
                    Thanks for your interest! We've sent a confirmation to your email.
                    We'll be in touch if we'd like to book you for a market date.
                  </p>
                  <button
                    onClick={closeModal}
                    className="brutal-btn"
                    style={{
                      background: '#FFD700',
                      color: '#000',
                      border: '4px solid #000',
                      padding: '14px 28px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div style={{
                      background: '#fee',
                      border: '4px solid #E30613',
                      padding: '16px',
                      marginBottom: '24px',
                      fontFamily: "'Sora', sans-serif",
                      color: '#E30613'
                    }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Name */}
                    <div>
                      <label style={labelStyle}>Name / Band Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name or band name"
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(208) 555-1234"
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* Social Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Facebook</label>
                        <input
                          type="text"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleChange}
                          placeholder="@username or URL"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Instagram</label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleChange}
                          placeholder="@username"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>X (Twitter)</label>
                        <input
                          type="text"
                          name="x_handle"
                          value={formData.x_handle}
                          onChange={handleChange}
                          placeholder="@username"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>YouTube</label>
                        <input
                          type="text"
                          name="youtube"
                          value={formData.youtube}
                          onChange={handleChange}
                          placeholder="Channel URL"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label style={labelStyle}>Tell Us About Yourself</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="What kind of music do you play? Any links to recordings? What dates work best for you?"
                        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="brutal-btn"
                      style={{
                        width: '100%',
                        background: '#FFD700',
                        color: '#000',
                        border: '4px solid #000',
                        padding: '16px 40px',
                        fontSize: '18px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMusic;
