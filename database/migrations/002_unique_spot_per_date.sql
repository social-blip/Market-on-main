-- Migration: Add unique constraint to prevent same spot being assigned twice for a market date
-- Note: booth_location can be "5" or "5,6" for doubles

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_spot_per_date
ON vendor_bookings (market_date_id, booth_location)
WHERE booth_location IS NOT NULL AND booth_location != '';
