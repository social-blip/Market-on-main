import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Sky Hall color palette
const colors = {
  light: '#F2DBCF',      // warm beige background
  dark: '#26150D',       // deep brown text
  accent: '#E55B19',     // vibrant orange
  white: '#ffffff',
  cardBg: 'rgba(21, 21, 21, 0.06)', // semi-transparent for cards
};

// Pill button with arrow circle (Sky Hall style)
const PillButton = ({ to, children, variant = 'dark', style = {} }) => {
  const [hovered, setHovered] = useState(false);

  const isDark = variant === 'dark';

  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        textDecoration: 'none',
        fontSize: '1.2vw',
        minWidth: 'max-content',
        transition: 'all 0.9s cubic-bezier(0.135, 0.9, 0.15, 1)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        background: isDark ? colors.dark : colors.light,
        color: isDark ? colors.light : colors.dark,
        borderRadius: '3rem',
        padding: '0 1.5em',
        height: '3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter Tight', 'Inter', sans-serif",
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <span style={{
        background: isDark ? colors.dark : colors.light,
        color: isDark ? colors.light : colors.dark,
        borderRadius: '10rem',
        width: '3em',
        height: '3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '-0.25rem',
        transition: 'transform 0.3s ease',
        transform: hovered ? 'rotate(45deg)' : 'rotate(0deg)',
      }}>
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </span>
    </Link>
  );
};

// Card with border-top (Sky Hall style)
const BorderCard = ({ to, icon, title, text }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25em',
        borderTop: `2px solid ${colors.dark}`,
        paddingTop: '2.5em',
        paddingRight: '2em',
        paddingBottom: '0',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: colors.dark,
        color: colors.light,
        borderRadius: '50%',
        width: '3em',
        height: '3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em', marginTop: '0.5em' }}>
        <h3 style={{
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          fontSize: '1.75em',
          fontWeight: 500,
          lineHeight: '121%',
          color: colors.dark,
          margin: 0,
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          fontSize: '1.25em',
          fontWeight: 500,
          lineHeight: '130%',
          color: colors.dark,
          opacity: 0.7,
          margin: 0,
        }}>
          {text}
        </p>
      </div>
    </Link>
  );
};

