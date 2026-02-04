import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: '#fff',
      border: '3px solid #000',
      marginBottom: '12px'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px 20px',
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
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 700,
          fontSize: '15px',
          color: '#000'
        }}>
          {question}
        </span>
        <span style={{
          fontSize: '14px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{
          padding: '0 20px 16px 20px',
          fontFamily: "'Sora', sans-serif",
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#333'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const BecomeVendor = () => {
  return (
    <div style={{ background: '#1a56db', minHeight: '100vh' }}>
      {/* Header Section */}
      <section style={{ padding: '60px 20px 40px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(60px, 14vw, 160px)',
          color: '#fff',
          margin: '0 0 24px 0',
          letterSpacing: '0.08em',
          lineHeight: 1
        }}>
          Become a Vendor
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '18px',
          lineHeight: '1.7',
          color: '#fff',
          maxWidth: '700px',
          margin: '0 auto 16px',
          fontWeight: 600
        }}>
          Thank you for your interest in joining the Market on Main. Unlike some other markets, the Market on Main is a cooperative group of makers, shakers, growers and farmers that love Downtown Twin Falls!
        </p>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '16px',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '700px',
          margin: '0 auto 32px'
        }}>
          If you would like to sell at the market, you must first be approved. We strive to provide a wide variety of products to the community while maintaining an engaging market for our members. We only have a limited number of new vendor spots available each year.
        </p>
        <Link
          to="/apply"
          className="brutal-btn brutal-btn-yellow"
          style={{ padding: '16px 40px', fontSize: '18px' }}
        >
          Apply Now
        </Link>
      </section>

      {/* Two Column Section */}
      <section style={{ padding: '40px 20px 60px' }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left - Contact Card */}
          <div style={{
            background: '#fff',
            border: '4px solid #000',
            padding: '32px'
          }}>
            <h3 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '24px',
              color: '#000',
              margin: '0 0 20px 0',
              textTransform: 'lowercase'
            }}>
              have questions?
            </h3>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#333',
              margin: '0 0 8px 0'
            }}>
              Send us an email at
            </p>
            <a
              href="mailto:info@tfmarketonmain.com"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: '#000',
                textDecoration: 'underline'
              }}
            >
              info@tfmarketonmain.com
            </a>
            <div style={{ marginTop: '24px' }}>
              <Link
                to="/calendar"
                className="brutal-btn"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  background: '#1a56db',
                  color: '#fff',
                  border: '3px solid #000'
                }}
              >
                View Market Dates
              </Link>
            </div>
          </div>

          {/* Right - FAQ Dropdowns */}
          <div>
            <FAQItem question="What are the vendor rates?">
              <p style={{ margin: '0 0 12px 0' }}><strong>Single Booth (10'x10'):</strong></p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
                <li>Full Season (10 Saturdays): $500</li>
                <li>6 Saturdays of your choice: $350</li>
                <li>3 Saturdays of your choice: $195</li>
              </ul>
              <p style={{ margin: '0 0 12px 0' }}><strong>Double Booth (20'x10'):</strong></p>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
                <li>Full Season (10 Saturdays): $750</li>
                <li>6 Saturdays of your choice: $550</li>
                <li>3 Saturdays of your choice: $290</li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>Power:</strong> $15 one-time fee if you need electricity at your booth.
              </p>
            </FAQItem>

            <FAQItem question="Do I have to attend every Saturday?">
              <p style={{ margin: 0 }}>
                No! You can choose to attend 3, 6, or all 10 market dates. When you apply, you'll select which dates work best for you. Full season vendors get the best rate and guaranteed placement. We understand schedules vary—that's why we offer flexible options.
              </p>
            </FAQItem>

            <FAQItem question="What is the cancellation / no-show policy?">
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>48-Hour Cancellation Notice:</strong> If you need to cancel a market date, please notify us at least 48 hours in advance. Failure to provide adequate notice may result in forfeiting your vendor space and market dues.
              </p>
              <p style={{ margin: 0 }}>
                <strong>No-Show Fee:</strong> If you do not call or show up to your agreed market dates, there will be an automatic $45 inconvenience fee charged to your card on file.
              </p>
            </FAQItem>

            <FAQItem question="What do I need to bring?">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>10'x10' canopy/tent</strong> (required for all vendors)</li>
                <li><strong>20 lb. weights on each leg</strong> of your canopy (no stakes allowed on the street)</li>
                <li>Tables and display materials for your products</li>
                <li>Your own chairs</li>
                <li>Cash box and change (card readers optional but recommended)</li>
                <li>Signage with your business name and prices</li>
              </ul>
            </FAQItem>

            <FAQItem question="Are you a good fit for the Market?">
              <p style={{ margin: '0 0 12px 0' }}>Ask yourself:</p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Are you a farmer, rancher, baker, artisan, or unique small business owner?</li>
                <li>Are you a locally owned small business that sells your own products?</li>
                <li>Do you make or grow your product here in Idaho?</li>
                <li>Have you been to the Market to see if your product would add something unique?</li>
              </ul>
            </FAQItem>

            <FAQItem question="What are the application requirements?">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Applying for specific dates does not confirm those dates—dates are confirmed at approval.</li>
                <li>Vendors must have a 10'x10' canopy with 20 lbs. weights on each leg.</li>
                <li>Specialty Food applicants: be prepared to drop off samples for the board.</li>
                <li>Artisans & small businesses: we require digital images of your work and display.</li>
                <li>Include 3-5 photos of your products and booth setup in your application.</li>
              </ul>
            </FAQItem>

            <FAQItem question="What is the review process?">
              <p style={{ margin: '0 0 12px 0' }}>
                All applications are reviewed by the Market on Main board. We will notify you ASAP when we've decided on your application. During this process, the Board may request more information or require a pre-acceptance inspection.
              </p>
              <p style={{ margin: 0 }}>
                In general, a higher direct local impact, closer geographic location to Twin Falls, and handmade products tend to increase an application's chances.
              </p>
            </FAQItem>

            <FAQItem question="Are non-profits welcome?">
              <p style={{ margin: 0 }}>
                Yes! <strong>Non-profit groups are free to join</strong>, but still need to fill out an application so we can coordinate your participation.
              </p>
            </FAQItem>

            <FAQItem question="When will I be charged?">
              <p style={{ margin: 0 }}>
                You will be notified of acceptance and charged on or before April 2026.
              </p>
            </FAQItem>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeVendor;
