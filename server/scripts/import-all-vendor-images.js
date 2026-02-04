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
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
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

      const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u);
      if (urls.length === 0) {
        console.log(`No valid image URLs for: ${businessName}`);
        continue;
      }

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
      const downloadedImages = [];

      console.log(`Processing ${urls.length} images for: ${vendor.business_name}`);

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const ext = path.extname(url.split('?')[0]) || '.jpg';
        const filename = `vendor-${vendor.id}-${i + 1}${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        const dbPath = `/uploads/vendors/${filename}`;

        try {
          // Check if file already exists
          if (fs.existsSync(filepath)) {
            console.log(`  Skipping (exists): ${filename}`);
            downloadedImages.push(dbPath);
            continue;
          }

          await downloadImage(url, filepath);
          downloadedImages.push(dbPath);
          console.log(`  ✓ Downloaded: ${filename}`);
        } catch (err) {
          console.error(`  ✗ Failed: ${filename} - ${err.message}`);
        }
      }

      if (downloadedImages.length > 0) {
        // Set first image as main image_url, rest in images array
        const mainImage = downloadedImages[0];
        const additionalImages = downloadedImages.slice(1);

        await db.query(
          'UPDATE vendors SET image_url = $1, images = $2 WHERE id = $3',
          [mainImage, additionalImages.length > 0 ? additionalImages : null, vendor.id]
        );

        console.log(`  Updated DB: ${downloadedImages.length} images`);
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
