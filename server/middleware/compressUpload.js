const compressImage = require('../utils/compressImage');
const path = require('path');

/**
 * Express middleware that compresses uploaded images after multer.
 * Non-fatal: if compression fails, original file stays and upload proceeds.
 */
async function compressUpload(req, res, next) {
  try {
    const files = [];

    // Collect files from req.file (single) or req.files (array)
    if (req.file) files.push(req.file);
    if (req.files && Array.isArray(req.files)) files.push(...req.files);

    for (const file of files) {
      try {
        const newPath = await compressImage(file.path);

        // If path changed (HEIC -> JPG), update multer file info
        if (newPath !== file.path) {
          file.path = newPath;
          file.filename = path.basename(newPath);
        }
      } catch (err) {
        console.error(`Image compression failed for ${file.filename}, using original:`, err.message);
      }
    }
  } catch (err) {
    console.error('compressUpload middleware error:', err.message);
  }

  next();
}

module.exports = compressUpload;
