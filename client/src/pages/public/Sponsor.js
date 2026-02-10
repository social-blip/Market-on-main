import React from 'react';

const PHOTOS = [
  '/images/sponsors/musician-1.jpg',
  '/images/sponsors/musician-2.jpg',
  '/images/sponsors/musician-3.jpg',
  '/images/sponsors/musician-4.jpg',
  '/images/sponsors/musician-5.jpg',
  '/images/sponsors/musician-6.jpg',
  '/images/sponsors/musician-7.jpg',
];

const Sponsor = () => {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        padding: '140px 20px 60px',
        textAlign: 'center',
        background: 'var(--maroon)'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(42px, 8vw, 80px)',
          color: 'var(--cream)',
          margin: '0 0 24px 0',
          textTransform: 'uppercase',
          lineHeight: 1
        }}>
          Sponsor Market on Main
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'var(--cream)',
          maxWidth: '780px',
          margin: '0 auto 32px',
          opacity: 0.95
        }}>
          Every Saturday morning, Market on Main brings thousands of visitors to Downtown Twin Falls. As we gear up for our 5th season, we're looking for local businesses to help sponsor the live music that makes our market special.
        </p>

      </section>

      {/* What Your Sponsorship Supports */}
      <section style={{ padding: '60px 20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--dark)',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              What Your Sponsorship Supports
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: '1.7',
              color: 'var(--gray-dark)',
              margin: 0
            }}>
              100% of sponsorship dollars go directly toward live music at the market. We feature local talent every Saturday -from acoustic soloists to full bands -performing from 9am to 2pm. Your support keeps Main Avenue alive with music all season long.
            </p>
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ padding: '40px 20px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {PHOTOS.slice(0, 3).map((src, i) => (
            <div key={i} style={{
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <img src={src} alt="Live music at Market on Main" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block'
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* Sponsorship Levels */}
      <section style={{ padding: '40px 20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--maroon)',
            borderRadius: '16px',
            padding: '32px',
            color: 'var(--cream)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              margin: '0 0 20px 0',
              textTransform: 'uppercase',
              color: 'var(--yellow)'
            }}>
              Sponsorship Levels
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 8px 0', fontSize: '16px' }}>
                Per Set -$250
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                Sponsor one music set (morning or afternoon).
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 8px 0', fontSize: '16px' }}>
                Full Day -$500
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                Sponsor both the morning and afternoon sets for a full Saturday.
              </p>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '16px',
              marginTop: '16px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-body)', fontSize: '14px', opacity: 0.9 }}>
                20 sets available across 10 Saturdays -first come, first served.
              </p>
              <p style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-body)', fontSize: '14px', opacity: 0.9 }}>
                Your business name will be announced as that day's music sponsor.
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>
                Every dollar goes toward the live music at Market on Main.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '28px',
            color: 'var(--dark)',
            margin: '0 0 32px 0',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            What You Get
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                title: 'Website Visibility',
                desc: 'Your logo and link featured on our sponsor page at tfmarketonmain.com -seen by thousands of visitors planning their Saturday.'
              },
              {
                title: 'Social Media',
                desc: 'Tagged in posts and stories across our social channels leading up to and on the day you sponsor.'
              },
              {
                title: 'Built-In Traffic',
                desc: 'Market on Main draws thousands of people to Downtown Twin Falls every Saturday. Your name is in front of all of them.'
              },
              {
                title: 'Live Shout-Outs',
                desc: 'Your business announced live by performers and emcees throughout the market day.'
              },
              {
                title: 'On-Site Presence',
                desc: 'Your banner or signage displayed at the music stage area for the day you sponsor.'
              },
              {
                title: 'Vendor Support',
                desc: 'Show our vendors and community that your business supports the people and culture that make downtown Twin Falls thrive.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--dark)',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: 'var(--gray-dark)',
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sponsor? */}
      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--dark)',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Why Sponsor Market on Main?
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: '1.7',
              color: 'var(--gray-dark)',
              margin: 0
            }}>
              This isn't just advertising -it's a commitment to Downtown Twin Falls. When you sponsor music at the market, you're helping keep Main Avenue alive with energy, culture, and community every Saturday. You're supporting local musicians, local vendors, and the thousands of families who make this market part of their weekend.
            </p>
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ padding: '0 20px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          {PHOTOS.slice(4, 7).map((src, i) => (
            <div key={i} style={{
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <img src={src} alt="Live music at Market on Main" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block'
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'var(--dark)'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '32px',
          color: 'var(--cream)',
          margin: '0 0 16px 0',
          textTransform: 'uppercase'
        }}>
          Ready to Join Us?
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--cream)',
          opacity: 0.8,
          margin: '0 0 24px 0'
        }}>
          Spots are limited. Reach out to reserve your sponsorship.
        </p>
        <a
          href="mailto:info@tfmarketonmain.com"
          style={{
            display: 'inline-block',
            padding: '16px 40px',
            fontSize: '16px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            background: 'var(--yellow)',
            color: 'var(--dark)',
            borderRadius: '50px',
            textDecoration: 'none',
            textTransform: 'uppercase'
          }}
        >
          Email Us
        </a>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--cream)',
          opacity: 0.6,
          margin: '16px 0 0 0'
        }}>
          info@tfmarketonmain.com
        </p>
      </section>
    </div>
  );
};

export default Sponsor;
