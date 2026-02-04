import React, { useState, useEffect } from 'react';
import api from '../../api/client';

// 2026 Market Dates
const MARKET_DATES = [
  { date: '2026-06-06', label: 'June 6' },
  { date: '2026-06-13', label: 'June 13' },
  { date: '2026-06-20', label: 'June 20' },
  { date: '2026-06-27', label: 'June 27' },
  { date: '2026-07-04', label: 'July 4' },
  { date: '2026-07-11', label: 'July 11' },
  { date: '2026-07-18', label: 'July 18' },
  { date: '2026-07-25', label: 'July 25' },
  { date: '2026-08-01', label: 'August 1' },
  { date: '2026-08-08', label: 'August 8' }
];

// Pricing
const PRICING = {
  single: { 10: 500, 6: 350, 3: 195 },
  double: { 10: 750, 6: 550, 3: 290 }
};
const POWER_FEE = 15;

const VendorApplication = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    x_handle: '',
    description: '',
    booth_size: '',
    markets_requested: '',
    requested_dates: [],
    needs_power: false,
    is_nonprofit: false,
    images: [],
    agreements: {
      cancellation_policy: false,
      no_show_policy: false
    }
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  // Calculate pricing
  const calculateTotal = () => {
    if (!formData.booth_size || !formData.markets_requested) return null;

    const baseAmount = PRICING[formData.booth_size]?.[parseInt(formData.markets_requested)] || 0;
    const powerFee = formData.needs_power ? POWER_FEE : 0;
    const totalAmount = baseAmount + powerFee;

    return { baseAmount, powerFee, totalAmount };
  };

  const pricing = calculateTotal();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateToggle = (date) => {
    setFormData(prev => ({
      ...prev,
      requested_dates: prev.requested_dates.includes(date)
        ? prev.requested_dates.filter(d => d !== date)
        : [...prev.requested_dates, date]
    }));
  };

  const handleAgreementChange = (key) => {
    setFormData(prev => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [key]: !prev.agreements[key]
      }
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files.slice(0, 5)
    }));
  };

  const validateStep1 = () => {
    const required = ['contact_name', 'business_name', 'email', 'phone', 'website', 'description'];
    return required.every(field => formData[field]?.trim());
  };

  const validateStep2 = () => {
    return formData.booth_size && formData.markets_requested && formData.requested_dates.length > 0;
  };

  const validateStep3 = () => {
    return Object.values(formData.agreements).every(v => v);
  };

  const submitApplication = async () => {
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();

      // Combine social handles into one field
      const socialHandles = JSON.stringify({
        facebook: formData.facebook,
        instagram: formData.instagram,
        x: formData.x_handle
      });

      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(file => {
            submitData.append('images', file);
          });
        } else if (key === 'agreements' || key === 'requested_dates') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'facebook' || key === 'instagram' || key === 'x_handle') {
          // Skip individual social fields - we'll send combined
        } else {
          submitData.append(key, formData[key]);
        }
      });
      submitData.append('social_handles', socialHandles);

      await api.post('/applications/submit', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="brutal-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
          <h1 className="brutal-section-heading brutal-section-heading-red" style={{ fontSize: '48px', marginBottom: '20px' }}>
            Application Submitted!
          </h1>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', marginBottom: '30px' }}>
            Thank you for applying to Market on Main! Your application is now under review.
          </p>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', color: '#666' }}>
            Once approved, you'll receive an email with your vendor portal login. Your invoice will be available in the portal for payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="brutal-section brutal-section-blue" style={{ paddingBottom: '40px' }}>
        <h1 className="brutal-section-heading brutal-section-heading-white" style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}>
          Become a Vendor
        </h1>
        <p style={{ textAlign: 'center', color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Join Twin Falls' favorite Saturday tradition. Apply now for the 2026 season!
        </p>
      </section>

      <div className="brutal-line"></div>

      {/* Progress Steps */}
      <div style={{ background: '#fff', padding: '20px', borderBottom: '4px solid #000' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', maxWidth: '400px', margin: '0 auto' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= s ? '#FFD700' : '#eee',
                border: '3px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                margin: '0 auto 8px'
              }}>
                {s}
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: step === s ? 700 : 400 }}>
                {s === 1 ? 'Info' : s === 2 ? 'Booth' : 'Terms'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <section className="brutal-section" style={{ background: '#f5f5f5', paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px' }}>

          {error && (
            <div style={{
              background: '#fee',
              border: '4px solid #E30613',
              padding: '16px',
              marginBottom: '24px',
              fontFamily: "'Sora', sans-serif",
              color: '#E30613'
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{ background: '#fff', border: '4px solid #000', padding: '32px' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase' }}>
                Your Information
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="E.g. John Doe"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Business Name *</label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="E.g. Rad's Boutique"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E.g. john@doe.com"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="E.g. +1 300 400 5000"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Website *</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="E.g. http://www.example.com"
                    style={inputStyle}
                    required
                  />
                  <small style={{ color: '#666', fontFamily: "'Sora', sans-serif", fontSize: '12px' }}>
                    If you don't have one, use www.idonthaveone.com
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Facebook</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="@username"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Instagram</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>X (Twitter)</label>
                    <input
                      type="text"
                      name="x_handle"
                      value={formData.x_handle}
                      onChange={handleChange}
                      placeholder="@username"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Product / Service Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ ...inputStyle, padding: '12px' }}
                  />
                  <small style={{ color: '#666', fontFamily: "'Sora', sans-serif", fontSize: '12px' }}>
                    Upload up to 5 images (max 10MB each)
                  </small>
                </div>

                <div>
                  <label style={labelStyle}>Booth Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your booth display, your handmade products, and also tell us what you would add as a vendor to the Market on Main."
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                disabled={!validateStep1()}
                className="brutal-btn brutal-btn-yellow"
                style={{ width: '100%', marginTop: '24px', opacity: validateStep1() ? 1 : 0.5 }}
              >
                Continue to Booth Selection
              </button>
            </div>
          )}

          {/* Step 2: Booth Selection */}
          {step === 2 && (
            <div style={{ background: '#fff', border: '4px solid #000', padding: '32px' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase' }}>
                Booth Selection
              </h2>

              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Booth Size */}
                <div>
                  <label style={labelStyle}>Booth Size Request *</label>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={radioCardStyle(formData.booth_size === 'single')}>
                      <input
                        type="radio"
                        name="booth_size"
                        value="single"
                        checked={formData.booth_size === 'single'}
                        onChange={handleChange}
                        style={{ marginRight: '12px' }}
                      />
                      <div>
                        <strong>Single Booth 10'x10'</strong>
                        <div style={{ fontSize: '14px', color: '#666' }}>Best for single tent only setups</div>
                      </div>
                    </label>
                    <label style={radioCardStyle(formData.booth_size === 'double')}>
                      <input
                        type="radio"
                        name="booth_size"
                        value="double"
                        checked={formData.booth_size === 'double'}
                        onChange={handleChange}
                        style={{ marginRight: '12px' }}
                      />
                      <div>
                        <strong>Double Booth 20'x10'</strong>
                        <div style={{ fontSize: '14px', color: '#666' }}>Best for trailers and larger setups</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Markets Requested */}
                {formData.booth_size && (
                  <div>
                    <label style={labelStyle}>Number of Markets Requested *</label>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {formData.booth_size === 'single' ? (
                        <>
                          <label style={radioCardStyle(formData.markets_requested === '10')}>
                            <input type="radio" name="markets_requested" value="10" checked={formData.markets_requested === '10'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>Entire season / 10 Saturdays - $500</strong></div>
                          </label>
                          <label style={radioCardStyle(formData.markets_requested === '6')}>
                            <input type="radio" name="markets_requested" value="6" checked={formData.markets_requested === '6'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>6 Saturdays of vendor choice - $350</strong></div>
                          </label>
                          <label style={radioCardStyle(formData.markets_requested === '3')}>
                            <input type="radio" name="markets_requested" value="3" checked={formData.markets_requested === '3'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>3 Saturdays of vendor choice - $195</strong></div>
                          </label>
                        </>
                      ) : (
                        <>
                          <label style={radioCardStyle(formData.markets_requested === '10')}>
                            <input type="radio" name="markets_requested" value="10" checked={formData.markets_requested === '10'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>Entire season / 10 Saturdays - $750</strong></div>
                          </label>
                          <label style={radioCardStyle(formData.markets_requested === '6')}>
                            <input type="radio" name="markets_requested" value="6" checked={formData.markets_requested === '6'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>6 Saturdays of vendor choice - $550</strong></div>
                          </label>
                          <label style={radioCardStyle(formData.markets_requested === '3')}>
                            <input type="radio" name="markets_requested" value="3" checked={formData.markets_requested === '3'} onChange={handleChange} style={{ marginRight: '12px' }} />
                            <div><strong>3 Saturdays of vendor choice - $290</strong></div>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label style={labelStyle}>Requested Dates *</label>
                  <small style={{ display: 'block', color: '#666', fontFamily: "'Sora', sans-serif", fontSize: '12px', marginBottom: '12px' }}>
                    These dates are not guaranteed. We will email you the final schedule April 2026. If you choose a date that is full, you will be added to the waitlist.
                  </small>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {MARKET_DATES.map(({ date, label }) => (
                      <label key={date} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: formData.requested_dates.includes(date) ? '3px solid #000' : '2px solid #ddd',
                        background: formData.requested_dates.includes(date) ? '#FFD700' : '#fff',
                        cursor: 'pointer',
                        fontFamily: "'Sora', sans-serif"
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.requested_dates.includes(date)}
                          onChange={() => handleDateToggle(date)}
                          style={{ marginRight: '8px' }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Power */}
                <div>
                  <label style={labelStyle}>Will you Need Power? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={radioCardStyle(formData.needs_power === true)}>
                      <input type="radio" name="needs_power" checked={formData.needs_power === true} onChange={() => setFormData(prev => ({ ...prev, needs_power: true }))} style={{ marginRight: '12px' }} />
                      <div><strong>Yes</strong></div>
                    </label>
                    <label style={radioCardStyle(formData.needs_power === false)}>
                      <input type="radio" name="needs_power" checked={formData.needs_power === false} onChange={() => setFormData(prev => ({ ...prev, needs_power: false }))} style={{ marginRight: '12px' }} />
                      <div><strong>No</strong></div>
                    </label>
                  </div>
                  <small style={{ display: 'block', color: '#666', fontFamily: "'Sora', sans-serif", fontSize: '12px', marginTop: '8px' }}>
                    The city charges for power. To help with this cost, there is a one-time charge of $15 for vendors who need power.
                  </small>
                </div>

                {/* Nonprofit */}
                <div>
                  <label style={{ ...radioCardStyle(formData.is_nonprofit), display: 'flex', alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_nonprofit}
                      onChange={() => setFormData(prev => ({ ...prev, is_nonprofit: !prev.is_nonprofit }))}
                      style={{ marginRight: '12px', marginTop: '4px' }}
                    />
                    <div>
                      <strong>Nonprofit?</strong>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        I am signing up representing a non-profit organization.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Pricing Summary */}
                {pricing && (
                  <div style={{ background: '#f5f5f5', border: '3px solid #000', padding: '20px' }}>
                    <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, marginBottom: '16px' }}>Estimated Total</h3>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Base Amount ({formData.markets_requested} markets)</span>
                        <span>${pricing.baseAmount.toFixed(2)}</span>
                      </div>
                      {pricing.powerFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Power Fee</span>
                          <span>${pricing.powerFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px' }}>
                        <strong style={{ fontSize: '18px' }}>Total</strong>
                        <strong style={{ fontSize: '24px', color: '#E30613' }}>${pricing.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setStep(1)} className="brutal-btn" style={{ background: '#fff', border: '3px solid #000', flex: 1 }}>
                  Back
                </button>
                <button
                  onClick={() => validateStep2() && setStep(3)}
                  disabled={!validateStep2()}
                  className="brutal-btn brutal-btn-yellow"
                  style={{ flex: 2, opacity: validateStep2() ? 1 : 0.5 }}
                >
                  Continue to Terms
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Agreements & Submit */}
          {step === 3 && (
            <div style={{ background: '#fff', border: '4px solid #000', padding: '32px' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase' }}>
                Terms & Agreements
              </h2>

              <div style={{ display: 'grid', gap: '16px' }}>
                <label style={{ ...radioCardStyle(formData.agreements.cancellation_policy), display: 'flex', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreements.cancellation_policy}
                    onChange={() => handleAgreementChange('cancellation_policy')}
                    style={{ marginRight: '12px', marginTop: '4px' }}
                  />
                  <div>
                    <strong>48-Hour Cancellation Notice *</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      I agree to a 48 hour cancellation notice. If I do not give adequate notice, I understand I will lose my vendor space and forfeit full market dues.
                    </div>
                  </div>
                </label>

                <label style={{ ...radioCardStyle(formData.agreements.no_show_policy), display: 'flex', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreements.no_show_policy}
                    onChange={() => handleAgreementChange('no_show_policy')}
                    style={{ marginRight: '12px', marginTop: '4px' }}
                  />
                  <div>
                    <strong>No Show Authorization *</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      I agree if I do not call or show to my agreed market dates there will be an automatic $45 inconvenience fee charged to my card on file.
                    </div>
                  </div>
                </label>
              </div>

              {/* Final Pricing Summary */}
              {pricing && (
                <div style={{ background: '#FFD700', border: '3px solid #000', padding: '20px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '18px' }}>Invoice Amount Upon Approval</div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px' }}>
                        {formData.booth_size === 'single' ? 'Single' : 'Double'} Booth • {formData.markets_requested} Markets
                        {formData.needs_power && ' • Power Included'}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '32px' }}>
                      ${pricing.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setStep(2)} className="brutal-btn" style={{ background: '#fff', border: '3px solid #000', flex: 1 }}>
                  Back
                </button>
                <button
                  onClick={submitApplication}
                  disabled={!validateStep3() || loading}
                  className="brutal-btn brutal-btn-yellow"
                  style={{ flex: 2, opacity: validateStep3() && !loading ? 1 : 0.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Styles
const labelStyle = {
  display: 'block',
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontWeight: 700,
  fontSize: '14px',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  border: '3px solid #000',
  fontFamily: "'Sora', sans-serif",
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box'
};

const radioCardStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  border: selected ? '3px solid #000' : '2px solid #ddd',
  background: selected ? '#FFD700' : '#fff',
  cursor: 'pointer',
  fontFamily: "'Sora', sans-serif"
});

export default VendorApplication;
