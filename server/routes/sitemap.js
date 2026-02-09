const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
  const baseUrl = 'https://tfmarketonmain.com';

  // Static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/vendors', priority: '0.9', changefreq: 'weekly' },
    { path: '/get-involved', priority: '0.7', changefreq: 'monthly' },
    { path: '/become-vendor', priority: '0.7', changefreq: 'monthly' },
    { path: '/apply', priority: '0.7', changefreq: 'monthly' },
    { path: '/find-us', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/map', priority: '0.5', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  ];

  try {
    // Dynamic vendor pages
    const vendors = await db.query(
      'SELECT id, updated_at FROM vendors WHERE is_active = true AND is_approved = true'
    );

    // Dynamic blog pages
    const posts = await db.query(
      'SELECT slug, updated_at FROM blog_posts WHERE is_published = true'
    );

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const vendor of vendors.rows) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/vendors/${vendor.id}</loc>\n`;
      xml += `    <lastmod>${new Date(vendor.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    for (const post of posts.rows) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
