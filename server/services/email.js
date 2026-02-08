const { Resend } = require('resend');
const db = require('../models/db');

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey && !apiKey.startsWith('re_placeholder') ? new Resend(apiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Market on Main <info@tfmarketonmain.com>';

// Check if email is configured
const isEmailConfigured = () => {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY not set or is placeholder');
    return false;
  }
  return true;
};

// Log email (for tracking)
const logEmail = async (vendorId, emailType, subject, recipient, status) => {
  try {
    await db.query(
      `INSERT INTO email_logs (vendor_id, email_type, subject, recipient, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [vendorId, emailType, subject, recipient, status]
    );
  } catch (err) {
    console.error('Failed to log email:', err);
  }
};

// Send welcome email to new vendor
const sendWelcomeEmail = async (vendor) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send welcome email to:', vendor.email);
    return true;
  }

  const jwt = require('jsonwebtoken');

  // Generate setup token
  const setupToken = jwt.sign(
    { email: vendor.email, purpose: 'setup' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${setupToken}&email=${encodeURIComponent(vendor.email)}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject: 'Welcome to Market on Main 2026!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Market on Main 2026!</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>Congratulations! Your application for Market on Main 2026 has been approved.
          We're excited to have <strong>${vendor.business_name}</strong> joining us this summer!</p>

          <p>To access your vendor portal, please set up your password by clicking the link below:</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              Set Up Your Account
            </a>
          </p>

          <p>Once logged in, you'll be able to:</p>
          <ul>
            <li>View your confirmed market dates</li>
            <li>Pay your vendor fees online</li>
            <li>See your booth location on the market map</li>
            <li>Stay updated with announcements</li>
          </ul>

          <p><strong>One thing to do right away:</strong> Head to your Profile page and make sure your description and details look the way you want. This is how people will find and learn about you on our website, so take a moment to make sure it represents your business well!</p>

          <p>If you have any questions, email us at info@tfmarketonmain.com.</p>

          <p>See you at the market!</p>
          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This link expires in 7 days. If you didn't apply to Market on Main, please ignore this email.
          </p>
        </div>
      `
    });
    await logEmail(vendor.id, 'welcome', 'Welcome to Market on Main 2026!', vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    await logEmail(vendor.id, 'welcome', 'Welcome to Market on Main 2026!', vendor.email, 'failed');
    return false;
  }
};

