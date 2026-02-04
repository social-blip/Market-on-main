const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { parse } = require('csv-parse/sync');
const db = require('../models/db');

const CSV_PATH = path.join(__dirname, '../../Signups 0203.csv');
const UPLOADS_DIR = path.join(__dirname, '../uploads/vendors');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function main() {
  try {
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });

    console.log(`Found ${records.length} records in CSV`);

    for (const record of records) {
      const businessName = record['Business Name'];
      const email = record['Email Address'];
      const imageUrls = record['Product / Service Images'];

      if (!imageUrls || !imageUrls.trim()) {
        console.log(`No images for: ${businessName}`);
        continue;
      }

      // Get first image URL (clean up whitespace)
      const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u);
      if (urls.length === 0) {
        console.log(`No valid image URLs for: ${businessName}`);
        continue;
      }

      const firstImageUrl = urls[0];

      // Find vendor in database
      const vendorResult = await db.query(
        'SELECT id, business_name FROM vendors WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (vendorResult.rows.length === 0) {
        console.log(`Vendor not found in DB: ${businessName} (${email})`);
        continue;
      }

      const vendor = vendorResult.rows[0];

      // Generate filename
      const ext = path.extname(firstImageUrl.split('?')[0]) || '.jpg';
      const filename = `vendor-${vendor.id}${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      const dbPath = `/uploads/vendors/${filename}`;

      try {
        console.log(`Downloading image for: ${vendor.business_name}`);
        await downloadImage(firstImageUrl, filepath);

        // Update database
        await db.query(
          'UPDATE vendors SET image_url = $1 WHERE id = $2',
          [dbPath, vendor.id]
        );

        console.log(`  ✓ Saved: ${filename}`);
      } catch (err) {
        console.error(`  ✗ Failed to download for ${vendor.business_name}: ${err.message}`);
      }
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
