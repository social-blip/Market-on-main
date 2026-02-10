import React from 'react';

const SponsorFlyer = () => {
  return (
    <>
      <style>{`
        @media print {
          @page { size: letter; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, footer, header { display: none !important; }
        }
      `}</style>

      <div style={{
        width: '8.5in',
        height: '11in',
        margin: '0 auto',
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header / Hero */}
        <div style={{
          background: 'var(--maroon)',
          padding: '32px 40px 24px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '42px',
            color: 'var(--cream)',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Sponsor Market on Main
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            lineHeight: '1.6',
            color: 'var(--cream)',
            margin: '0 auto',
            maxWidth: '520px',
            opacity: 0.9,
          }}>
            Every Saturday morning, Market on Main brings thousands of visitors to Downtown Twin Falls. As we gear up for our 5th season, we're looking for local businesses to help sponsor the live music that makes our market special.
          </p>
        </div>

        {/* Photo strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          padding: '12px 40px',
          background: 'var(--cream)',
        }}>
          {[
            '/images/sponsors/musician-1.jpg',
            '/images/sponsors/musician-2.jpg',
            '/images/sponsors/musician-3.jpg',
          ].map((src, i) => (
            <div key={i} style={{
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3',
            }}>
              <img src={src} alt="" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
              }} />
            </div>
          ))}
        </div>

        {/* Two column body */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '12px 40px',
          flex: 1,
        }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* What Your Sponsorship Supports */}
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '16px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--dark)',
                margin: '0 0 6px 0',
                textTransform: 'uppercase',
              }}>
                What Your Sponsorship Supports
              </h2>
              <p style={{
                fontSize: '9.5px',
                lineHeight: '1.6',
                color: 'var(--gray-dark)',
                margin: 0,
              }}>
                100% of sponsorship dollars go directly toward live music at the market. We feature local talent every Saturday -from acoustic soloists to full bands -performing from 9am to 2pm. Your support keeps Main Avenue alive with music all season long.
              </p>
            </div>

            {/* Sponsorship Levels */}
            <div style={{
              background: 'var(--maroon)',
              borderRadius: '10px',
              padding: '16px',
              color: 'var(--cream)',
              flex: 1,
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                color: 'var(--yellow)',
              }}>
                Sponsorship Levels
              </h2>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 2px 0', fontSize: '12px' }}>
                  Per Set -$250
                </p>
                <p style={{ fontSize: '9.5px', lineHeight: 1.5, margin: 0 }}>
                  Sponsor one music set (morning or afternoon).
                </p>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 2px 0', fontSize: '12px' }}>
                  Full Day -$500
                </p>
                <p style={{ fontSize: '9.5px', lineHeight: 1.5, margin: 0 }}>
                  Sponsor both the morning and afternoon sets for a full Saturday.
                </p>
              </div>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '8px',
                marginTop: '8px',
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '9px', opacity: 0.9 }}>
                  20 sets available across 10 Saturdays -first come, first served.
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '9px', opacity: 0.9 }}>
                  Your business name announced as that day's music sponsor.
                </p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 700 }}>
                  Every dollar goes toward the live music at Market on Main.
                </p>
              </div>
            </div>
          </div>

          {/* Right column -What You Get */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--dark)',
              margin: '0',
              textTransform: 'uppercase',
            }}>
              What You Get
            </h2>

            {[
              { title: 'Website Visibility', desc: 'Your logo and link featured on our sponsor page at tfmarketonmain.com -seen by thousands of visitors planning their Saturday.' },
              { title: 'Social Media', desc: 'Tagged in posts and stories across our social channels leading up to and on the day you sponsor.' },
              { title: 'Built-In Traffic', desc: 'Market on Main draws thousands of people to Downtown Twin Falls every Saturday. Your name is in front of all of them.' },
              { title: 'Live Shout-Outs', desc: 'Your business announced live by performers and emcees throughout the market day.' },
              { title: 'On-Site Presence', desc: 'Your banner or signage displayed at the music stage area for the day you sponsor.' },
              { title: 'Vendor Support', desc: 'Show our vendors and community that your business supports the people and culture that make downtown Twin Falls thrive.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '10px 12px',
                flex: 1,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '10px',
                  color: 'var(--dark)',
                  margin: '0 0 2px 0',
                  textTransform: 'uppercase',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '8.5px',
                  lineHeight: '1.5',
                  color: 'var(--gray-dark)',
                  margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          background: 'var(--dark)',
          padding: '14px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--cream)',
              margin: '0 0 2px 0',
              textTransform: 'uppercase',
            }}>
              Ready to Join Us?
            </p>
            <p style={{
              fontSize: '10px',
              color: 'var(--cream)',
              opacity: 0.8,
              margin: 0,
            }}>
              Spots are limited. Reach out to reserve your sponsorship.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '11px',
              color: 'var(--yellow)',
              margin: '0 0 2px 0',
            }}>
              info@tfmarketonmain.com
            </p>
            <p style={{
              fontSize: '10px',
              color: 'var(--cream)',
              opacity: 0.7,
              margin: 0,
            }}>
              tfmarketonmain.com/sponsor
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SponsorFlyer;