// Send application confirmation email
const sendApplicationConfirmation = async (vendor) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send application confirmation to:', vendor.email);
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      bcc: 'info@tfmarketonmain.com',
      subject: 'Application Received - Market on Main 2026',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Application Received!</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>Thank you for applying to be a vendor at Market on Main 2026! We've received your application for <strong>${vendor.business_name}</strong>.</p>

          <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">What's Next?</h3>
            <p style="margin-bottom: 0;">Our team will review your application and get back to you by <strong>April 2026</strong> with your approved schedule and vendor portal access.</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Summary</h3>
            <p><strong>Business:</strong> ${vendor.business_name}</p>
            <p><strong>Booth Size:</strong> ${vendor.booth_size === 'double' ? 'Double (20\'x10\')' : 'Single (10\'x10\')'}</p>
            <p><strong>Markets Requested:</strong> ${vendor.markets_requested}</p>
            <p><strong>Estimated Total:</strong> $${parseFloat(vendor.total_amount).toFixed(2)}</p>
            ${vendor.requested_dates && vendor.requested_dates.length > 0 ? `
            <p><strong>Requested Dates:</strong><br>${vendor.requested_dates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })).join(', ')}</p>
            ` : ''}
            ${vendor.alternate_dates && vendor.alternate_dates.length > 0 ? `
            <p><strong>Alternate Dates:</strong><br>${vendor.alternate_dates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })).join(', ')}</p>
            ` : ''}
          </div>

          <p>Once approved, you'll receive an email with instructions to set up your vendor portal account where you can:</p>
          <ul>
            <li>View your confirmed market dates</li>
            <li>Pay your vendor fees online</li>
            <li>See your booth location on the market map</li>
            <li>Stay updated with announcements</li>
          </ul>

          <p>If you have any questions in the meantime, email us at <a href="mailto:info@tfmarketonmain.com">info@tfmarketonmain.com</a>.</p>

          <p>We're excited to review your application!</p>
          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Market on Main • Downtown Twin Falls • Every Saturday, June - August
          </p>
        </div>
      `
    });
    console.log('Resend API response:', JSON.stringify(result, null, 2));
    await logEmail(vendor.id, 'application_confirmation', 'Application Received - Market on Main 2026', vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send application confirmation:', err);
    console.error('Full error details:', JSON.stringify(err, null, 2));
    await logEmail(vendor.id, 'application_confirmation', 'Application Received - Market on Main 2026', vendor.email, 'failed');
    return false;
  }
};

// Send payment confirmation email
const sendPaymentConfirmation = async (vendor, payment) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send payment confirmation to:', vendor.email);
    return true;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject: 'Payment Received - Market on Main',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Payment Received!</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>We've received your payment for Market on Main 2026. Thank you!</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Business:</strong> ${vendor.business_name}</p>
            <p><strong>Amount:</strong> $${parseFloat(payment.amount).toFixed(2)}</p>
            <p><strong>Description:</strong> ${payment.description || 'Market vendor fees'}</p>
            <p><strong>Date:</strong> ${new Date(payment.paid_date).toLocaleDateString()}</p>
          </div>

          <p>Log in to your vendor portal to view your confirmed dates and booth location.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vendor/login"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              View My Dashboard
            </a>
          </p>

          <p>See you at the market!</p>
          <p><strong>MoM Crew</strong></p>
        </div>
      `
    });
    await logEmail(vendor.id, 'payment_confirmation', 'Payment Received - Market on Main', vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send payment confirmation:', err);
    await logEmail(vendor.id, 'payment_confirmation', 'Payment Received - Market on Main', vendor.email, 'failed');
    return false;
  }
};

// Send announcement email
const sendAnnouncementEmail = async (vendor, announcement) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send announcement to:', vendor.email);
    return true;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject: `Market on Main: ${announcement.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${announcement.title}</h1>

          <p>Hi ${vendor.contact_name},</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${announcement.content.replace(/\n/g, '<br>')}
          </div>

          <p>Log in to your vendor portal for more details.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vendor/login"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              View Dashboard
            </a>
          </p>

          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            You're receiving this because you're a registered vendor for Market on Main 2026.
          </p>
        </div>
      `
    });
    await logEmail(vendor.id || null, 'announcement', `Market on Main: ${announcement.title}`, vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send announcement email:', err);
    await logEmail(vendor.id || null, 'announcement', `Market on Main: ${announcement.title}`, vendor.email, 'failed');
    return false;
  }
};

// Send market reminder (day before)
const sendMarketReminder = async (vendor, marketDate) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send market reminder to:', vendor.email);
    return true;
  }

  const dateFormatted = new Date(marketDate.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject: `Reminder: Market on Main Tomorrow - ${dateFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">See You Tomorrow!</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>This is a friendly reminder that <strong>${vendor.business_name}</strong> is scheduled
          to be at Market on Main tomorrow!</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Market Details</h3>
            <p><strong>Date:</strong> ${dateFormatted}</p>
            <p><strong>Time:</strong> ${marketDate.start_time} - ${marketDate.end_time}</p>
            <p><strong>Location:</strong> 100 Block of Main Ave N, Twin Falls, ID</p>
          </div>

          <p><strong>Reminders:</strong></p>
          <ul>
            <li>Arrive by 8:00 AM for setup</li>
            <li>Bring your tent, tables, and displays</li>
            <li>Check the market map for your booth location</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              View Market Map
            </a>
          </p>

          <p>See you there!</p>
          <p><strong>MoM Crew</strong></p>
        </div>
      `
    });
    await logEmail(vendor.id, 'reminder', `Reminder: Market on Main Tomorrow - ${dateFormatted}`, vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send reminder email:', err);
    await logEmail(vendor.id, 'reminder', `Reminder: Market on Main Tomorrow - ${dateFormatted}`, vendor.email, 'failed');
    return false;
  }
};

