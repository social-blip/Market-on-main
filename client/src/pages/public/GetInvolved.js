import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/getinvolved.css';

const GetInvolved = () => {
  return (
    <div className="involved-page">
      {/* Hero Section */}
      <section className="involved-page__hero">
        <h1 className="involved-page__title">GET INVOLVED</h1>
        <p className="involved-page__subtitle">
          Market on Main is more than a farmers market — it's a community. Here's how you can be part of it.
        </p>
      </section>

      {/* Vendor Section */}
      <section className="involved-page__section">
        <div className="involved-page__grid">
          <div className="involved-page__image">
            <img src="/images/market/vendor-booth.jpg" alt="Vendors at Market on Main" />
          </div>
          <div className="involved-page__content">
            <Link to="/become-vendor" className="involved-page__tag involved-page__tag--maroon">Sell With Us</Link>
            <h2 className="involved-page__heading">Become a Vendor</h2>
            <p className="involved-page__text">
              Got something handmade, homegrown, or homemade? We want you at Market on Main. Join our community of local makers and growers.
            </p>
            <div className="involved-page__list-card">
              <ul className="involved-page__list">
                <li>10x10 booth spaces available</li>
                <li>Flexible scheduling options</li>
                <li>Marketing and promotion support</li>
                <li>A built-in community of customers</li>
              </ul>
            </div>
            <Link to="/become-vendor" className="involved-page__btn">
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Musician Section */}
      <section className="involved-page__section involved-page__section--maroon">
        <div className="involved-page__grid involved-page__grid--reverse">
          <div className="involved-page__image">
            <img src="/images/market/Live-Music.jpg" alt="Live music at Market on Main" />
          </div>
          <div className="involved-page__content">
            <Link to="/contact?reason=Performing at the Market" className="involved-page__tag involved-page__tag--dark">Play Live</Link>
            <h2 className="involved-page__heading involved-page__heading--light">Perform at the Market</h2>
            <p className="involved-page__text involved-page__text--light">
              Bring your sound to Market on Main. We feature live music every market day and we're always looking for local artists to share the stage.
            </p>
            <div className="involved-page__list-card">
              <ul className="involved-page__list">
                <li>Play for an engaged, supportive crowd</li>
                <li>Paid performance opportunities</li>
                <li>Sound equipment provided</li>
                <li>Great exposure for local artists</li>
              </ul>
            </div>
            <Link to="/contact?reason=Performing at the Market" className="involved-page__btn involved-page__btn--yellow">
              Apply to Perform
            </Link>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="involved-page__section">
        <div className="involved-page__grid">
          <div className="involved-page__image">
            <img src="/images/market/jae-foundation.jpg" alt="Volunteers at Market on Main" />
          </div>
          <div className="involved-page__content">
            <Link to="/contact?reason=Volunteering" className="involved-page__tag involved-page__tag--maroon">Join The Crew</Link>
            <h2 className="involved-page__heading">Volunteer</h2>
            <p className="involved-page__text">
              Help us set up, welcome neighbors, and keep the good vibes going. Our volunteers are the heart of Market on Main.
            </p>
            <div className="involved-page__list-card">
              <ul className="involved-page__list">
                <li>Help with setup and breakdown</li>
                <li>Greet visitors and answer questions</li>
                <li>Assist vendors as needed</li>
                <li>Keep the market running smoothly</li>
              </ul>
            </div>
            <Link to="/contact?reason=Volunteering" className="involved-page__btn">
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsor Section */}
      <section className="involved-page__section involved-page__section--maroon">
        <div className="involved-page__grid involved-page__grid--reverse">
          <div className="involved-page__image">
            <img src="/images/market/firefighters-community.jpg" alt="Community sponsors" />
          </div>
          <div className="involved-page__content">
            <Link to="/contact?reason=Sponsoring" className="involved-page__tag involved-page__tag--dark">Support Local</Link>
            <h2 className="involved-page__heading involved-page__heading--light">Sponsor</h2>
            <p className="involved-page__text involved-page__text--light">
              Get your business in front of the community. Sponsoring Market on Main connects you with hundreds of engaged neighbors every market day.
            </p>
            <div className="involved-page__list-card">
              <ul className="involved-page__list">
                <li>Logo placement on market signage</li>
                <li>Social media recognition</li>
                <li>Booth space opportunities</li>
                <li>Community goodwill</li>
              </ul>
            </div>
            <Link to="/contact?reason=Sponsoring" className="involved-page__btn involved-page__btn--yellow">
              Become A Sponsor
            </Link>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="involved-page__section">
        <div className="involved-page__grid">
          <div className="involved-page__image">
            <img src="/images/market/community-card.jpg" alt="Community at Market on Main" />
          </div>
          <div className="involved-page__content">
            <Link to="/contact" className="involved-page__tag involved-page__tag--maroon">Your Market</Link>
            <h2 className="involved-page__heading">Community</h2>
            <p className="involved-page__text">
              This is your market. Come hang, shop, and connect. Market on Main is a place where neighbors become friends and local makers find their people.
            </p>
            <div className="involved-page__list-card">
              <ul className="involved-page__list">
                <li>Fresh produce and handmade goods</li>
                <li>Live music every market day</li>
                <li>Family-friendly activities</li>
                <li>A place to call your own</li>
              </ul>
            </div>
            <Link to="/contact" className="involved-page__btn">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="involved-page__cta">
        <h2 className="involved-page__cta-title">Ready to Join Us?</h2>
        <p className="involved-page__cta-text">
          Whether you want to volunteer, sponsor, or just say hi — we'd love to hear from you.
        </p>
        <div className="involved-page__cta-buttons">
          <Link to="/contact" className="involved-page__cta-btn involved-page__cta-btn--yellow">
            Get In Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
