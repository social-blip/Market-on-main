import React from 'react';

const FindUs = () => {
  return (
    <div>
      {/* ===== HERO SECTION (Yellow) ===== */}
      <section style={{
        background: '#FFD700',
        padding: '40px 20px 80px 20px',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(60px, 12vw, 150px)',
            color: '#000',
            margin: '0 0 24px 0',
            lineHeight: 1,
            letterSpacing: '-2px'
          }}>
            Find Us
          </h1>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#000',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            We're in the heart of Downtown Twin Falls, right on Main Avenue.
          </p>
        </div>
      </section>

      {/* ===== LOCATION & CONTACT SECTION (White) ===== */}
      <section style={{
        background: '#fff',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px'
          }}>
            {/* Location Card */}
            <div style={{
              border: '4px solid #000',
              background: '#fff',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#FFD700',
                padding: '20px 24px',
                borderBottom: '4px solid #000'
              }}>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#000',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  Location
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '18px',
                  color: '#000',
                  margin: '0 0 16px 0',
                  fontWeight: 600
                }}>
                  100 Block of Main Avenue North<br />
                  Twin Falls, ID 83301
                </p>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '15px',
                  color: '#666',
                  margin: '0 0 20px 0',
                  lineHeight: 1.6
                }}>
                  We set up on the 100 block of Main Ave N in Downtown Twin Falls, right in front of the historic buildings between Shoshone Street and 2nd Avenue. Look for the tents, hear the music, and follow the smell of fresh food!
                </p>
                <a
                  href="https://maps.google.com/?q=100+Main+Ave+N,+Twin+Falls,+ID+83301"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn"
                  style={{
                    display: 'inline-block',
                    background: '#0056b3',
                    color: '#fff',
                    border: '3px solid #000',
                    padding: '12px 24px',
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  Get Directions →
                </a>
              </div>
            </div>

            {/* Hours Card */}
            <div style={{
              border: '4px solid #000',
              background: '#fff',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#E30613',
                padding: '20px 24px',
                borderBottom: '4px solid #000'
              }}>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#fff',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  Market Hours
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: '24px',
                  color: '#000',
                  margin: '0 0 8px 0',
                  fontWeight: 800
                }}>
                  Every Saturday
                </p>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '32px',
                  color: '#E30613',
                  margin: '0 0 16px 0',
                  fontWeight: 700
                }}>
                  9:00 AM - 2:00 PM
                </p>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '15px',
                  color: '#666',
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  June 6 through August 8, 2026<br />
                  Rain or shine — we'll be there!
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div style={{
              border: '4px solid #000',
              background: '#fff',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#0056b3',
                padding: '20px 24px',
                borderBottom: '4px solid #000'
              }}>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#fff',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  Contact
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Email
                  </p>
                  <a
                    href="mailto:info@tfmarketonmain.com"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '18px',
                      color: '#0056b3',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    info@tfmarketonmain.com
                  </a>
                </div>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '15px',
                  color: '#666',
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  Questions about vending, sponsorship, or anything else? Drop us a line and we'll get back to you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL SECTION (Yellow) ===== */}
      <section style={{
        background: '#FFD700',
        padding: '60px 20px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 8vw, 64px)',
            color: '#000',
            margin: '0 0 16px 0',
            lineHeight: 1
          }}>
            Follow Along
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '18px',
            color: '#000',
            margin: '0 0 32px 0'
          }}>
            Stay up to date with vendor announcements, live music lineups, and market day vibes.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://www.facebook.com/marketonmaintwinfalls"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn"
              style={{
                background: '#fff',
                color: '#000',
                border: '4px solid #000',
                padding: '16px 32px',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
Facebook
            </a>
            <a
              href="https://www.instagram.com/market_on_main_twinfalls"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn"
              style={{
                background: '#fff',
                color: '#000',
                border: '4px solid #000',
                padding: '16px 32px',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section style={{
        background: '#f5f5f5',
        padding: '0'
      }}>
        <iframe
          title="Market on Main Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2942.8!2d-114.4608!3d42.5558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54ace251e17a4e39%3A0x123456789!2s100%20Main%20Ave%20N%2C%20Twin%20Falls%2C%20ID%2083301!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="400"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* ===== BOTTOM CTA (Red) ===== */}
      <section style={{
        background: '#E30613',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(32px, 6vw, 56px)',
          color: '#fff',
          margin: '0 0 24px 0',
          lineHeight: 1.1
        }}>
          See You Saturday!
        </h2>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          color: '#fff',
          margin: '0',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Every Saturday, June through August<br />
          9 AM - 2 PM • Downtown Twin Falls
        </p>
      </section>
    </div>
  );
};

export default FindUs;