// Send music application confirmation email (CC to admin)
const sendMusicApplicationConfirmation = async (application) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send music application confirmation to:', application.email);
    return true;
  }

  // Build social links section
  const socialLinks = [];
  if (application.facebook) socialLinks.push(`Facebook: ${application.facebook}`);
  if (application.instagram) socialLinks.push(`Instagram: ${application.instagram}`);
  if (application.x_handle) socialLinks.push(`X/Twitter: ${application.x_handle}`);
  if (application.youtube) socialLinks.push(`YouTube: ${application.youtube}`);
  const socialSection = socialLinks.length > 0
    ? `<p><strong>Social Links:</strong><br>${socialLinks.join('<br>')}</p>`
    : '';

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: application.email,
      bcc: 'info@tfmarketonmain.com',
      subject: 'Music Application Received - Market on Main 2026',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Music Application Received!</h1>

          <p>Hi ${application.name},</p>

          <p>Thank you for your interest in performing at Market on Main 2026! We've received your application and are excited to review it.</p>

          <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">What's Next?</h3>
            <p style="margin-bottom: 0;">Our team will review your application and reach out if we'd like to book you for one of our market dates. We typically finalize our music lineup by <strong>May 2026</strong>.</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Summary</h3>
            <p><strong>Name:</strong> ${application.name}</p>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            ${socialSection}
            ${application.message ? `<p><strong>Message:</strong> ${application.message}</p>` : ''}
          </div>

          <p>If you have any questions in the meantime, email us at <a href="mailto:info@tfmarketonmain.com">info@tfmarketonmain.com</a>.</p>

          <p>Rock on!</p>
          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Market on Main • Downtown Twin Falls • Every Saturday, June - August
          </p>
        </div>
      `
    });
    await logEmail(null, 'music_application', 'Music Application Received - Market on Main 2026', application.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send music application confirmation:', err);
    await logEmail(null, 'music_application', 'Music Application Received - Market on Main 2026', application.email, 'failed');
    return false;
  }
};

// Send contact form acknowledgment to user with CC to admin
const sendContactFormNotification = async (data) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send contact form notification for:', data.email);
    return true;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      bcc: 'info@tfmarketonmain.com',
      subject: `We Got Your Message - Market on Main`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thanks for Reaching Out!</h1>

          <p>Hi ${data.name},</p>

          <p>We've received your message and will get back to you as soon as possible.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Message</h3>
            <p><strong>Topic:</strong> ${data.reason}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p style="white-space: pre-wrap;"><strong>Question:</strong><br>${data.question}</p>
          </div>

          <p>In the meantime, feel free to explore <a href="https://tfmarketonmain.com">our website</a> or stop by the market any Saturday!</p>

          <p>See you soon,</p>
          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Market on Main • Downtown Twin Falls • Every Saturday, June - August
          </p>
        </div>
      `
    });
    console.log('Contact form acknowledgment sent to:', data.email);
    return true;
  } catch (err) {
    console.error('Failed to send contact form notification:', err);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (vendor) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send password reset email to:', vendor.email);
    return true;
  }

  const jwt = require('jsonwebtoken');

  const resetToken = jwt.sign(
    { email: vendor.email, purpose: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resetUrl = `${process.env.FRONTEND_URL}/setup-password?token=${resetToken}&email=${encodeURIComponent(vendor.email)}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject: 'Reset your password — Market on Main',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>We received a request to reset the password for your Market on Main vendor account. Click the button below to set a new password:</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              Reset Password
            </a>
          </p>

          <p>This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>

          <p><strong>MoM Crew</strong></p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #999;">${resetUrl}</a>
          </p>
        </div>
      `
    });
    await logEmail(vendor.id, 'password_reset', 'Reset your password — Market on Main', vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    await logEmail(vendor.id, 'password_reset', 'Reset your password — Market on Main', vendor.email, 'failed');
    return false;
  }
};

