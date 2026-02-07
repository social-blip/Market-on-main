const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/blog'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// ===================
// PUBLIC ROUTES
// ===================

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, slug, excerpt, image_url, tag, created_at
       FROM blog_posts
       WHERE is_published = true
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get featured blog posts (limit 4) for homepage
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, slug, excerpt, image_url, tag, created_at
       FROM blog_posts
       WHERE is_published = true AND is_featured = true
       ORDER BY created_at DESC
       LIMIT 4`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured blog posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM blog_posts
       WHERE slug = $1 AND is_published = true`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================
// ADMIN ROUTES
// ===================

// Get all posts (including drafts) - admin only
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM blog_posts
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all blog posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post by ID for editing - admin only
router.get('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new post - admin only
router.post('/admin', verifyToken, isAdmin, async (req, res) => {
  const { title, slug, content, excerpt, image_url, tag, is_featured, is_published } = req.body;

  // Generate slug from title if not provided
  const finalSlug = slug || title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const result = await db.query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, image_url, tag, is_featured, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, finalSlug, content, excerpt, image_url, tag, is_featured || false, is_published || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating blog post:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A post with this slug already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post - admin only
router.put('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, slug, content, excerpt, image_url, tag, is_featured, is_published } = req.body;

  try {
    const result = await db.query(
      `UPDATE blog_posts
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           image_url = COALESCE($5, image_url),
           tag = COALESCE($6, tag),
           is_featured = COALESCE($7, is_featured),
           is_published = COALESCE($8, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, slug, content, excerpt, image_url, tag, is_featured, is_published, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating blog post:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A post with this slug already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post - admin only
router.delete('/admin/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM blog_posts WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload blog image - admin only
router.post('/admin/:id/image', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/blog/${req.file.filename}`;

    // Update the blog post image_url
    const result = await db.query(
      `UPDATE blog_posts SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [imageUrl, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading blog image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete blog image - admin only
router.delete('/admin/:id/image', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get current image_url
    const current = await db.query('SELECT image_url FROM blog_posts WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const imageUrl = current.rows[0].image_url;

    // Delete file from disk if it's an uploaded file
    if (imageUrl && imageUrl.startsWith('/uploads/blog/')) {
      const filePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Clear image_url in database
    const result = await db.query(
      `UPDATE blog_posts SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting blog image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
