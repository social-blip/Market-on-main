import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Good Habit style: minimal card with subtle hover
const MinimalCard = ({ to, src, alt, title, text }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        display: 'block',
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-8px)' : 'none',
        boxShadow: hovered
          ? '0 20px 40px rgba(0,0,0,0.12)'
          : '0 4px 12px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: '100%',
        height: '240px',
        overflow: 'hidden'
      }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
      </div>
      <div style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '20px',
          color: '#000',
          margin: '0 0 8px 0'
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          color: '#3d3d3d',
          margin: 0,
          lineHeight: 1.6
        }}>
          {text}
        </p>
      </div>
    </Link>
  );
};

// Pill button component
const PillButton = ({ to, children, variant = 'primary', style = {} }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyles = {
    primary: {
      background: hovered ? '#ede500' : '#fff700',
      color: '#000'
    },
    secondary: {
      background: hovered ? '#000' : '#111',
      color: '#fff'
    },
    outline: {
      background: hovered ? '#000' : 'transparent',
      color: hovered ? '#fff' : '#000',
      border: '2px solid #000'
    }
  };

  return (
    <Link
      to={to}
      style={{
        display: 'inline-block',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: '16px',
        padding: '14px 32px',
        borderRadius: '50px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        border: 'none',
        ...baseStyles[variant],
        ...style
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
};

const TestHome = () => {
  return (
    <div style={{ background: '#ebebeb', minHeight: '100vh' }}>
      {/* ===== HERO SECTION ===== */}
      <section style={{
        padding: '120px 20px 80px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 16px 0'
            }}>
              Every Saturday • June - August
            </p>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(48px, 8vw, 80px)',
              color: '#000',
              margin: '0 0 24px 0',
              lineHeight: 1.1,
              letterSpacing: '-2px'
            }}>
              Your Saturday tradition starts here.
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              color: '#3d3d3d',
              maxWidth: '480px',
              margin: '0 0 40px 0',
              lineHeight: 1.7
            }}>
              Live music. Local makers. Good vibes all morning. Downtown Twin Falls, every Saturday from 9am to 2pm.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <PillButton to="/vendors" variant="primary">
                Find Your Vibe
              </PillButton>
              <PillButton to="/calendar" variant="outline">
                View Schedule
              </PillButton>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '1',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <img
                src="/images/market/hat-brand-beef.jpg"
                alt="Hat Brand Beef vendor"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '1',
              marginTop: '40px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <img
                src="/images/market/cotton-candy-truck.jpg"
                alt="Cotton candy truck"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '1',
              marginTop: '-40px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <img
                src="/images/market/beaded-jewelry.jpg"
                alt="Handmade jewelry"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '1',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <img
                src="/images/market/live-band.jpg"
                alt="Live music"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== INFO STRIP (Soft highlight) ===== */}
      <section style={{
        background: '#fff700',
        padding: '24px 20px'
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          color: '#000',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          fontWeight: 500
        }}>
          Twin Falls Market on Main — a local vendor market every Saturday from June 6 - August 8 in Downtown Twin Falls.
        </p>
      </section>

      {/* ===== LOCAL MAKERS SECTION ===== */}
      <section style={{
        padding: '100px 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: '0 0 12px 0'
          }}>
            Meet Your Neighbors
          </p>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 56px)',
            color: '#000',
            margin: 0,
            letterSpacing: '-1px'
          }}>
            Local Makers
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <MinimalCard
            to="/vendors"
            src="/images/market/plant-cart.jpg"
            alt="Fresh produce and plants"
            title="The Growers"
            text="Farm-fresh produce, plants, and flowers straight from Idaho soil."
          />
          <MinimalCard
            to="/vendors"
            src="/images/market/makers-card.jpg"
            alt="Handmade crafts"
            title="The Makers"
            text="Handmade pottery, jewelry, and crafts made with care by local artisans."
          />
          <MinimalCard
            to="/vendors"
            src="/images/market/eats-card.jpg"
            alt="Food trucks and sweet treats"
            title="The Eats"
            text="Food trucks, sweet treats, and delicious bites to fuel your market morning."
          />
          <MinimalCard
            to="/vendors"
            src="/images/market/artist-tapestries.jpg"
            alt="Unique finds"
            title="Vintage & Finds"
            text="One-of-a-kind treasures and unique goods you won't find anywhere else."
          />
        </div>
      </section>

      {/* ===== GET INVOLVED SECTION ===== */}
      <section style={{
        background: '#fff',
        padding: '100px 20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 12px 0'
            }}>
              Be Part of It
            </p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(36px, 6vw, 56px)',
              color: '#000',
              margin: 0,
              letterSpacing: '-1px'
            }}>
              Let's be friends
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <MinimalCard
              to="/get-involved"
              src="/images/market/jae-foundation.jpg"
              alt="Volunteer"
              title="Volunteer"
              text="Help us set up, welcome neighbors, and keep the good vibes going."
            />
            <MinimalCard
              to="/get-involved"
              src="/images/market/firefighters-community.jpg"
              alt="Sponsor"
              title="Sponsor"
              text="Support local and get your business in front of the community."
            />
            <MinimalCard
              to="/get-involved"
              src="/images/market/community-card.jpg"
              alt="Community"
              title="Community"
              text="This is your market. Come hang, shop, and connect."
            />
          </div>
        </div>
      </section>

      {/* ===== LIVE MUSIC / SPONSORS SECTION ===== */}
      <section style={{
        background: '#111',
        padding: '100px 20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: '0 0 12px 0'
          }}>
            Sponsored 100% by Local Businesses
          </p>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 56px)',
            color: '#fff',
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            Live Music All Day
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            color: '#999',
            maxWidth: '600px',
            margin: '0 auto 60px',
            lineHeight: 1.7
          }}>
            Thanks to our amazing sponsors, we bring live local music to every market day.
          </p>

          {/* Sponsor logos grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            justifyItems: 'center',
            opacity: 0.7
          }}>
            <a href="https://floatmagicvalley.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#222',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/float-magic-valley.webp" alt="Float Magic Valley" style={{ maxHeight: '40px', maxWidth: '100%', filter: 'brightness(1.2)' }} />
            </a>
            <a href="https://www.csassocinsurance.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/cricket-sterling.webp" alt="Cricket Sterling Insurance" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://ontheballplumbing.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/on-the-ball-plumbing.png" alt="On The Ball Plumbing" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://www.facebook.com/odunkens/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/odunkens.png" alt="O'Dunkens" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://wolfelighting.net/" target="_blank" rel="noopener noreferrer" style={{
              background: '#222',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/wolfe-lighting.webp" alt="Wolfe Lighting" style={{ maxHeight: '40px', maxWidth: '100%', filter: 'brightness(1.2)' }} />
            </a>
            <a href="https://milnersgate.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/milners-gate.svg" alt="Milner's Gate" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://it83fitness.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/it83-fitness.webp" alt="IT 83 Fitness" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://tommys-express.com/locations/id53/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/tommys-express.svg" alt="Tommy's Express Car Wash" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
            <a href="https://www.majesticaestheticswellness.com/" target="_blank" rel="noopener noreferrer" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '80px'
            }}>
              <img src="/images/sponsors/majestic-aesthetics.png" alt="Majestic Aesthetics & Wellness" style={{ maxHeight: '40px', maxWidth: '100%' }} />
            </a>
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO / CTA SECTION ===== */}
      <section style={{
        background: '#ffedf9',
        padding: '100px 20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 48px)',
            color: '#000',
            margin: '0 0 24px 0',
            lineHeight: 1.2,
            letterSpacing: '-1px'
          }}>
            Market on Main is where Twin Falls comes together.
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            color: '#3d3d3d',
            lineHeight: 1.8,
            margin: '0 0 40px 0'
          }}>
            Saturdays in the summer, we set up on Main Ave for live music, handmade goods, and farm-fresh finds. It's not just a market — it's a tradition. Grab a coffee, say hi to your neighbors, and enjoy the vibe.
          </p>
          <PillButton to="/calendar" variant="secondary">
            See You Saturday →
          </PillButton>
        </div>
      </section>

      {/* ===== FOOTER INFO STRIP ===== */}
      <section style={{
        background: '#000',
        padding: '32px 20px',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          color: '#fff700',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          margin: 0
        }}>
          Every Saturday • June - August • 9am - 2pm • 100 Block Main Ave N, Twin Falls
        </p>
      </section>
    </div>
  );
};

export default TestHome;
