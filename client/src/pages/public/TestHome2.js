import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Field Site CSS variables
const colors = {
  ink: '#1a1a1a',
  muted: '#E4E3E3',
  muted2: '#8C8B89',
  soft: '#fafafa',
  blue: '#0051a5',
};

// Tag badge component
const Tag = ({ children }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    background: colors.soft,
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: colors.muted2,
  }}>
    {children}
  </span>
);

// Plus button that expands on hover
const PlusButton = ({ to, text = 'Learn More' }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        border: 'none',
        background: colors.soft,
        height: '60px',
        padding: 0,
        borderRadius: '999px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transition: 'background 500ms ease, transform 500ms ease',
        ...(hovered && { background: '#f1f1f1' })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        width: '60px',
        height: '60px',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        lineHeight: 1,
        color: colors.ink,
        flexShrink: 0,
      }}>
        +
      </span>
      <span style={{
        display: 'inline-block',
        maxWidth: hovered ? '120px' : '0',
        opacity: hovered ? 1 : 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        marginRight: hovered ? '24px' : '0',
        transition: 'max-width 400ms ease, opacity 400ms ease, margin-right 400ms ease',
        fontSize: '18px',
        fontWeight: 600,
        letterSpacing: '-0.05em',
        color: colors.ink,
      }}>
        {text}
      </span>
    </Link>
  );
};

// Triple card (3:4 aspect image + title + body)
const TripleCard = ({ to, src, alt, title, text }) => (
  <Link to={to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        borderRadius: '8px',
        display: 'block',
        aspectRatio: '3 / 4',
        objectFit: 'cover',
      }}
    />
    <h3 style={{
      margin: '12px 0 0',
      fontSize: '17px',
      fontWeight: 575,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: colors.ink,
      fontFamily: "'Inter', sans-serif",
    }}>
      {title}
    </h3>
    <p style={{
      margin: 0,
      fontSize: '17px',
      fontWeight: 525,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#969696',
      fontFamily: "'Inter', sans-serif",
    }}>
      {text}
    </p>
  </Link>
);

// Hero button
const HeroButton = ({ to, children }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        border: 'none',
        borderRadius: '10px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        background: hovered ? '#4785c8' : colors.blue,
        color: '#fff',
        textDecoration: 'none',
        transition: 'background 300ms ease, transform 150ms ease',
        display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
};