// Send date request notification to admin
const sendDateRequestNotification = async (vendor, dates) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send date request notification for:', vendor.business_name);
    return true;
  }

  const dateList = dates.map(d => {
    return new Date(d.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }).join('<br>');

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: 'info@tfmarketonmain.com',
      subject: `Date Request from ${vendor.business_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Date Request</h1>

          <p><strong>${vendor.business_name}</strong> (${vendor.contact_name}) has requested additional market dates.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Requested Dates</h3>
            <p>${dateList}</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/vendors/${vendor.id}"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              View Vendor
            </a>
          </p>

          <p><strong>MoM Crew</strong></p>
        </div>
      `
    });
    await logEmail(vendor.id, 'date_request', `Date Request from ${vendor.business_name}`, 'info@tfmarketonmain.com', 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send date request notification:', err);
    await logEmail(vendor.id, 'date_request', `Date Request from ${vendor.business_name}`, 'info@tfmarketonmain.com', 'failed');
    return false;
  }
};

// Send date request review email to vendor (approved and/or denied dates)
const sendDateRequestApproval = async (vendor, approvedDates = [], deniedDates = []) => {
  if (!isEmailConfigured()) {
    console.log('[DEV] Would send date request review to:', vendor.email);
    return true;
  }

  const formatDates = (dates) => dates.map(d => {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }).join('<br>');

  const hasApproved = approvedDates.length > 0;
  const hasDenied = deniedDates.length > 0;

  const subject = hasApproved && !hasDenied
    ? 'Dates Approved - Market on Main'
    : !hasApproved && hasDenied
    ? 'Date Request Update - Market on Main'
    : 'Date Request Update - Market on Main';

  const heading = hasApproved && !hasDenied
    ? 'Your Dates Are Confirmed!'
    : 'Date Request Update';

  let intro = '';
  if (hasApproved && !hasDenied) {
    intro = `Great news! Your requested market date${approvedDates.length !== 1 ? 's have' : ' has'} been approved.`;
  } else if (!hasApproved && hasDenied) {
    intro = `We've reviewed your date request${deniedDates.length !== 1 ? 's' : ''} and unfortunately ${deniedDates.length !== 1 ? 'those dates are' : 'that date is'} not available.`;
  } else {
    intro = `We've reviewed your date requests. Here's the update:`;
  }

  let sections = '';
  if (hasApproved) {
    sections += `
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #16a34a;">Approved</h3>
        <p style="margin-bottom: 0;">${formatDates(approvedDates)}</p>
      </div>`;
  }
  if (hasDenied) {
    sections += `
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">Not Available</h3>
        <p style="margin-bottom: 0;">${formatDates(deniedDates)}</p>
      </div>`;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: vendor.email,
      bcc: 'info@tfmarketonmain.com',
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">${heading}</h1>

          <p>Hi ${vendor.contact_name},</p>

          <p>${intro}</p>

          ${sections}

          <p>Log in to your vendor portal to view your full schedule.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vendor/login"
               style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
              View My Schedule
            </a>
          </p>

          <p>See you at the market!</p>
          <p><strong>MoM Crew</strong></p>
        </div>
      `
    });
    await logEmail(vendor.id, 'date_request_review', subject, vendor.email, 'sent');
    return true;
  } catch (err) {
    console.error('Failed to send date request review:', err);
    await logEmail(vendor.id, 'date_request_review', subject, vendor.email, 'failed');
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmation,
  sendAnnouncementEmail,
  sendMarketReminder,
  sendApplicationConfirmation,
  sendMusicApplicationConfirmation,
  sendContactFormNotification,
  sendDateRequestNotification,
  sendDateRequestApproval
};
