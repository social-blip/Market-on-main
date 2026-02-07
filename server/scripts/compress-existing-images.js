#!/usr/bin/env node

/**
 * One-time script to compress all existing uploaded images.
 * - Compresses JPEG/PNG/WebP in-place (resize + quality)
 * - Converts HEIC/HEIF files to JPEG and updates DB paths
 * - Logs before/after sizes
 *
 * Usage: node server/scripts/compress-existing-images.js
 */

const path = require('path');
const fs = require('fs');
const compressImage = require('../utils/compressImage');

// Load env for DB connection
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../models/db');

const UPLOAD_DIRS = [
  path.join(__dirname, '../uploads/vendors'),
  path.join(__dirname, '../uploads/blog'),
  path.join(__dirname, '../uploads/applications'),
  path.join(__dirname, '../uploads/maps')
];

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);

async function getImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  return files
    .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .map(f => path.join(dir, f));
}

async function updateDbPaths(oldPath, newPath) {
  // Convert to relative URL paths (e.g., /uploads/vendors/file.jpg)
  const uploadsIndex = oldPath.indexOf('/uploads/');
  if (uploadsIndex === -1) return;

  const oldUrl = oldPath.slice(uploadsIndex);
  const newUrl = newPath.slice(newPath.indexOf('/uploads/'));

  if (oldUrl === newUrl) return;

  console.log(`  DB update: ${oldUrl} -> ${newUrl}`);

  // Update vendors.image_url
  await db.query(
    'UPDATE vendors SET image_url = $1 WHERE image_url = $2',
    [newUrl, oldUrl]
  );

  // Update vendors.images array (JSONB/text[] - replace within array)
  await db.query(
    `UPDATE vendors SET images = array_replace(images, $1, $2)
     WHERE $1 = ANY(images)`,
    [oldUrl, newUrl]
  );

  // Update blog_posts.image_url
  await db.query(
    'UPDATE blog_posts SET image_url = $1 WHERE image_url = $2',
    [newUrl, oldUrl]
  );

  // Update market_maps.image_url
  await db.query(
    'UPDATE market_maps SET image_url = $1 WHERE image_url = $2',
    [newUrl, oldUrl]
  );

  // Update music_applications.photo_url
  await db.query(
    'UPDATE music_applications SET photo_url = $1 WHERE photo_url = $2',
    [newUrl, oldUrl]
  );
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let fileCount = 0;
  let errorCount = 0;
  let heicCount = 0;

  console.log('Starting image compression...\n');

  for (const dir of UPLOAD_DIRS) {
    const dirName = path.basename(dir);
    const files = await getImageFiles(dir);

    if (files.length === 0) {
      console.log(`[${dirName}] No images found, skipping.`);
      continue;
    }

    console.log(`[${dirName}] Found ${files.length} images`);

    for (const filePath of files) {
      const filename = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const isHeic = ext === '.heic' || ext === '.heif';

      try {
        const beforeSize = fs.statSync(filePath).size;

        const newPath = await compressImage(filePath);
        const afterSize = fs.statSync(newPath).size;

        const saved = beforeSize - afterSize;
        const pct = beforeSize > 0 ? ((saved / beforeSize) * 100).toFixed(1) : 0;

        totalBefore += beforeSize;
        totalAfter += afterSize;
        fileCount++;

        if (isHeic) {
          heicCount++;
          console.log(`  ${filename} -> ${path.basename(newPath)} | ${formatSize(beforeSize)} -> ${formatSize(afterSize)} (${pct}% saved) [HEIC->JPG]`);
          await updateDbPaths(filePath, newPath);
        } else if (saved > 1024) {
          // Only log if meaningful savings (>1KB)
          console.log(`  ${filename} | ${formatSize(beforeSize)} -> ${formatSize(afterSize)} (${pct}% saved)`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  ERROR: ${filename} - ${err.message}`);
      }
    }

    console.log('');
  }

  const totalSaved = totalBefore - totalAfter;
  const totalPct = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : 0;

  console.log('=== Summary ===');
  console.log(`Files processed: ${fileCount}`);
  console.log(`HEIC conversions: ${heicCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total before: ${formatSize(totalBefore)}`);
  console.log(`Total after:  ${formatSize(totalAfter)}`);
  console.log(`Total saved:  ${formatSize(totalSaved)} (${totalPct}%)`);

  await db.pool.end();
  process.exit(0);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
