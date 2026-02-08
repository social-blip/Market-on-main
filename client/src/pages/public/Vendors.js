import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/vendors.css';

const CATEGORIES = [
  { key: 'all', label: 'All Vendors' },
  { key: 'growers', label: 'Growers' },
  { key: 'makers', label: 'Makers' },
  { key: 'eats', label: 'Eats' },
  { key: 'finds', label: 'Finds' }
];

const GREETINGS = [
  "Say Howdy",
  "Meet the Maker",
  "Come Say Hi",
  "Stop By",
  "Wave Hello",
  "Pop In & Visit",
  "Swing By",
  "Check Us Out",
  "Say Hey"
];

const VendorCard = ({ vendor }) => {
  const truncateDesc = (text, maxLength = 200) => {
    if (!text) return 'Local vendor at Market on Main.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = dateStr.split('T')[0];
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const greeting = GREETINGS[vendor.id % GREETINGS.length];

  return (
    <Link to={`/vendors/${vendor.id}`} className="homepage-vendor-card">
      <div className="homepage-vendor-card__img">
        {vendor.image_url ? (
          <img src={vendor.image_url} alt={vendor.business_name} />
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
        <span className="homepage-vendor-card__btn">Learn More →</span>
      </div>
    </Link>
  );
};

const Vendors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const dateFilter = searchParams.get('date');

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      const [vendorsRes, datesRes] = await Promise.all([
        dateFilter
          ? api.get(`/vendors/public?date=${dateFilter}`)
          : api.get('/vendors/public'),
        api.get('/dates')
      ]);
      setVendors(vendorsRes.data);
      setDates(datesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ date: value });
    } else {
      setSearchParams({});
    }
  };

  const formatDateDisplay = (dateStr) => {
    const d = dateStr.split('T')[0];
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredVendors = filter === 'all'
    ? vendors
    : vendors.filter(v => v.category === filter);

  return (
    <div className="vendors-page">
      {/* Hero Header */}
      <section className="vendors-page__hero">
        <h1 className="vendors-page__title">Meet Our Vendors</h1>
        <p className="vendors-page__subtitle">
          Local growers, makers, and small businesses<br />all in one place every Saturday.
        </p>
      </section>

      {/* Filter Bar */}
      <section className="vendors-page__filters">
        <div className="vendors-page__filters-inner">
          <div className="vendors-page__category-filters">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`pill-link ${filter === key ? 'pill-link--active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={dateFilter || ''}
            onChange={handleDateChange}
            className="vendors-page__date-select"
          >
            <option value="">All Dates</option>
            {dates.map(date => (
              <option key={date.id} value={date.date}>
                {formatDateDisplay(date.date)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Info Message */}
      <section className="vendors-page__info">
        <p>
          This is a preview of our 2026 lineup — more vendors will be added as we get closer to the season.{' '}
          <Link to="/become-vendor">Apply to become a vendor</Link>.
        </p>
      </section>

      {/* Vendor Grid */}
      <section className="vendors-page__grid-section">
        {loading ? (
          <div className="vendors-page__loading-grid">
            <span className="spinner"></span>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="vendors-page__empty">
            <p>
              {vendors.length === 0
                ? 'Vendor lineup coming soon! Check back in April 2026.'
                : 'No vendors in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="vendors-page__grid">
            {filteredVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="vendors-page__cta">
        <h2>Want to sell at the market?</h2>
        <p>Join our community of local vendors and makers.</p>
        <Link to="/become-vendor" className="btn-pill">Apply Now</Link>
      </section>
    </div>
  );
};

export default Vendors;
