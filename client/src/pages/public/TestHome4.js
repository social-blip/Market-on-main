import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/public.css';

// Vertical scrolling image column component (per-item infinite marquee)
const VerticalImageColumn = ({ images, direction = 'up', borderColors = ['yellow', 'purple', 'cyan', 'pink'] }) => {
  const count = images.length;
  const colorMap = {
    yellow: 'image-column__item--yellow',
    purple: 'image-column__item--purple',
    cyan: 'image-column__item--cyan',
    pink: 'image-column__item--pink',
  };

  return (
    <div className={`image-column image-column--${direction}`} style={{ '--count': count }}>
      {images.map((src, i) => (
        <div key={i} className={`image-column__item ${colorMap[borderColors[i % borderColors.length]]}`} style={{ '--index': i + 1 }}>
          <img src={src} alt="" className="image-column__img" />
        </div>
      ))}
    </div>
  );
};

// Vendor Card
const GREETINGS = [
  "Say Howdy →",
  "Meet the Maker →",
  "Come Say Hi →",
  "Get to Know Us →",
  "Stop By & Say Hey →",
  "Wave Hello →",
  "Let's Chat →",
  "Pop In & Visit →",
  "Swing By →",
  "See What's Good →",
  "Check Us Out →",
  "Find Us Saturday →",
  "Come Hang →",
  "Say Hey →",
  "Meet Your Neighbor →"
];

const VendorCard = ({ vendor, onPartialClick, isPartial }) => {
  // Truncate description to ~120 characters
  const truncateDesc = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Pick a consistent greeting based on vendor id
  const greeting = GREETINGS[vendor.id % GREETINGS.length];

  const handleClick = (e) => {
    if (isPartial && onPartialClick) {
      e.preventDefault();
      onPartialClick();
    }
  };

  return (
    <Link to={`/vendors/${vendor.id || ''}`} className="homepage-vendor-card" onClick={handleClick}>
      <div className="homepage-vendor-card__img">
        {vendor.image_url ? (
          <img src={vendor.image_url} alt={vendor.business_name} loading="lazy" />
        ) : (
          <div className="homepage-vendor-card__placeholder">
            {vendor.business_name?.charAt(0) || '?'}
          </div>
        )}
        {vendor.next_date && (
          <div className="homepage-vendor-card__date">
            <div className="homepage-vendor-card__date-label">Next up</div>
            <div>{formatDate(vendor.next_date)}</div>
          </div>
        )}
      </div>
      <div className="homepage-vendor-card__content">
        <div className="homepage-vendor-card__tags">
          <span className="homepage-vendor-card__tag">{vendor.category}</span>
          {vendor.market_count >= 10 && (
            <span className="homepage-vendor-card__tag homepage-vendor-card__tag--regular">Every Saturday</span>
          )}
        </div>
        <h3 className="homepage-vendor-card__title">{vendor.business_name}</h3>
        <p className="homepage-vendor-card__desc">{truncateDesc(vendor.description)}</p>
        <span className="homepage-vendor-card__btn">{greeting}</span>
      </div>
    </Link>
  );
};

// News Card
const NewsCard = ({ article }) => (
  <Link to={article.link || '/'} className="news-card">
    <div className="news-card__img">
      <img src={article.image} alt="" loading="lazy" />
    </div>
    {article.tag && <p className="news-card__tag">{article.tag}</p>}
    <h4 className="news-card__title">{article.title}</h4>
    <p className="news-card__desc">{article.description}</p>
    <span className="news-card__link">Read more</span>
  </Link>
);

// CTA Card
const CTACard = ({ title, tagline, buttonText, link, variant = 'yellow' }) => (
  <Link to={link} className={`cta-card cta-card--${variant}`}>
    <h3 className="cta-card__title">{title}</h3>
    <p className="cta-card__tagline">{tagline}</p>
    <span className="cta-card__btn">{buttonText}</span>
  </Link>
);

// Section Header
const SectionHeader = ({ label, heading, children }) => (
  <div className="section-header">
    {label && <p className="section-header__label">{label}</p>}
    <h2 className="section-header__heading">{heading}</h2>
    {children}
  </div>
);

