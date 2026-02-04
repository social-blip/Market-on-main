import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* ===== HERO SECTION (Red) ===== */}
      <section style={{
        background: '#E30613',
        padding: '80px 20px',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="brutal-hero-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(48px, 10vw, 120px)',
              color: '#fff',
              margin: '0 0 24px 0',
              lineHeight: 1,
              letterSpacing: '-2px'
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>Your Saturday</span><br />
              Tradition<br />
              <span style={{ whiteSpace: 'nowrap' }}>Starts Here.</span>
            </h1>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#000',
              maxWidth: '500px',
              margin: '0 0 32px 0',
              lineHeight: 1.6
            }}>
              Live music. Local makers. Good vibes all morning.<br />
              Downtown Twin Falls, every Saturday.
            </p>
            <Link
              to="/vendors"
              className="brutal-btn"
              style={{
                background: '#FFD700',
                color: '#000',
                border: '4px solid #000',
                padding: '16px 40px',
                fontSize: '18px'
              }}
            >
              Find Your Vibe
            </Link>
          </div>
          <div className="brutal-collage">
            <div className="brutal-collage-item">
              <img src="/images/market/hat-brand-beef.jpg" alt="Hat Brand Beef vendor" />
            </div>
            <div className="brutal-collage-item">
              <img src="/images/market/cotton-candy-truck.jpg" alt="Cotton candy truck" />
            </div>
            <div className="brutal-collage-item">
              <img src="/images/market/beaded-jewelry.jpg" alt="Handmade jewelry" />
            </div>
            <div className="brutal-collage-item">
              <img src="/images/market/live-band.jpg" alt="Live music" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== INFO STRIP (Yellow) ===== */}
      <section style={{
        background: '#FFD700',
        padding: '30px 20px'
      }}>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#000',
          textAlign: 'center',
          maxWidth: '800px',
          margin: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          fontWeight: 500
        }}>
          Twin Falls Market on Main is a local vendor market that runs every Saturday from June 6 - August 8 in Downtown Twin Falls.
        </p>
      </section>

      {/* ===== MEET YOUR LOCAL MAKERS (White) ===== */}
      <section style={{
        background: '#fff',
        padding: '80px 20px'
      }}>
        <h2 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(60px, 14vw, 160px)',
          color: '#0056b3',
          textAlign: 'center',
          margin: '0 0 50px 0',
          lineHeight: 1,
          letterSpacing: '0.08em'
        }}>
          Local Makers
        </h2>
        <div className="brutal-grid-4">
          <div className="brutal-card">
            <img src="/images/market/plant-cart.jpg" alt="Fresh produce and plants" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">The Growers</h3>
              <p className="brutal-card-text">
                Farm-fresh produce, plants, and flowers straight from Idaho soil.
              </p>
            </div>
          </div>
          <div className="brutal-card">
            <img src="/images/market/beaded-jewelry.jpg" alt="Handmade crafts" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">The Makers</h3>
              <p className="brutal-card-text">
                Handmade pottery, jewelry, and crafts made with care by local artisans.
              </p>
            </div>
          </div>
          <div className="brutal-card">
            <img src="/images/market/cotton-candy-truck.jpg" alt="Food trucks and sweet treats" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">The Eats</h3>
              <p className="brutal-card-text">
                Food trucks, sweet treats, and delicious bites to fuel your market morning.
              </p>
            </div>
          </div>
          <div className="brutal-card">
            <img src="/images/market/artist-tapestries.jpg" alt="Unique finds" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">Vintage & Finds</h3>
              <p className="brutal-card-text">
                One-of-a-kind treasures and unique goods you won't find anywhere else.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ===== GET INVOLVED (Red) ===== */}
      <section className="brutal-section brutal-section-red">
        <h2 className="brutal-section-heading brutal-section-heading-white" style={{ fontSize: 'clamp(48px, 10vw, 120px)', letterSpacing: '0.08em' }}>
          Let's be serious friends
        </h2>
        <div className="brutal-grid-3">
          <div className="brutal-card">
            <img src="/images/market/jae-foundation.jpg" alt="Volunteer" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">Volunteer</h3>
              <p className="brutal-card-text">
                Help us set up, welcome neighbors, and keep the good vibes going.
              </p>
            </div>
          </div>
          <div className="brutal-card">
            <img src="/images/market/firefighters-community.jpg" alt="Sponsor" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">Sponsor</h3>
              <p className="brutal-card-text">
                Support local and get your business in front of the community.
              </p>
            </div>
          </div>
          <div className="brutal-card">
            <img src="/images/market/live-band.jpg" alt="Community" />
            <div className="brutal-card-content">
              <h3 className="brutal-card-title">Community</h3>
              <p className="brutal-card-text">
                This is your market. Come hang, shop, and connect.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ===== SPONSORS (Blue) ===== */}
      <section className="brutal-section brutal-section-blue">
        <h2 className="brutal-section-heading brutal-section-heading-white" style={{ fontSize: 'clamp(60px, 14vw, 160px)', marginBottom: '10px', letterSpacing: '0.08em' }}>
          Live Music All Day
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#fff',
          fontFamily: "'Sora', sans-serif",
          fontSize: '24px',
          marginBottom: '40px'
        }}>
          Sponsored 100% by local businesses.
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


      {/* ===== MANIFESTO (White) ===== */}
      <section style={{
        background: '#fff',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(48px, 10vw, 120px)',
            color: '#E30613',
            margin: '0 0 30px 0',
            lineHeight: 1,
            letterSpacing: '0.08em'
          }}>
            Market on Main is Where Twin Falls Comes Together.
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#333',
            lineHeight: 1.7,
            margin: '0 0 32px 0'
          }}>
            Saturdays in the summer, we set up on Main Ave for live music, handmade goods, and farm-fresh finds. It's not just a market — it's a tradition. Grab a coffee, say hi to your neighbors, and enjoy the vibe.
          </p>
          <Link to="/calendar" className="brutal-btn" style={{
            background: '#FFD700',
            color: '#000',
            border: '4px solid #000',
            padding: '16px 40px',
            fontSize: '18px'
          }}>
            See You Saturday
          </Link>
        </div>
      </section>

      {/* ===== MARKET INFO STRIP ===== */}
      <div style={{
        background: '#000',
        color: '#FFD700',
        padding: '20px 0',
        textAlign: 'center',
        fontFamily: 'Archivo Black, sans-serif',
        fontSize: '18px',
        textTransform: 'uppercase',
        letterSpacing: '3px'
      }}>
        EVERY SATURDAY | JUNE - AUGUST | 9AM - 2PM | 100 BLOCK MAIN AVE N, TWIN FALLS
      </div>
    </div>
  );
};

export default Home;
