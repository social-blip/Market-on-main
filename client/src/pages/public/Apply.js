import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

// 2026 Market Dates
const MARKET_DATES = [
  'June 6', 'June 13', 'June 20', 'June 27',
  'July 4', 'July 11', 'July 18', 'July 25',
  'August 1', 'August 8'
];

// Pricing
const PRICING = {
  single: { 10: 500, 6: 350, 3: 195 },
  double: { 10: 750, 6: 550, 3: 290 }
};
const POWER_FEE = 15;

const VendorApplication = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

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
    alternate_dates: [],
    needs_power: false,
    is_nonprofit: false,
    images: [],
    agreements: {
      cancellation_policy: false,
      no_show_policy: false
    }
  });

  // Scroll to form when step changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [step]);

  // Calculate pricing
  const calculateTotal = () => {
    if (!formData.booth_size || !formData.markets_requested) return null;

    const baseAmount = PRICING[formData.booth_size]?.[parseInt(formData.markets_requested)] || 0;
    const powerFee = formData.needs_power ? POWER_FEE : 0;
    const subtotal = baseAmount + powerFee;
    const ccFee = Math.round(subtotal * 0.03 * 100) / 100; // 3% CC processing fee
    const totalAmount = subtotal + ccFee;

    return { baseAmount, powerFee, subtotal, ccFee, totalAmount };
  };

  const pricing = calculateTotal();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };

      // Rebalance dates when markets_requested changes
      if (name === 'markets_requested') {
        const N = parseInt(value) || 0;
        const allSelected = [...prev.requested_dates, ...prev.alternate_dates];
        updated.requested_dates = allSelected.slice(0, N);
        updated.alternate_dates = allSelected.slice(N);
      }

      return updated;
    });
  };

  const handleDateToggle = (date) => {
    setFormData(prev => {
      const N = parseInt(prev.markets_requested) || 0;
      const inPrimary = prev.requested_dates.includes(date);
      const inAlternate = prev.alternate_dates.includes(date);

      // Removing a date
      if (inPrimary) {
        const newPrimary = prev.requested_dates.filter(d => d !== date);
        // Promote first alternate to primary
        if (prev.alternate_dates.length > 0) {
          return {
            ...prev,
            requested_dates: [...newPrimary, prev.alternate_dates[0]],
            alternate_dates: prev.alternate_dates.slice(1)
          };
        }
        return { ...prev, requested_dates: newPrimary };
      }
      if (inAlternate) {
        return { ...prev, alternate_dates: prev.alternate_dates.filter(d => d !== date) };
      }

      // Adding a date
      if (prev.requested_dates.length < N) {
        return { ...prev, requested_dates: [...prev.requested_dates, date] };
      }
      return { ...prev, alternate_dates: [...prev.alternate_dates, date] };
    });
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
    const required = ['contact_name', 'business_name', 'email', 'phone', 'description'];
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
        } else if (key === 'agreements' || key === 'requested_dates' || key === 'alternate_dates') {
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

      navigate('/apply/thank-you', { state: {
        business_name: formData.business_name,
        booth_size: formData.booth_size,
        markets_requested: formData.markets_requested,
        requested_dates: formData.requested_dates,
        needs_power: formData.needs_power,
        pricing
      }});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          Vendor Application
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'var(--cream)',
          maxWidth: '600px',
          margin: '0 auto',
          opacity: 0.95
        }}>
          Join Twin Falls' favorite Saturday tradition. Apply now for the 2026 season!
        </p>
      </section>

      {/* Progress Steps */}
      <div
        ref={formRef}
        style={{
          background: 'white',
          padding: '24px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', maxWidth: '400px', margin: '0 auto' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: step >= s ? 'var(--yellow)' : 'var(--gray-light)',
                border: step >= s ? '3px solid var(--maroon)' : '3px solid var(--gray-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: step >= s ? 'var(--dark)' : 'var(--gray-medium)',
                margin: '0 auto 8px'
              }}>
                {s}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: step === s ? 700 : 500,
                color: step === s ? 'var(--maroon)' : 'var(--gray-dark)'
              }}>
                {s === 1 ? 'Info' : s === 2 ? 'Booth' : 'Terms'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <section style={{ padding: '40px 20px 60px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              fontFamily: 'var(--font-body)',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '24px',
                marginBottom: '24px',
                textTransform: 'uppercase',
                color: 'var(--dark)'
              }}>
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
                    placeholder="2088675309"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="E.g. http://www.example.com"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Facebook</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="facebook.com/yourpage"
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
                      placeholder="instagram.com/yourpage"
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
                      placeholder="x.com/yourpage"
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
                  <small style={{
                    color: 'var(--gray-dark)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    marginTop: '6px',
                    display: 'block'
                  }}>
                    Upload up to 5 images (max 10MB each)
                  </small>
                </div>

                <div>
                  <label style={labelStyle}>Business Description *</label>
                  <p style={{ fontSize: '13px', color: 'var(--gray-dark)', margin: '0 0 8px 0' }}>This will appear on your vendor profile page if your application is approved.</p>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business and what you sell. If approved, this will be your public profile description on the Market on Main website."
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                disabled={!validateStep1()}
                style={{
                  ...buttonStyle,
                  width: '100%',
                  marginTop: '24px',
                  opacity: validateStep1() ? 1 : 0.5,
                  cursor: validateStep1() ? 'pointer' : 'not-allowed'
                }}
              >
                Continue to Booth Selection
              </button>
            </div>
          )}

          {/* Step 2: Booth Selection */}
          {step === 2 && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '24px',
                marginBottom: '24px',
                textTransform: 'uppercase',
                color: 'var(--dark)'
              }}>
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
                        <div style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>Best for single tent only setups</div>
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
                        <div style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>Best for trailers and larger setups</div>
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
                  <small style={{
                    display: 'block',
                    color: 'var(--gray-dark)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    marginBottom: '12px',
                    lineHeight: 1.5
                  }}>
                    These dates are not guaranteed. We will email you the final schedule April 2026. If you choose a date that is full, you will be added to the waitlist.
                  </small>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {MARKET_DATES.map(label => {
                      const isPrimary = formData.requested_dates.includes(label);
                      const isAlternate = formData.alternate_dates.includes(label);
                      return (
                        <label key={label} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isPrimary ? '2px solid var(--maroon)' : isAlternate ? '2px dashed var(--gray-dark)' : '2px solid var(--gray-medium)',
                          background: isPrimary ? 'var(--yellow)' : isAlternate ? '#f0f0f0' : 'white',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontWeight: (isPrimary || isAlternate) ? 600 : 400,
                          transition: 'all 0.15s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={isPrimary || isAlternate}
                            onChange={() => handleDateToggle(label)}
                            style={{ marginRight: '10px' }}
                          />
                          {label}
                          {isAlternate && (
                            <span style={{
                              marginLeft: 'auto',
                              fontSize: '11px',
                              background: 'var(--gray-dark)',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>Alternate</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {formData.alternate_dates.length > 0 && (
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--gray-dark)',
                      marginTop: '10px',
                      lineHeight: 1.5,
                      fontStyle: 'italic'
                    }}>
                      You've selected your {formData.markets_requested} dates. Additional selections will be submitted as alternates.
                    </p>
                  )}
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
                  <small style={{
                    display: 'block',
                    color: 'var(--gray-dark)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    marginTop: '8px'
                  }}>
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
                      <div style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
                        I am signing up representing a non-profit organization.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Pricing Summary */}
                {pricing && (
                  <div style={{
                    background: 'var(--cream)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid var(--gray-medium)'
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      marginBottom: '16px',
                      color: 'var(--dark)'
                    }}>
                      Estimated Total
                    </h3>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontStyle: 'italic', color: 'var(--gray-dark)' }}>
                        <span>CC Processing Fee (3%) — waived if paid by cash or check</span>
                        <span>${pricing.ccFee.toFixed(2)}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--gray-medium)',
                        paddingTop: '12px',
                        marginTop: '12px'
                      }}>
                        <strong style={{ fontSize: '18px' }}>Total</strong>
                        <strong style={{ fontSize: '24px', color: 'var(--maroon)' }}>${pricing.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    ...buttonStyle,
                    background: 'white',
                    color: 'var(--dark)',
                    border: '2px solid var(--gray-medium)',
                    flex: 1
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => validateStep2() && setStep(3)}
                  disabled={!validateStep2()}
                  style={{
                    ...buttonStyle,
                    flex: 2,
                    opacity: validateStep2() ? 1 : 0.5,
                    cursor: validateStep2() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue to Terms
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Agreements & Submit */}
          {step === 3 && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '24px',
                marginBottom: '24px',
                textTransform: 'uppercase',
                color: 'var(--dark)'
              }}>
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
                    <div style={{ fontSize: '14px', color: 'var(--gray-dark)', marginTop: '4px', lineHeight: 1.6 }}>
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
                    <div style={{ fontSize: '14px', color: 'var(--gray-dark)', marginTop: '4px', lineHeight: 1.6 }}>
                      I agree if I do not call or show to my agreed market dates there will be an automatic $45 inconvenience fee charged to my card on file.
                    </div>
                  </div>
                </label>
              </div>

              {/* Final Pricing Summary */}
              {pricing && (
                <div style={{
                  background: 'var(--yellow)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginTop: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--dark)' }}>
                        Invoice Amount Upon Approval
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--dark)' }}>
                        {formData.booth_size === 'single' ? 'Single' : 'Double'} Booth • {formData.markets_requested} Markets
                        {formData.needs_power && ' • Power Included'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontStyle: 'italic', marginTop: '4px', color: 'var(--gray-dark)' }}>
                        Includes ${pricing.ccFee.toFixed(2)} CC processing fee (3%)
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--dark)' }}>
                      ${pricing.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    ...buttonStyle,
                    background: 'white',
                    color: 'var(--dark)',
                    border: '2px solid var(--gray-medium)',
                    flex: 1
                  }}
                >
                  Back
                </button>
                <button
                  onClick={submitApplication}
                  disabled={!validateStep3() || loading}
                  style={{
                    ...buttonStyle,
                    flex: 2,
                    opacity: validateStep3() && !loading ? 1 : 0.5,
                    cursor: validateStep3() && !loading ? 'pointer' : 'not-allowed'
                  }}
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
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '14px',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--dark)'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid var(--gray-medium)',
  borderRadius: '8px',
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
};

const buttonStyle = {
  padding: '16px 32px',
  fontSize: '16px',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  background: 'var(--yellow)',
  color: 'var(--dark)',
  border: 'none',
  borderRadius: '50px',
  textTransform: 'uppercase',
  transition: 'all 0.2s ease'
};

const radioCardStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  borderRadius: '12px',
  border: selected ? '2px solid var(--maroon)' : '2px solid var(--gray-medium)',
  background: selected ? 'var(--yellow)' : 'white',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  transition: 'all 0.15s ease'
});

export default VendorApplication;