const TestHome4 = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [allVendors, setAllVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [musicLineup, setMusicLineup] = useState([]);
  const [musicIndex, setMusicIndex] = useState(0);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const musicScrollRef = useRef(null);
  const CARD_WIDTH = 260; // card width (240) + gap (20)

  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get('/vendors/public');
        setAllVendors(response.data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      }
    };
    fetchVendors();
  }, []);

  // Fetch featured blog posts for news section
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await api.get('/blog/featured');
        setFeaturedPosts(response.data);
      } catch (err) {
        console.error('Error fetching featured posts:', err);
      }
    };
    fetchFeaturedPosts();
  }, []);

  // Fetch music schedule
  useEffect(() => {
    const fetchMusicSchedule = async () => {
      try {
        const response = await api.get('/music/schedule/upcoming?limit=12');
        setMusicLineup(response.data);
      } catch (err) {
        console.error('Error fetching music schedule:', err);
      }
    };
    fetchMusicSchedule();
  }, []);

  // Music section navigation
  const totalMusicDots = Math.ceil(musicLineup.length / 3);

  const scrollMusicToIndex = (index) => {
    setMusicIndex(index);
    if (musicScrollRef.current) {
      musicScrollRef.current.scrollTo({
        left: index * CARD_WIDTH * 3,
        behavior: 'smooth'
      });
    }
  };

  const goToMusicPrev = () => {
    const newIndex = Math.max(0, musicIndex - 1);
    scrollMusicToIndex(newIndex);
  };

  const goToMusicNext = () => {
    const newIndex = Math.min(totalMusicDots - 1, musicIndex + 1);
    scrollMusicToIndex(newIndex);
  };

  // Format date for music cards (no weekday - market is always Saturday)
  const formatMusicDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Filter vendors
  const vendors = useMemo(() => {
    if (allVendors.length === 0) return [];
    if (vendorFilter === 'all') return allVendors;
    return allVendors.filter(v => v.category === vendorFilter);
  }, [allVendors, vendorFilter]);

  // Calculate total dots (groups of 3)
  const totalDots = Math.ceil(vendors.length / 3);

  // Reset position when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [vendorFilter]);

  // Scroll to specific index
  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * CARD_WIDTH * 3,
        behavior: 'smooth'
      });
    }
  };

  // Navigation functions
  const goToPrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = Math.min(totalDots - 1, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  // Update dots on swipe scroll for vendors
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const index = Math.round(el.scrollLeft / (CARD_WIDTH * 3));
        setCurrentIndex(Math.min(index, totalDots - 1));
      }, 100);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [totalDots]);

  // Update dots on swipe scroll for music
  useEffect(() => {
    const el = musicScrollRef.current;
    if (!el) return;
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const index = Math.round(el.scrollLeft / (CARD_WIDTH * 3));
        setMusicIndex(Math.min(index, totalMusicDots - 1));
      }, 100);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [totalMusicDots]);

  // Default news items as fallback
  const defaultNews = [
    { title: 'Live Music Lineup Announced', description: "Check out who's playing every Saturday this summer.", image: '/images/market/live-band.jpg', tag: 'Music', link: '/' },
    { title: 'New Vendors This Season', description: 'Meet the newest makers joining our market family.', image: '/images/market/makers-card.jpg', tag: 'Vendors', link: '/vendors' },
    { title: 'Volunteer With Us', description: 'Help make the market magic happen every week.', image: '/images/market/jae-foundation.jpg', tag: 'Community', link: '/get-involved' },
    { title: 'Sponsor Spotlight', description: 'Thanks to our amazing local business sponsors.', image: '/images/market/firefighters-community.jpg', tag: 'Sponsors', link: '/get-involved' },
  ];

  // Use featured posts if available, otherwise use default news
  const news = featuredPosts.length > 0
    ? featuredPosts.map(post => ({
        title: post.title,
        description: post.excerpt || post.title,
        image: post.image_url || '/images/market/community-card.jpg',
        tag: post.tag,
        link: `/blog/${post.slug}`
      }))
    : defaultNews;

  const marqueeImages = [
    '/images/carousel/IMG_0002.jpeg',
    '/images/carousel/IMG_0008.jpeg',
    '/images/carousel/IMG_0011.jpeg',
    '/images/carousel/IMG_0013.jpeg',
    '/images/carousel/IMG_0018.jpeg',
    '/images/carousel/IMG_0019.jpeg',
    '/images/carousel/IMG_0020.jpeg',
    '/images/carousel/IMG_0028.jpeg',
    '/images/carousel/IMG_0031.jpeg',
    '/images/carousel/IMG_0034.jpeg',
    '/images/carousel/IMG_0043.jpeg',
    '/images/carousel/IMG_0045.jpeg',
    '/images/carousel/IMG_0057.jpeg',
    '/images/carousel/IMG_0061.jpeg',
    '/images/carousel/IMG_0067.jpeg',
    '/images/carousel/IMG_0075.jpeg',
    '/images/carousel/IMG_0084.jpeg',
    '/images/carousel/IMG_0088.jpeg',
    '/images/carousel/IMG_0091.jpeg',
    '/images/carousel/IMG_0097.jpeg',
  ];

  const navItems = [
    { label: 'Home', sublabel: '', to: '/' },
    { label: 'Shop', sublabel: 'Vendors', to: '/vendors' },
    { label: 'Find', sublabel: 'Us', to: '/find-us' },
    { label: 'Get', sublabel: 'Involved', to: '/get-involved' },
    { label: 'Market', sublabel: 'News', to: '/blog' },
  ];

  const sponsors = [
    { name: 'Float Magic Valley', url: 'https://floatmagicvalley.com/', image: '/images/sponsors/float-magic-valley.webp', dark: true },
    { name: 'Cricket Sterling Insurance', url: 'https://www.csassocinsurance.com/', image: '/images/sponsors/cricket-sterling.webp' },
    { name: 'On The Ball Plumbing', url: 'https://ontheballplumbing.com/', image: '/images/sponsors/on-the-ball-plumbing.png' },
    { name: "O'Dunkens", url: 'https://www.facebook.com/odunkens/', image: '/images/sponsors/odunkens.png' },
    { name: 'Wolfe Lighting', url: 'https://wolfelighting.net/', image: '/images/sponsors/wolfe-lighting.webp', dark: true },
    { name: "Milner's Gate", url: 'https://milnersgate.com/', image: '/images/sponsors/milners-gate.svg' },
    { name: 'IT 83 Fitness', url: 'https://it83fitness.com/', image: '/images/sponsors/it83-fitness.webp' },
    { name: "Tommy's Express Car Wash", url: 'https://tommys-express.com/locations/id53/', image: '/images/sponsors/tommys-express.svg' },
    { name: 'Majestic Aesthetics & Wellness', url: 'https://www.majesticaestheticswellness.com/', image: '/images/sponsors/majestic-aesthetics.png' },
  ];

  return (
    <div>
      {/* Floating Header */}
      <header className="floating-header">
        <div className="floating-header__inner">
          <nav className="pill-nav">
            {navItems.map((item, i) => (
              <Link key={i} to={item.to} className="pill-nav__item">
                <span className="pill-nav__label">{item.label} {item.sublabel}</span>
              </Link>
            ))}
          </nav>

          {/* Hamburger Button - Mobile Only */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
            <span className={`hamburger-btn__line ${mobileMenuOpen ? 'hamburger-btn__line--open' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-overlay__header">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-overlay__logo">
              <span className="floating-header__logo-text">MoM</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="mobile-menu-overlay__close"
            >
              ✕
            </button>
          </div>
          <nav className="mobile-menu-overlay__nav">
            {navItems.map((item, i) => (
              <NavLink
                key={i}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-menu-overlay__link"
              >
                {item.label} {item.sublabel}
              </NavLink>
            ))}
            <NavLink
              to="/become-vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu-overlay__link"
            >
              Become a Vendor
            </NavLink>
            <NavLink
              to="/vendor/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu-overlay__cta"
            >
              Vendor Login
            </NavLink>
          </nav>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="hero" style={{ backgroundImage: "url('/images/hero-mom.jpg')" }}>
          <div className="hero__overlay" />
          <div className="hero__container">
            {/* Left Column - Text */}
            <div className="hero__content">
              <div className="hero__content-inner">
                <div className="hero__tabs">
                  <button
                    className={`hero__tab ${activeTab === 'shop' ? 'hero__tab--active' : ''}`}
                    onClick={() => setActiveTab('shop')}
                  >
                    Shop the Market
                  </button>
                  <button
                    className={`hero__tab ${activeTab === 'involved' ? 'hero__tab--active' : ''}`}
                    onClick={() => setActiveTab('involved')}
                  >
                    Get Involved
                  </button>
                </div>

                <h1 className="hero__title">
                  {activeTab === 'shop'
                    ? 'YOUR SATURDAY MORNING TRADITION!'
                    : <>BE PART OF<br />SOMETHING GOOD.</>}
                </h1>

                <p className="hero__desc">
                  {activeTab === 'shop'
                    ? 'Fresh produce, local makers, live music, and good vibes – every Saturday morning in Downtown Twin Falls.'
                    : 'Become a vendor, volunteer your time, or sponsor the market. This is community, powered by you.'}
                </p>

                <div className="hero__cta">
                  <Link to={activeTab === 'shop' ? '/vendors' : '/get-involved'} className="btn-pill btn-pill-yellow">
                    {activeTab === 'shop' ? 'Meet Our Vendors' : 'Get Involved'}
                  </Link>
                </div>

                <p className="hero__note">
                  *Free admission every Saturday, 9am–2pm. June 6 – August 8.
                </p>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="hero__images">
              <div className="hero__images-inner">
                <div className="hero__image-col hero__image-col--offset-down">
                  <VerticalImageColumn
                    images={marqueeImages.slice(0, 10)}
                    direction="down"
                    borderColors={['yellow', 'purple', 'cyan', 'pink']}
                  />
                </div>
                <div className="hero__image-col hero__image-col--offset-up">
                  <VerticalImageColumn
                    images={marqueeImages.slice(10, 20)}
                    direction="up"
                    borderColors={['cyan', 'yellow', 'pink', 'purple']}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Vendors Section */}
        <section className="vendors-section">
          <div className="vendors-section__card">
            <div className="vendors-section__inner">
              {/* Left Column - Content */}
              <div className="vendors-section__left">
                <div className="vendors-section__header">
                  <h2 className="vendors-section__title">VENDORS</h2>
                </div>
                <div className="vendors-section__filters">
                  <button
                    className={`pill-link ${vendorFilter === 'all' ? 'pill-link--active' : ''}`}
                    onClick={() => setVendorFilter('all')}
                  >All Vendors</button>
                  <button
                    className={`pill-link ${vendorFilter === 'growers' ? 'pill-link--active' : ''}`}
                    onClick={() => setVendorFilter('growers')}
                  >Growers</button>
                  <button
                    className={`pill-link ${vendorFilter === 'makers' ? 'pill-link--active' : ''}`}
                    onClick={() => setVendorFilter('makers')}
                  >Makers</button>
                  <button
                    className={`pill-link ${vendorFilter === 'eats' ? 'pill-link--active' : ''}`}
                    onClick={() => setVendorFilter('eats')}
                  >Eats</button>
                  <button
                    className={`pill-link ${vendorFilter === 'finds' ? 'pill-link--active' : ''}`}
                    onClick={() => setVendorFilter('finds')}
                  >Finds</button>
                </div>
                <div className="vendors-section__scroll" ref={scrollRef}>
                  {vendors.map((vendor, index) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      onPartialClick={() => {
                        const visibleStart = currentIndex * 3;
                        if (index >= visibleStart + 3) {
                          scrollToIndex(Math.floor(index / 3));
                        }
                      }}
                      isPartial={index >= currentIndex * 3 + 3}
                    />
                  ))}
                </div>
                <div className="vendors-section__footer">
                  <div className="vendors-section__dots">
                    {Array.from({ length: totalDots }, (_, i) => (
                      <button
                        key={i}
                        className={`vendors-section__dot ${currentIndex === i ? 'vendors-section__dot--active' : ''}`}
                        onClick={() => scrollToIndex(i)}
                      />
                    ))}
                  </div>
                  <div className="vendors-section__controls">
                    <button
                      className={`vendors-section__scroll-btn ${currentIndex === 0 ? 'vendors-section__scroll-btn--disabled' : ''}`}
                      onClick={goToPrev}
                      disabled={currentIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      className={`vendors-section__scroll-btn ${currentIndex >= totalDots - 1 ? 'vendors-section__scroll-btn--disabled' : ''}`}
                      onClick={goToNext}
                      disabled={currentIndex >= totalDots - 1}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="vendors-section__right">
                <img src="/images/peace.png" className="vendors-section__decor" alt="" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="news-section">
          <div className="container">
            <div className="news-section__grid">
              <div className="news-section__featured">
                <div className="news-section__featured-img">
                  <img src="/images/market/IMG_9954.jpeg" alt="" loading="lazy" />
                </div>
              </div>

              <div>
                <SectionHeader label="What's Happening" heading="Market News & Updates" />
                <div className="news-grid">
                  {news.map((article, i) => (
                    <NewsCard key={i} article={article} />
                  ))}
                </div>
                <div className="news-section__footer">
                  <Link to="/blog" className="news-section__view-all">View All Posts →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Music Section */}
        <section className="music-section">
          <div className="music-section__card">
            <div className="music-section__inner">
              {/* Left Column - Cards */}
              <div className="music-section__left">
                <div className="music-section__header">
                  <h2 className="music-section__title">LIVE MUSIC</h2>
                </div>
                <div className="music-section__scroll" ref={musicScrollRef}>
                  {musicLineup.map((day, index) => (
                      <div key={index} className="music-card">
                        <div className="music-card__header">
                          <span className="music-card__date">{formatMusicDate(day.date)}</span>
                        </div>
                        <div className="music-card__slots">
                          <div className="music-card__slot">
                            <span className="music-card__time">9:00 - 11:30 AM</span>
                            {day.slot1 ? (
                              <button
                                className="music-card__performer music-card__performer--clickable"
                                onClick={() => setSelectedMusician(day.slot1)}
                              >
                                {day.slot1.name}
                              </button>
                            ) : (
                              <span className="music-card__performer music-card__performer--open">OPEN</span>
                            )}
                          </div>
                          <div className="music-card__slot">
                            <span className="music-card__time">11:30 AM - 2:00 PM</span>
                            {day.slot2 ? (
                              <button
                                className="music-card__performer music-card__performer--clickable"
                                onClick={() => setSelectedMusician(day.slot2)}
                              >
                                {day.slot2.name}
                              </button>
                            ) : (
                              <span className="music-card__performer music-card__performer--open">OPEN</span>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
                <div className="music-section__footer">
                  <div className="music-section__dots">
                    {Array.from({ length: totalMusicDots }, (_, i) => (
                      <button
                        key={i}
                        className={`music-section__dot ${musicIndex === i ? 'music-section__dot--active' : ''}`}
                        onClick={() => scrollMusicToIndex(i)}
                      />
                    ))}
                  </div>
                  <div className="music-section__controls">
                    <button
                      className={`music-section__scroll-btn ${musicIndex === 0 ? 'music-section__scroll-btn--disabled' : ''}`}
                      onClick={goToMusicPrev}
                      disabled={musicIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      className={`music-section__scroll-btn ${musicIndex >= totalMusicDots - 1 ? 'music-section__scroll-btn--disabled' : ''}`}
                      onClick={goToMusicNext}
                      disabled={musicIndex >= totalMusicDots - 1}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="music-section__right">
                <img src="/images/live-music.png" className="music-section__decor" alt="" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="sponsors-section">
          <div className="container">
            <div className="sponsors-section__header">
              <h2 className="sponsors-section__title">Thank You to Our Live Music Sponsors</h2>
              <p className="sponsors-section__subtitle">100% of live music is sponsored by local businesses</p>
            </div>
            <div className="sponsors-section__grid">
              {sponsors.map((sponsor, i) => (
                <a
                  key={i}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`sponsors-section__logo ${sponsor.dark ? 'sponsors-section__logo--dark' : ''}`}
                >
                  <img src={sponsor.image} alt={sponsor.name} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-section__grid">
              <CTACard
                title="Become a Vendor"
                tagline="Got something to sell? Join the market family."
                buttonText="Apply Now"
                link="/become-vendor"
                variant="yellow"
              />
              <CTACard
                title="Volunteer"
                tagline="Help us set up, break down, or just spread good vibes."
                buttonText="Sign Up"
                link="/get-involved"
                variant="green"
              />
              <CTACard
                title="Sponsor"
                tagline="Your business + our community = magic. (And live music!)"
                buttonText="Learn More"
                link="/get-involved"
                variant="pink"
              />
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="quote-section">
          <div className="quote-section__inner">
            <p className="quote-section__label">Your Saturday Escape</p>
            <h2 className="quote-section__text">
              "Step away from the screens. Pick up some produce. Lose track of time in your own neighborhood."
            </h2>
            <Link to="/find-us" className="quote-section__link">
              See you Saturday →
            </Link>
          </div>
        </section>

        {/* Location Section */}
        <section className="location-section">
          <div className="container">
            <div className="location-section__grid">
              <div>
                <SectionHeader label="Twin Falls" heading="Find Us Downtown" />
                <p className="location-section__desc">
                  We're on the 100 block of Main Ave N, right in the heart of downtown Twin Falls.
                  Street parking is free on Saturdays!
                </p>
                <div className="location-section__links">
                  <Link to="/find-us" className="pill-link">Get Directions</Link>
                  <Link to="/find-us" className="pill-link">Market Hours</Link>
                </div>
              </div>
              <div className="location-section__images">
                {[
                  '/images/market/IMG_0099.jpeg',
                  '/images/market/IMG_0104.jpeg',
                  '/images/market/IMG_9967.jpeg',
                  '/images/market/IMG_9970.jpeg',
                ].map((src, i) => (
                  <div key={i} className="location-section__img">
                    <img src={src} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Musician Bio Modal */}
      {selectedMusician && (
        <div className="musician-modal-overlay" onClick={() => setSelectedMusician(null)}>
          <div className="musician-modal" onClick={(e) => e.stopPropagation()}>
            <button className="musician-modal__close" onClick={() => setSelectedMusician(null)}>×</button>
            <h2 className="musician-modal__name">{selectedMusician.name}</h2>
            {selectedMusician.bio && (
              <div className="musician-modal__bio" dangerouslySetInnerHTML={{ __html: selectedMusician.bio }} />
            )}
            {selectedMusician.website && (
              <div className="musician-modal__links">
                <a
                  href={selectedMusician.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="musician-modal__link"
                >Website</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div>
              <h3 className="footer__brand-name">Market on Main</h3>
              <p className="footer__brand-info">Every Saturday · June – August · 9am – 2pm</p>
              <p className="footer__brand-info">100 Block Main Ave N, Twin Falls, ID</p>
            </div>
            <div>
              <h4 className="footer__heading">Explore</h4>
              <div className="footer__links">
                <Link to="/vendors" className="footer__link">Vendors</Link>
                <Link to="/find-us" className="footer__link">Find Us</Link>
              </div>
            </div>
            <div>
              <h4 className="footer__heading">Join Us</h4>
              <div className="footer__links">
                <Link to="/become-vendor" className="footer__link">Become a Vendor</Link>
                <Link to="/get-involved" className="footer__link">Volunteer</Link>
                <Link to="/get-involved" className="footer__link">Sponsor</Link>
              </div>
            </div>
            <div>
              <h4 className="footer__heading">Connect</h4>
              <div className="footer__links">
                <Link to="/find-us" className="footer__link">Find Us</Link>
                <Link to="/contact" className="footer__link">Contact</Link>
                <Link to="/vendor/login" className="footer__link">Vendor Login</Link>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            © 2026 Market on Main · Twin Falls, Idaho
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestHome4;
