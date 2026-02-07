import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left'
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'var(--dark)'
        }}>
          {question}
        </span>
        <span style={{
          fontSize: '14px',
          color: 'var(--maroon)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{
          padding: '0 24px 20px 24px',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: '1.7',
          color: 'var(--gray-dark)'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const BecomeVendor = () => {
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
          fontSize: 'clamp(48px, 10vw, 100px)',
          color: 'var(--cream)',
          margin: '0 0 24px 0',
          textTransform: 'uppercase',
          lineHeight: 1
        }}>
          Become a Vendor
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'var(--cream)',
          maxWidth: '700px',
          margin: '0 auto 16px',
          opacity: 0.95
        }}>
          Thank you for your interest in joining Market on Main. Unlike some other markets, we're a cooperative group of makers, shakers, growers and farmers that love Downtown Twin Falls!
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: '1.7',
          color: 'var(--cream)',
          maxWidth: '700px',
          margin: '0 auto 32px',
          opacity: 0.8
        }}>
          If you would like to sell at the market, you must first be approved. We strive to provide a wide variety of products while maintaining an engaging market for our members.
        </p>
        <Link
          to="/apply"
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
          Apply Now
        </Link>
      </section>

      {/* Two Column Section */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Left - Contact Card */}
          <div>
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: '24px'
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '24px',
                color: 'var(--dark)',
                margin: '0 0 16px 0',
                textTransform: 'uppercase'
              }}>
                Have Questions?
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                lineHeight: '1.7',
                color: 'var(--gray-dark)',
                margin: '0 0 8px 0'
              }}>
                Send us an email at
              </p>
              <a
                href="mailto:info@tfmarketonmain.com"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--maroon)',
                  textDecoration: 'underline'
                }}
              >
                info@tfmarketonmain.com
              </a>
              <div style={{ marginTop: '24px' }}>
                <Link
                  to="/find-us"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    background: 'var(--maroon)',
                    color: 'var(--cream)',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    textTransform: 'uppercase'
                  }}
                >
                  View Market Dates
                </Link>
              </div>
            </div>

            {/* Pricing Card */}
            <div
              style={{
                background: 'var(--maroon)',
                borderRadius: '16px',
                padding: '32px',
                color: 'var(--cream)'
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '24px',
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                color: 'var(--yellow)'
              }}>
                Vendor Rates
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 8px 0', fontSize: '16px' }}>
                  Single Booth (10'x10')
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8 }}>
                  <li>Full Season (10 Saturdays): $500</li>
                  <li>6 Saturdays: $350</li>
                  <li>3 Saturdays: $195</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 8px 0', fontSize: '16px' }}>
                  Double Booth (20'x10')
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.8 }}>
                  <li>Full Season (10 Saturdays): $750</li>
                  <li>6 Saturdays: $550</li>
                  <li>3 Saturdays: $290</li>
                </ul>
              </div>

              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '14px', opacity: 0.9 }}>
                <strong>Power:</strong> $15 one-time fee if needed
              </p>
              <p style={{ margin: '12px 0 0 0', fontFamily: 'var(--font-body)', fontSize: '13px', opacity: 0.8, fontStyle: 'italic' }}>
                + 3% processing fee if paying by Credit Card
              </p>
            </div>
          </div>

          {/* Right - FAQ Dropdowns */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--dark)',
              margin: '0 0 20px 0',
              textTransform: 'uppercase'
            }}>
              Frequently Asked Questions
            </h3>

            <FAQItem question="Do I have to attend every Saturday?">
              <p style={{ margin: 0 }}>
                No! You can choose to attend 3, 6, or all 10 market dates. When you apply, you'll select which dates work best for you. Full season vendors get the best rate and guaranteed placement.
              </p>
            </FAQItem>

            <FAQItem question="What is the cancellation / no-show policy?">
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>48-Hour Notice:</strong> Please notify us at least 48 hours in advance if you need to cancel.
              </p>
              <p style={{ margin: 0 }}>
                <strong>No-Show Fee:</strong> $45 inconvenience fee if you don't show without notice.
              </p>
            </FAQItem>

            <FAQItem question="What do I need to bring?">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>10'x10' canopy/tent (required)</li>
                <li>20 lb. weights on each leg (no stakes on street)</li>
                <li>Tables and display materials</li>
                <li>Cash box and change</li>
                <li>Signage with your business name and prices</li>
              </ul>
            </FAQItem>

            <FAQItem question="Are you a good fit for the Market?">
              <p style={{ margin: '0 0 12px 0' }}>Ask yourself:</p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Are you a farmer, rancher, baker, artisan, or small business owner?</li>
                <li>Do you sell your own locally-made products?</li>
                <li>Do you make or grow your product in Idaho?</li>
              </ul>
            </FAQItem>

            <FAQItem question="What are the application requirements?">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>10'x10' canopy with 20 lb. weights on each leg</li>
                <li>Specialty Food: be prepared to drop off samples</li>
                <li>Artisans: include photos of your work and display</li>
                <li>Include 3-5 photos of your products in your application</li>
              </ul>
            </FAQItem>

            <FAQItem question="What is the review process?">
              <p style={{ margin: 0 }}>
                All applications are reviewed by the Market on Main board. We'll notify you when we've decided. Higher local impact, closer location to Twin Falls, and handmade products tend to increase chances.
              </p>
            </FAQItem>

            <FAQItem question="Are non-profits welcome?">
              <p style={{ margin: 0 }}>
                Yes! <strong>Non-profit groups are free to join</strong>, but still need to fill out an application so we can coordinate.
              </p>
            </FAQItem>

            <FAQItem question="When will I be charged?">
              <p style={{ margin: 0 }}>
                Once accepted, your invoice will be ready to pay via the portal.
              </p>
            </FAQItem>
          </div>
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
          Ready to Join?
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--cream)',
          opacity: 0.8,
          margin: '0 0 24px 0'
        }}>
          Applications are now open for the 2026 season.
        </p>
        <Link
          to="/apply"
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
          Start Your Application
        </Link>
      </section>
    </div>
  );
};

export default BecomeVendor;