const TestHome2 = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      color: colors.ink,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflowX: 'hidden',
    }}>
      {/* ===== HERO ===== */}
      <main style={{
        width: '100%',
        margin: '0 auto',
        padding: '140px 60px 80px',
        textAlign: 'center',
      }}>
        <h1 style={{
          margin: '0 auto',
          fontSize: 'clamp(32px, 6vw, 60px)',
          fontWeight: 585,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: colors.ink,
          maxWidth: '700px',
        }}>
          Your Saturday tradition starts here.
        </h1>
        <div style={{
          margin: '24px auto 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <HeroButton to="/vendors">Find Your Vibe</HeroButton>
        </div>

        {/* Full-bleed image carousel */}
        <section style={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginTop: '40px',
          position: 'relative',
        }}>
          <div style={{
            width: '100%',
            overflowX: 'auto',
            overflowY: 'visible',
            scrollSnapType: 'x mandatory',
            padding: '14px 18px',
            display: 'flex',
            gap: '24px',
            scrollbarWidth: 'none',
          }}>
            {[
              '/images/market/hat-brand-beef.jpg',
              '/images/market/cotton-candy-truck.jpg',
              '/images/market/beaded-jewelry.jpg',
              '/images/market/live-band.jpg',
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  flex: '0 0 auto',
                  width: 'min(77.75vw, 900px)',
                  scrollSnapAlign: 'center',
                }}
              >
                <img
                  src={src}
                  alt={`Market scene ${i + 1}`}
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '8px',
                    background: '#d3d3d3',
                    boxShadow: '0 2px 10px 0 rgba(112, 112, 112, 0.2)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 1 */}
        <section style={{
          margin: '180px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}>
          <Tag>Every Saturday</Tag>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 65px)',
            fontWeight: 625,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: colors.ink,
            maxWidth: '850px',
          }}>
            Live music, local makers, good vibes all morning.
          </h2>
          <PlusButton to="/calendar" text="View Dates" />
        </section>

        {/* Triple Grid - Vendor Categories */}
        <section style={{ width: '100%', margin: '60px auto 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}>
            <TripleCard
              to="/vendors"
              src="/images/market/plant-cart.jpg"
              alt="Fresh produce"
              title="The Growers"
              text="Farm-fresh produce, plants, and flowers straight from Idaho soil."
            />
            <TripleCard
              to="/vendors"
              src="/images/market/makers-card.jpg"
              alt="Handmade crafts"
              title="The Makers"
              text="Handmade pottery, jewelry, and crafts made with care by local artisans."
            />
            <TripleCard
              to="/vendors"
              src="/images/market/eats-card.jpg"
              alt="Food trucks"
              title="The Eats"
              text="Food trucks, sweet treats, and delicious bites to fuel your morning."
            />
          </div>
        </section>

        {/* Section 2 */}
        <section style={{
          margin: '180px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}>
          <Tag>Community</Tag>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 65px)',
            fontWeight: 625,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: colors.ink,
            maxWidth: '850px',
          }}>
            Let's be friends.
          </h2>
          <PlusButton to="/get-involved" text="Get Involved" />
        </section>

        {/* Triple Grid - Get Involved */}
        <section style={{ width: '100%', margin: '60px auto 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}>
            <TripleCard
              to="/get-involved"
              src="/images/market/jae-foundation.jpg"
              alt="Volunteer"
              title="Volunteer"
              text="Help us set up, welcome neighbors, and keep the good vibes going."
            />
            <TripleCard
              to="/get-involved"
              src="/images/market/firefighters-community.jpg"
              alt="Sponsor"
              title="Sponsor"
              text="Support local and get your business in front of the community."
            />
            <TripleCard
              to="/get-involved"
              src="/images/market/community-card.jpg"
              alt="Community"
              title="Community"
              text="This is your market. Come hang, shop, and connect."
            />
          </div>
        </section>

        {/* Section 3 - Sponsors */}
        <section style={{
          margin: '180px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}>
          <Tag>Sponsors</Tag>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 60px)',
            fontWeight: 585,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: colors.ink,
            maxWidth: '700px',
          }}>
            Live music all day, sponsored 100% by local businesses.
          </h2>

          {/* Sponsor logos */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {[
              { href: 'https://floatmagicvalley.com/', src: '/images/sponsors/float-magic-valley.webp', alt: 'Float Magic Valley', dark: true },
              { href: 'https://www.csassocinsurance.com/', src: '/images/sponsors/cricket-sterling.webp', alt: 'Cricket Sterling' },
              { href: 'https://ontheballplumbing.com/', src: '/images/sponsors/on-the-ball-plumbing.png', alt: 'On The Ball Plumbing' },
              { href: 'https://www.facebook.com/odunkens/', src: '/images/sponsors/odunkens.png', alt: "O'Dunkens" },
              { href: 'https://wolfelighting.net/', src: '/images/sponsors/wolfe-lighting.webp', alt: 'Wolfe Lighting', dark: true },
              { href: 'https://milnersgate.com/', src: '/images/sponsors/milners-gate.svg', alt: "Milner's Gate" },
            ].map((sponsor, i) => (
              <a
                key={i}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: sponsor.dark ? '#1a1a1a' : '#f5f5f5',
                  borderRadius: '2px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '48px',
                  minWidth: '100px',
                  textDecoration: 'none',
                  transition: 'background 220ms ease',
                }}
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.alt}
                  style={{
                    maxHeight: '28px',
                    maxWidth: '80px',
                    filter: sponsor.dark ? 'brightness(1.5)' : 'none',
                  }}
                />
              </a>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          margin: '120px auto 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(28px, 5vw, 50px)',
            fontWeight: 625,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: colors.ink,
            maxWidth: '750px',
          }}>
            Market on Main is where Twin Falls comes together.
          </h2>
          <p style={{
            margin: '12px 0 0',
            fontSize: '17px',
            fontWeight: 525,
            letterSpacing: '-0.02em',
            lineHeight: 1.4,
            color: '#969696',
            maxWidth: '600px',
          }}>
            Saturdays in the summer, we set up on Main Ave for live music, handmade goods, and farm-fresh finds. It's not just a market — it's a tradition.
          </p>
          <HeroButton to="/calendar">See You Saturday</HeroButton>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `2px solid ${colors.ink}`,
        padding: '40px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px 9px',
            background: colors.blue,
          }}>
            <span style={{
              fontFamily: "'Inter', serif",
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.06em',
              lineHeight: 1.2,
              color: '#fff',
            }}>
              Market on Main
            </span>
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#969696',
          }}>
            Every Saturday · June – August · 9am – 2pm
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '16px',
            fontWeight: 650,
            letterSpacing: '-0.06em',
            color: '#000',
          }}>
            © 2026
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 160px)',
          gap: '8px',
        }}>
          {[
            { to: '/vendors', label: 'Vendors' },
            { to: '/calendar', label: 'Calendar' },
            { to: '/live-music', label: 'Live Music' },
            { to: '/get-involved', label: 'Get Involved' },
            { to: '/find-us', label: 'Find Us' },
            { to: '/become-vendor', label: 'Become a Vendor' },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.to}
              style={{
                width: '160px',
                background: '#f5f5f5',
                borderRadius: '2px',
                padding: '6px 12px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 650,
                letterSpacing: '-0.03em',
                color: '#000',
                transition: 'background 220ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E4E3E3'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default TestHome2;
