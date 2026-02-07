import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/findus.css';

const FindUs = () => {
  return (
    <div className="findus-page">
      {/* Hero Section */}
      <section className="findus-page__hero">
        <h1 className="findus-page__title">FIND US</h1>
        <p className="findus-page__subtitle">
          We're in the heart of Downtown Twin Falls, right on Main Avenue.
        </p>
      </section>

      {/* Info Cards Section */}
      <section className="findus-page__cards">
        <div className="findus-page__cards-grid">
          {/* Location Card */}
          <div className="info-card">
            <div className="info-card__header info-card__header--maroon">
              <h2 className="info-card__title info-card__title--light">Location</h2>
            </div>
            <div className="info-card__body">
              <p className="info-card__address">
                100 Block of Main Avenue North<br />
                Twin Falls, ID 83301
              </p>
              <p className="info-card__text">
                We set up on the 100 block of Main Ave N in Downtown Twin Falls, right in front of the historic buildings. Look for the tents, hear the music, and follow the smell of fresh food!
              </p>
              <a
                href="https://maps.google.com/?q=100+Main+Ave+N,+Twin+Falls,+ID+83301"
                target="_blank"
                rel="noopener noreferrer"
                className="info-card__btn"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Hours Card */}
          <div className="info-card">
            <div className="info-card__header info-card__header--maroon">
              <h2 className="info-card__title info-card__title--light">Market Hours</h2>
            </div>
            <div className="info-card__body">
              <p className="info-card__day">Every Saturday</p>
              <p className="info-card__time">9:00 AM - 2:00 PM</p>
              <p className="info-card__text">
                June 6 through August 8, 2026<br />
                Rain or shine — we'll be there!
              </p>
            </div>
          </div>

          {/* Contact Card */}
          <div className="info-card">
            <div className="info-card__header info-card__header--maroon">
              <h2 className="info-card__title info-card__title--light">Contact</h2>
            </div>
            <div className="info-card__body">
              <p className="info-card__label">Email</p>
              <a href="mailto:info@tfmarketonmain.com" className="info-card__email">
                info@tfmarketonmain.com
              </a>
              <p className="info-card__text">
                Questions about vending, sponsorship, or anything else? Drop us a line and we'll get back to you!
              </p>
              <Link to="/contact" className="info-card__btn">
                We're All Ears
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="findus-page__social">
        <h2 className="findus-page__social-title">Let's Be Friends</h2>
        <p className="findus-page__social-text">
          Stay up to date with vendor announcements, live music lineups, and market day vibes.
        </p>
        <div className="findus-page__social-links">
          <a
            href="https://www.facebook.com/marketonmaintwinfalls"
            target="_blank"
            rel="noopener noreferrer"
            className="findus-page__social-btn"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/market_on_main_twinfalls"
            target="_blank"
            rel="noopener noreferrer"
            className="findus-page__social-btn"
          >
            Instagram
          </a>
        </div>
      </section>

      {/* Map Section */}
      <section className="findus-page__map">
        <iframe
          title="Market on Main Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2942.8!2d-114.4608!3d42.5558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54ace251e17a4e39%3A0x123456789!2s100%20Main%20Ave%20N%2C%20Twin%20Falls%2C%20ID%2083301!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="400"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* CTA Section */}
      <section className="findus-page__cta">
        <h2 className="findus-page__cta-title">See You Saturday!</h2>
        <p className="findus-page__cta-text">
          Every Saturday, June through August<br />
          9 AM - 2 PM · Downtown Twin Falls
        </p>
        <Link to="/vendors" className="findus-page__cta-btn">
          Meet Our Vendors
        </Link>
      </section>
    </div>
  );
};

export default FindUs;
