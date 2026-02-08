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

  <p>Hi ${contactName},</p>

  <p>The new Market on Main website is live. Right now. And you're on it.</p>

  <p>You told us you wanted more marketing, more visibility, more customers showing up on Saturday already knowing who you are. We listened, and we built something for you.</p>

  <p><strong>Your vendor page is already up.</strong> We used the description and photos from your vendor application to get you started. It's live, it's public, and customers can find you today.</p>

  <p>When you filled out that application, you may not have been thinking about it as your public-facing profile. Now's the time to take a look and make sure it represents you the way you want.</p>

  <p><strong>How to log in for the first time:</strong></p>

  <ol>
    <li>Go to <a href="https://tfmarketonmain.com/vendor/login">tfmarketonmain.com/vendor/login</a></li>
    <li>Click "Reset Password"</li>
    <li>Enter the email address this message was sent to</li>
    <li>Check your inbox for the reset link and click it (check your spam folder if you don't see it)</li>
    <li>Create your password</li>
    <li>Log in with your new password</li>
  </ol>

  <p>Once you're in, click <strong>Profile</strong> at the top. From there you can edit your contact details, update your description, upload photos, and add your social links.</p>

  <p>This takes about 5 minutes.</p>

  <p><strong>Your portal also lets you:</strong></p>

  <ul>
    <li>See your upcoming market dates at a glance</li>
    <li>Request additional market dates with one click (no more emails)</li>
    <li>View and pay invoices online</li>
  </ul>

  <p><strong>Speaking of invoices:</strong> Some of you have already paid for the season, and your account reflects that. For those who haven't, your invoice is now visible in your portal.</p>

  <p>If you want to pay by credit card, you can do it right from the portal in about 30 seconds. If you prefer to pay by check, no problem. Mail it to:</p>

  <p>
    Market on Main<br>
    588 Addison Avenue W<br>
    Twin Falls, ID 83301
  </p>

  <p>Your account will be updated when we receive it.</p>

  <p><strong>On February 21st at the vendor meeting, we'll do a full walkthrough together.</strong> I'll show you the portal, answer questions, and make sure everyone's comfortable. But don't wait. Log in today and see what customers are already seeing.</p>

  <p><strong>Here's your page:</strong> <a href="${vendorPageUrl}">${vendorPageUrl}</a></p>

  <p>Questions? Reply to this email.</p>

  <p>
    Jared<br>
    Market on Main
  </p>

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
