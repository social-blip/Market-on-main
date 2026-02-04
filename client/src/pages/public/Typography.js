import React from 'react';
import { Link } from 'react-router-dom';

const Typography = () => {
  return (
    <div style={{ padding: '40px', background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Headings Section */}
        <section style={{
          marginBottom: '60px',
          padding: '40px',
          background: '#FFD700',
          border: '5px solid #000',
          boxShadow: '8px 8px 0px #000'
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '30px',
            color: '#666'
          }}>
            Headings — Bricolage Grotesque 800
          </h3>

          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '72px',
            lineHeight: 1,
            marginBottom: '20px',
            color: '#E30613'
          }}>
            H1 — Market on Main
          </h1>

          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '56px',
            lineHeight: 1.1,
            marginBottom: '20px',
            color: '#0056b3'
          }}>
            H2 — Our Vendors Are the Real Deal
          </h2>

          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '42px',
            lineHeight: 1.1,
            marginBottom: '20px',
            color: '#000'
          }}>
            H3 — Fuel the Chaos
          </h3>

          <h4 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '32px',
            lineHeight: 1.2,
            marginBottom: '20px',
            color: '#000'
          }}>
            H4 — The Growers & Makers
          </h4>

          <h5 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            lineHeight: 1.2,
            marginBottom: '20px',
            color: '#000'
          }}>
            H5 — Fresh Produce Daily
          </h5>

          <h6 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: 1.3,
            marginBottom: '0',
            color: '#000'
          }}>
            H6 — Every Saturday Morning
          </h6>
        </section>

        {/* Body Text Section */}
        <section style={{
          marginBottom: '60px',
          padding: '40px',
          background: '#fff',
          border: '5px solid #000',
          boxShadow: '8px 8px 0px #000'
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '30px',
            color: '#666'
          }}>
            Body Text — Sora
          </h3>

          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 400,
            fontSize: '18px',
            lineHeight: 1.7,
            marginBottom: '20px',
            color: '#333'
          }}>
            <strong>Regular (400) 18px:</strong> Market on Main is Twin Falls' raw and unfiltered farmers market. We are the home for obsessives, real food rebels, local hustlers, and creators of all kinds. From farm-fresh to totally unexpected.
          </p>

          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: 1.6,
            marginBottom: '20px',
            color: '#333'
          }}>
            <strong>Medium (500) 16px:</strong> Every Saturday from June through August, the 100 block of Main Avenue transforms into a vibrant community gathering place. Local farmers bring fresh vegetables, artisans showcase handmade crafts, and food trucks serve up delicious eats.
          </p>

          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '20px',
            color: '#666'
          }}>
            <strong>Regular (400) 14px:</strong> This isn't a quiet stroll through a typical market. It's a community takeover — loud music, bold flavors, and neighbors connecting over locally grown goodness. Join us and experience the energy.
          </p>

          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: 1.5,
            marginBottom: '0',
            color: '#000'
          }}>
            <strong>Semibold (600) 16px:</strong> Ready to join the chaos? Become a vendor, volunteer, or sponsor today.
          </p>
        </section>

        {/* Links Section */}
        <section style={{
          marginBottom: '60px',
          padding: '40px',
          background: '#0056b3',
          border: '5px solid #000',
          boxShadow: '8px 8px 0px #000'
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '30px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            Links & Navigation — Sora
          </h3>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
            <Link to="/" style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '3px solid #fff'
            }}>
              Home
            </Link>
            <Link to="/calendar" style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '3px solid transparent'
            }}>
              Calendar
            </Link>
            <Link to="/vendors" style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '3px solid transparent'
            }}>
              Vendors
            </Link>
          </div>

          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#fff'
          }}>
            Inline link example: Visit our <a href="#" style={{ color: '#FFD700', textDecoration: 'underline' }}>vendor application page</a> to get started, or check out our <a href="#" style={{ color: '#FFD700', textDecoration: 'underline' }}>FAQ section</a> for more info.
          </p>
        </section>

        {/* Buttons Section */}
        <section style={{
          marginBottom: '60px',
          padding: '40px',
          background: '#E30613',
          border: '5px solid #000',
          boxShadow: '8px 8px 0px #000'
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '30px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            Buttons — Sora 700
          </h3>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px 32px',
              background: '#FFD700',
              color: '#000',
              border: '5px solid #000',
              cursor: 'pointer'
            }}>
              Join the Chaos
            </button>

            <button style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px 32px',
              background: '#0056b3',
              color: '#FFD700',
              border: '5px solid #000',
              cursor: 'pointer'
            }}>
              Become a Vendor
            </button>

            <button style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px 32px',
              background: '#fff',
              color: '#000',
              border: '5px solid #000',
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </section>

        {/* Summary */}
        <section style={{
          padding: '30px',
          background: '#f5f5f5',
          border: '3px solid #000'
        }}>
          <h4 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            marginBottom: '15px'
          }}>
            Typography Summary
          </h4>
          <ul style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '14px',
            lineHeight: 2,
            paddingLeft: '20px'
          }}>
            <li><strong>Headings:</strong> Bricolage Grotesque, weight 800</li>
            <li><strong>Body:</strong> Sora, weights 400-600</li>
            <li><strong>Navigation:</strong> Sora, weight 600, uppercase</li>
            <li><strong>Buttons:</strong> Sora, weight 700</li>
            <li><strong>Links:</strong> Sora, with #FFD700 accent on dark backgrounds</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default Typography;