// Image card with overlay
const ImageCard = ({ src, alt, title, subtitle }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '1em',
        overflow: 'hidden',
        aspectRatio: '4/3',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '2em',
        background: 'linear-gradient(to top, rgba(38, 21, 13, 0.8), transparent)',
        color: colors.light,
      }}>
        <h3 style={{
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          fontSize: '1.5em',
          fontWeight: 600,
          margin: 0,
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{
            fontFamily: "'Inter Tight', 'Inter', sans-serif",
            fontSize: '1em',
            margin: '0.5em 0 0',
            opacity: 0.8,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// CTA Card (hero style with light bg)
const CTACard = ({ children }) => (
  <div style={{
    background: colors.light,
    color: colors.dark,
    borderRadius: '1em',
    padding: '2.5em 3.5em 2.5em 2.5em',
    display: 'flex',
    alignItems: 'center',
    gap: '2em',
    maxWidth: '48em',
  }}>
    {children}
  </div>
);

const TestHome3 = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.light,
      fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
      color: colors.dark,
      overflowX: 'hidden',
      fontSize: '16px',
    }}>
      {/* ===== FIXED HEADER ===== */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5em 4em',
        borderBottom: `2px solid ${colors.light}`,
        background: 'rgba(38, 21, 13, 0.9)',
        backdropFilter: 'blur(10px)',
        color: colors.light,
      }}>
        <Link to="/" style={{
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          fontSize: '1.25em',
          fontWeight: 600,
          color: colors.light,
          textDecoration: 'none',
        }}>
          Market on Main
        </Link>
        <nav style={{
          display: 'flex',
          gap: '3em',
        }}>
          {['Vendors', 'Calendar', 'Live Music', 'Get Involved'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase().replace(' ', '-')}`}
              style={{
                color: colors.light,
                textDecoration: 'none',
                fontSize: '1em',
                fontWeight: 500,
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              {item}
            </Link>
          ))}
        </nav>
      </header>

      {/* ===== FULL-SCREEN HERO ===== */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <img
            src="/images/market/live-band.jpg"
            alt="Market atmosphere"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }} />
        </div>

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '4em',
          paddingTop: '8em',
          gap: '3em',
          color: colors.light,
        }}>
          <h1 style={{
            fontFamily: "'Inter Tight', 'Inter', sans-serif",
            fontSize: 'clamp(3rem, 7vw, 7em)',
            fontWeight: 600,
            lineHeight: '100%',
            margin: 0,
            maxWidth: '12em',
          }}>
            Your Saturday tradition starts here.
          </h1>

          <CTACard>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'Inter Tight', 'Inter', sans-serif",
                fontSize: '1.5em',
                fontWeight: 500,
                lineHeight: '130%',
                margin: 0,
              }}>
                Live music. Local makers. Good vibes all morning.
              </p>
              <p style={{
                fontSize: '1.25em',
                fontWeight: 500,
                margin: '1em 0 0',
                opacity: 0.7,
              }}>
                Every Saturday · June – August · 9am – 2pm
              </p>
            </div>
            <PillButton to="/vendors" variant="dark">
              Explore Vendors
            </PillButton>
          </CTACard>
        </div>
      </section>

      {/* ===== GALLERY SECTION ===== */}
      <section style={{
        height: '80vh',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          height: '100%',
          gap: '1.25em',
          padding: '1.25em',
        }}>
          {[
            { src: '/images/market/hat-brand-beef.jpg', title: 'Local Beef', subtitle: 'Hat Brand Beef' },
            { src: '/images/market/cotton-candy-truck.jpg', title: 'Sweet Treats', subtitle: 'Food Trucks' },
            { src: '/images/market/beaded-jewelry.jpg', title: 'Handmade Goods', subtitle: 'Local Artisans' },
            { src: '/images/market/plant-cart.jpg', title: 'Fresh Plants', subtitle: 'Idaho Growers' },
          ].map((img, i) => (
            <div key={i} style={{ flex: 1 }}>
              <img
                src={img.src}
                alt={img.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1em',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== LOCAL MAKERS SECTION ===== */}
      <section style={{
        background: colors.light,
        padding: '6em 4em',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4em' }}>
            <p style={{
              fontSize: '1.25em',
              fontWeight: 500,
              opacity: 0.6,
              margin: '0 0 1em',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Meet Your Neighbors
            </p>
            <h2 style={{
              fontFamily: "'Inter Tight', 'Inter', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3em)',
              fontWeight: 600,
              lineHeight: '121%',
              margin: 0,
            }}>
              Local Makers
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3em',
          }}>
            <BorderCard
              to="/vendors"
              icon={<span style={{ fontSize: '1.2em' }}>🌱</span>}
              title="The Growers"
              text="Farm-fresh produce, plants, and flowers straight from Idaho soil."
            />
            <BorderCard
              to="/vendors"
              icon={<span style={{ fontSize: '1.2em' }}>✨</span>}
              title="The Makers"
              text="Handmade pottery, jewelry, and crafts made with care by local artisans."
            />
            <BorderCard
              to="/vendors"
              icon={<span style={{ fontSize: '1.2em' }}>🍕</span>}
              title="The Eats"
              text="Food trucks, sweet treats, and delicious bites to fuel your market morning."
            />
            <BorderCard
              to="/vendors"
              icon={<span style={{ fontSize: '1.2em' }}>💎</span>}
              title="Vintage & Finds"
              text="One-of-a-kind treasures and unique goods you won't find anywhere else."
            />
          </div>
        </div>
      </section>

      {/* ===== GET INVOLVED SECTION ===== */}
      <section style={{
        background: colors.white,
        padding: '6em 4em',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '4em',
            flexWrap: 'wrap',
            gap: '2em',
          }}>
            <div>
              <p style={{
                fontSize: '1.25em',
                fontWeight: 500,
                opacity: 0.6,
                margin: '0 0 1em',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: colors.dark,
              }}>
                Be Part of It
              </p>
              <h2 style={{
                fontFamily: "'Inter Tight', 'Inter', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 3em)',
                fontWeight: 600,
                lineHeight: '121%',
                margin: 0,
                color: colors.dark,
              }}>
                Let's be friends.
              </h2>
            </div>
            <PillButton to="/get-involved" variant="dark">
              Get Involved
            </PillButton>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25em',
          }}>
            <ImageCard
              src="/images/market/jae-foundation.jpg"
              alt="Volunteer"
              title="Volunteer"
              subtitle="Help us set up and keep the vibes going"
            />
            <ImageCard
              src="/images/market/firefighters-community.jpg"
              alt="Sponsor"
              title="Sponsor"
              subtitle="Support local and reach the community"
            />
            <ImageCard
              src="/images/market/community-card.jpg"
              alt="Community"
              title="Community"
              subtitle="Come hang, shop, and connect"
            />
          </div>
        </div>
      </section>

      {/* ===== LIVE MUSIC / SPONSORS SECTION ===== */}
      <section style={{
        background: colors.dark,
        color: colors.light,
        padding: '6em 4em',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4em',
            flexWrap: 'wrap',
            gap: '2em',
          }}>
            <div>
              <p style={{
                fontSize: '1.25em',
                fontWeight: 500,
                opacity: 0.6,
                margin: '0 0 1em',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Sponsored 100% by Local Businesses
              </p>
              <h2 style={{
                fontFamily: "'Inter Tight', 'Inter', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 3em)',
                fontWeight: 600,
                lineHeight: '121%',
                margin: 0,
              }}>
                Live Music All Day
              </h2>
            </div>
            <PillButton to="/live-music" variant="light">
              View Schedule
            </PillButton>
          </div>

          <p style={{
            fontSize: '1.25em',
            fontWeight: 500,
            lineHeight: '130%',
            maxWidth: '600px',
            opacity: 0.7,
            marginBottom: '3em',
          }}>
            Thanks to our amazing sponsors, we bring live local music to every market day.
          </p>

          {/* Sponsor logos */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1em',
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
                  background: sponsor.dark ? 'rgba(80, 61, 52, 0.8)' : colors.light,
                  borderRadius: '0.5em',
                  padding: '1em 1.5em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '4em',
                  minWidth: '8em',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.alt}
                  style={{
                    maxHeight: '2em',
                    maxWidth: '6em',
                    filter: sponsor.dark ? 'brightness(1.5)' : 'none',
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO / CTA SECTION ===== */}
      <section style={{
        background: colors.light,
        padding: '8em 4em',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3em',
        }}>
          <h2 style={{
            fontFamily: "'Inter Tight', 'Inter', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.5em)',
            fontWeight: 600,
            lineHeight: '110%',
            textAlign: 'center',
            margin: 0,
          }}>
            Market on Main is where Twin Falls comes together.
          </h2>
          <p style={{
            fontSize: '1.25em',
            fontWeight: 500,
            lineHeight: '150%',
            textAlign: 'center',
            opacity: 0.7,
            maxWidth: '700px',
          }}>
            Saturdays in the summer, we set up on Main Ave for live music, handmade goods, and farm-fresh finds. It's not just a market — it's a tradition.
          </p>
          <PillButton to="/calendar" variant="dark">
            See You Saturday
          </PillButton>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: colors.dark,
        color: colors.light,
        padding: '4em',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '3em',
        }}>
          <div>
            <span style={{
              fontFamily: "'Inter Tight', 'Inter', sans-serif",
              fontSize: '1.5em',
              fontWeight: 600,
            }}>
              Market on Main
            </span>
            <p style={{
              fontSize: '1em',
              opacity: 0.6,
              margin: '1em 0 0',
            }}>
              Every Saturday · June – August · 9am – 2pm
            </p>
            <p style={{
              fontSize: '1em',
              margin: '0.5em 0 0',
            }}>
              100 Block Main Ave N, Twin Falls
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '3em',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
              {['Vendors', 'Calendar', 'Live Music'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(' ', '-')}`}
                  style={{
                    color: colors.light,
                    textDecoration: 'none',
                    fontSize: '1em',
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >
                  {item}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
              {['Get Involved', 'Find Us', 'Become a Vendor'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(/ /g, '-')}`}
                  style={{
                    color: colors.light,
                    textDecoration: 'none',
                    fontSize: '1em',
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1400px',
          margin: '4em auto 0',
          paddingTop: '2em',
          borderTop: `1px solid rgba(242, 219, 207, 0.2)`,
          fontSize: '0.875em',
          opacity: 0.5,
        }}>
          © 2026 Market on Main · Twin Falls, Idaho
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          header nav { display: none; }
        }
        @media (max-width: 768px) {
          section { padding: 4em 2em !important; }
          header { padding: 1em 2em !important; }
          footer { padding: 3em 2em !important; }
        }
      `}</style>
    </div>
  );
};

export default TestHome3;
