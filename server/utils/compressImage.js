const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

/**
 * Compress an image file in-place. HEIC files are converted to JPEG.
 * Returns the (possibly updated) file path.
 */
async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isHeic = ext === '.heic' || ext === '.heif';
  const isPng = ext === '.png';
  const isJpeg = ext === '.jpg' || ext === '.jpeg';
  const isGif = ext === '.gif';
  const isWebp = ext === '.webp';

  // Skip unsupported formats
  if (!isHeic && !isPng && !isJpeg && !isGif && !isWebp) {
    return filePath;
  }

  // Skip GIFs (may be animated)
  if (isGif) {
    return filePath;
  }

  const tempPath = filePath + '.tmp';
  let outputPath = filePath;

  try {
    let pipeline = sharp(filePath)
      .rotate() // auto-rotate from EXIF
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      });

    if (isHeic) {
      // Convert HEIC to JPEG
      outputPath = filePath.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
    } else if (isPng) {
      pipeline = pipeline.png({ quality: PNG_QUALITY });
    } else if (isWebp) {
      pipeline = pipeline.webp({ quality: JPEG_QUALITY });
    } else {
      // JPEG
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
    }

    await pipeline.toFile(tempPath);

    // Replace original with compressed version
    if (outputPath !== filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Remove original .heic
    }
    fs.renameSync(tempPath, outputPath);

    return outputPath;
  } catch (err) {
    // Clean up temp file on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw err;
  }
}

module.exports = compressImage;
