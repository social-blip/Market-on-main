const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Configure multer for map uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/maps'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'map-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// GET /maps/builder/dates/list - Get all market dates for the date selector
// NOTE: This route must be defined before /:date_id to avoid matching "builder" as a date_id
router.get('/builder/dates/list', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, date, is_cancelled
       FROM market_dates
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /maps/builder/:date_id - Get all data for the map builder
// NOTE: This route must be defined before /:date_id to avoid matching "builder" as a date_id
router.get('/builder/:date_id', verifyToken, isAdmin, async (req, res) => {
  try {
    const dateId = req.params.date_id;

    // Get market date info
    const dateResult = await db.query(
      'SELECT * FROM market_dates WHERE id = $1',
      [dateId]
    );

    if (dateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Market date not found' });
    }

    // Get assigned vendors (have booth_location)
    const assignedResult = await db.query(
      `SELECT vb.id as booking_id, vb.booth_location, vb.status,
              v.id as vendor_id, v.business_name, v.booth_size
       FROM vendor_bookings vb
       JOIN vendors v ON vb.vendor_id = v.id
       WHERE vb.market_date_id = $1
         AND vb.booth_location IS NOT NULL
         AND vb.booth_location != ''
         AND v.is_active = true
       ORDER BY vb.booth_location`,
      [dateId]
    );

    // Get unassigned vendors (confirmed booking, no booth_location)
    const unassignedResult = await db.query(
      `SELECT vb.id as booking_id, vb.status,
              v.id as vendor_id, v.business_name, v.booth_size
       FROM vendor_bookings vb
       JOIN vendors v ON vb.vendor_id = v.id
       WHERE vb.market_date_id = $1
         AND vb.status = 'confirmed'
         AND (vb.booth_location IS NULL OR vb.booth_location = '')
         AND v.is_active = true
       ORDER BY v.business_name`,
      [dateId]
    );

    res.json({
      marketDate: dateResult.rows[0],
      assignedVendors: assignedResult.rows,
      unassignedVendors: unassignedResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /maps/assign - Assign/unassign a vendor to a spot
router.put('/assign', verifyToken, isAdmin, async (req, res) => {
  try {
    const { booking_id, booth_location } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    // Get the booking info
    const bookingResult = await db.query(
      'SELECT * FROM vendor_bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // If assigning (booth_location provided), validate the spot is available
    if (booth_location) {
      // Parse the booth_location to get all spots (e.g., "5,6" -> ["5", "6"])
      const spots = booth_location.split(',').map(s => s.trim());

      // Check if any of these spots are already taken
      for (const spot of spots) {
        const conflictResult = await db.query(
          `SELECT vb.id, v.business_name
           FROM vendor_bookings vb
           JOIN vendors v ON vb.vendor_id = v.id
           WHERE vb.market_date_id = $1
             AND vb.id != $2
             AND vb.booth_location IS NOT NULL
             AND (vb.booth_location = $3
                  OR vb.booth_location LIKE $4
                  OR vb.booth_location LIKE $5)`,
          [booking.market_date_id, booking_id, spot, `${spot},%`, `%,${spot}`]
        );

        if (conflictResult.rows.length > 0) {
          return res.status(409).json({
            error: `Spot ${spot} is already assigned to ${conflictResult.rows[0].business_name}`
          });
        }
      }

      // For double booths, validate spots are adjacent and in same column
      if (spots.length === 2) {
        const spot1 = parseInt(spots[0]);
        const spot2 = parseInt(spots[1]);

        // Check adjacency (spots should be consecutive)
        if (Math.abs(spot1 - spot2) !== 1) {
          return res.status(400).json({ error: 'Double booth spots must be adjacent' });
        }

        // Check same column (both <=30 for left, both >30 for right)
        const inLeftColumn = (s) => s >= 1 && s <= 30;
        const inRightColumn = (s) => s >= 31 && s <= 55;

        if (!(inLeftColumn(spot1) && inLeftColumn(spot2)) &&
            !(inRightColumn(spot1) && inRightColumn(spot2))) {
          return res.status(400).json({ error: 'Double booth spots must be in the same column' });
        }
      }
    }

    // Update the booking
    const updateResult = await db.query(
      `UPDATE vendor_bookings
       SET booth_location = $1
       WHERE id = $2
       RETURNING *`,
      [booth_location || null, booking_id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get map for a specific market date
router.get('/:date_id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM market_maps
       WHERE market_date_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.params.date_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current/default map
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM market_maps
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No map available' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload new map (admin)
router.post('/', verifyToken, isAdmin, upload.single('map'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { market_date_id, booth_data } = req.body;
  const imageUrl = `/uploads/maps/${req.file.filename}`;

  try {
    // Deactivate previous maps for this date
    if (market_date_id) {
      await db.query(
        'UPDATE market_maps SET is_active = false WHERE market_date_id = $1',
        [market_date_id]
      );
    }

    const result = await db.query(
      `INSERT INTO market_maps (market_date_id, image_url, booth_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [market_date_id || null, imageUrl, booth_data ? JSON.parse(booth_data) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update map booth data (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { booth_data, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE market_maps
       SET booth_data = COALESCE($1, booth_data),
           is_active = COALESCE($2, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [booth_data ? JSON.stringify(booth_data) : null, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete map (admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM market_maps WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    res.json({ message: 'Map deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
