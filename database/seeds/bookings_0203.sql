-- Vendor bookings from February 2026 signups
-- Links vendors to their requested market dates

-- Jennifer Edgerly (SNAKE RIVER EDGE) - June 27, July 18, August 1
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'edgerly.jenn@yahoo.com'
AND md.id IN (4, 7, 9)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Tamara Harmon (Wellness Tree) - June 13, June 20, July 11, July 18, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'info@wellnesstreeclinic.org'
AND md.id IN (2, 3, 6, 7, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Elicia Garza (Smooth Move) - June 6, July 11, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'support@smoothmovesolution.com'
AND md.id IN (1, 6, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Erin Godfrey (Erin's Sweet Creations) - Full season minus Aug 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'wildthing08@gmail.com'
AND md.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Valerie Steinmetz (Pet Wants) - Full season
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'vsteinmetz@petwants.com'
AND md.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Juana Benavides (Idaho Vaqueras) - June 6, June 13, June 20
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'jam25@idahovaqueras.com'
AND md.id IN (1, 2, 3)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Katie Flavel (I bagel your pardon) - June 6, July 25, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'ibagelyourpardonyf@gmail.com'
AND md.id IN (1, 8, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Marsha Hartman (Marsha Marsha Marsha) - June 6, June 13, June 20, July 11, July 25, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'marsha@unforeclosure.com'
AND md.id IN (1, 2, 3, 6, 8, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Stefani Fries (STEVIE RAY'S) - June 6, July 4, August 1
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'STEVIERAYS24@GMAIL.COM'
AND md.id IN (1, 5, 9)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Rudy Sena (A&M Prints) - Full season
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'rudysnow88@gmail.com'
AND md.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Megan Garrison (Home Place Sweets) - June 6, June 13, June 27, July 25, August 1, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'homeplacesweets@gmail.com'
AND md.id IN (1, 2, 4, 8, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Christine Kennedy (Thea) - Full season
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'linkedxthea@gmail.com'
AND md.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Michelle Lester (Cookie Rush) - June 6, June 20, July 4, July 18, August 1, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'michella72@me.com'
AND md.id IN (1, 3, 5, 7, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Shelli Stokesberry (BS208Creations) - Full season
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'bs208creations@gmail.com'
AND md.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Robb Greiner (The Rusty Dog) - June 6, June 20, July 11
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'rgreiner@therustydog.biz'
AND md.id IN (1, 3, 6)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';

-- Waynett L Page (Wild Way Designs) - June 27, August 1, August 8
INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
SELECT v.id, md.id, 'confirmed'
FROM vendors v, market_dates md
WHERE v.email = 'waynettterry@yahoo.com'
AND md.id IN (4, 9, 10)
ON CONFLICT (vendor_id, market_date_id) DO UPDATE SET status = 'confirmed';
