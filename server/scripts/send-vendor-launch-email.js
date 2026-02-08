// One-time script to send vendor launch email
// Usage: node scripts/send-vendor-launch-email.js [test|send]
// test = send one test email to info@tfmarketonmain.com as Stevie Ray's
// send = send to ALL active vendors

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const db = require('../models/db');

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'Market on Main <info@tfmarketonmain.com>';

const buildEmail = (contactName, vendorId) => {
  const vendorPageUrl = `https://tfmarketonmain.com/vendors/${vendorId}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your vendor page is live</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

    <p>Hi ${contactName},</p>

    <p>The new Market on Main website is live. Right now. And you're on it.</p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="https://tfmarketonmain.com"
         style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
        Visit tfmarketonmain.com
      </a>
    </p>

    <p>You told us you wanted more marketing, more visibility, more customers showing up on Saturday already knowing who you are. We listened.</p>

    <p>We built a full market management platform from scratch specifically for Market on Main. This isn't just a website update. It's a complete system designed to make the market better for everyone.</p>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #5c1e3d;">For you, the vendors</h3>
      <p style="margin-bottom: 0;">You now have your own vendor portal where you can manage your account, update your profile, request market dates, and pay invoices. No more back-and-forth emails. No more checks in the mail (unless you want to). Everything in one place, on your schedule.</p>
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #5c1e3d;">For our customers</h3>
      <p style="margin-bottom: 0;">They now have a real destination to explore the market before they show up on Saturday. They can see who's going to be there, when they're going to be there, browse vendor profiles and photos, check out the live music schedule, and stay up to date on news and happenings. The better your profile looks, the more likely they are to seek you out.</p>
    </div>

    <p><strong>Your vendor page is already up.</strong> We used the description and photos from your vendor application to get you started. It's live, it's public, and customers can find you today.</p>

    <p>When you filled out that application, you may not have been thinking about it as your public-facing profile. Now's the time to take a look and make sure it represents you the way you want.</p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${vendorPageUrl}"
         style="background-color: #5c1e3d; color: #ffffff; padding: 14px 32px; text-decoration: none; border: none; display: inline-block; font-weight: 600; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px;">
        See Your Profile
      </a>
    </p>

    <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #856404;">How to log in for the first time</h3>
      <ol style="margin-bottom: 0; padding-left: 20px;">
        <li>Go to <a href="https://tfmarketonmain.com/vendor/login" style="color: #5c1e3d; font-weight: 600;">tfmarketonmain.com/vendor/login</a></li>
        <li>Click "Reset Password"</li>
        <li>Enter the email address this message was sent to</li>
        <li>Check your inbox for the reset link and click it (check your spam folder if you don't see it)</li>
        <li>Create your password</li>
        <li>Log in with your new password</li>
      </ol>
    </div>

    <p>Once you're in, click <strong>Profile</strong> at the top. From there you can edit your contact details, update your description, upload photos, and add your social links.</p>

    <p>This takes about 5 minutes.</p>

    <p><strong>Your portal also lets you:</strong></p>

    <ul>
      <li>See your upcoming market dates at a glance</li>
      <li>Request additional market dates with one click (no more emails)</li>
      <li>View and pay invoices online</li>
    </ul>

    <p><strong>Speaking of invoices:</strong> If you've paid already, great! Thank you so much. If you haven't, your invoice is waiting for you in your vendor portal. Please pay as soon as you can so we can lock you in for the season. If you don't pay, unfortunately we will have to give up your spot.</p>

    <p>If you want to pay by credit card, you can do it right from the portal in about 30 seconds. If you prefer to pay by check, no problem. Mail it to:</p>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;">
        <strong>Market on Main</strong><br>
        588 Addison Avenue W<br>
        Twin Falls, ID 83301
      </p>
    </div>

    <p>Your account will be updated when we receive it.</p>

    <p><strong>On February 21st at the vendor meeting, we'll do a full walkthrough together.</strong> I'll show you the portal, answer questions, and make sure everyone's comfortable. But don't wait. Log in today and see what customers are already seeing.</p>

    <p>Questions? Reply to this email.</p>

    <p>
      Jared<br>
      <strong>Market on Main</strong>
    </p>

    <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px;">
      Market on Main &bull; Downtown Twin Falls &bull; Every Saturday, June &ndash; August
    </p>
  </div>

</body>
</html>`;
};

const SUBJECT = "Your vendor page is live. Here's how to make it yours.";

async function main() {
  const mode = process.argv[2] || 'test';

  if (mode === 'test') {
    // Send test email to info@ as if it were Stevie Ray's (vendor 10)
    const contactName = 'Stefani Fries';
    const vendorId = 10;
    const toEmail = 'info@tfmarketonmain.com';

    console.log(`Sending TEST email to ${toEmail} as "${contactName}" (vendor ${vendorId})...`);

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: SUBJECT,
      html: buildEmail(contactName, vendorId),
    });

    console.log('Sent! Result:', JSON.stringify(result, null, 2));

  } else if (mode === 'send') {
    // Send to all active vendors
    const vendors = await db.query(
      `SELECT id, contact_name, email FROM vendors WHERE is_active = true ORDER BY business_name`
    );

    console.log(`Sending to ${vendors.rows.length} vendors...`);

    for (const vendor of vendors.rows) {
      try {
        const result = await resend.emails.send({
          from: EMAIL_FROM,
          to: vendor.email,
          subject: SUBJECT,
          html: buildEmail(vendor.contact_name, vendor.id),
        });
        console.log(`  ✓ ${vendor.contact_name} (${vendor.email}) - ${result.data?.id || 'sent'}`);

        // Log it
        await db.query(
          `INSERT INTO email_logs (vendor_id, email_type, subject, recipient, status) VALUES ($1, $2, $3, $4, $5)`,
          [vendor.id, 'vendor_launch', SUBJECT, vendor.email, 'sent']
        );
      } catch (err) {
        console.error(`  ✗ ${vendor.contact_name} (${vendor.email}) - FAILED:`, err.message);
        await db.query(
          `INSERT INTO email_logs (vendor_id, email_type, subject, recipient, status) VALUES ($1, $2, $3, $4, $5)`,
          [vendor.id, 'vendor_launch', SUBJECT, vendor.email, 'failed']
        );
      }

      // Small delay between sends
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('Done!');
  } else {
    console.log('Usage: node scripts/send-vendor-launch-email.js [test|send]');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
