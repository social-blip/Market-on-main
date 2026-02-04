-- Market on Main Database Schema
-- Run this file to set up the initial database structure

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  social_handles TEXT,
  description TEXT,
  booth_size VARCHAR(50) DEFAULT 'single',
  needs_power BOOLEAN DEFAULT FALSE,
  is_nonprofit BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Dates
CREATE TABLE IF NOT EXISTS market_dates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  start_time TIME DEFAULT '09:00:00',
  end_time TIME DEFAULT '14:00:00',
  is_cancelled BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Bookings (links vendors to market dates)
CREATE TABLE IF NOT EXISTS vendor_bookings (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  market_date_id INTEGER REFERENCES market_dates(id) ON DELETE CASCADE,
  booth_location VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, market_date_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  stripe_payment_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Maps
CREATE TABLE IF NOT EXISTS market_maps (
  id SERIAL PRIMARY KEY,
  market_date_id INTEGER REFERENCES market_dates(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  booth_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs (for tracking sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
  email_type VARCHAR(100),
  subject VARCHAR(255),
  recipient VARCHAR(255),
  status VARCHAR(50),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON vendor_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON vendor_bookings(market_date_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_announcements_public ON announcements(is_public);

-- Insert 2026 Market Dates
INSERT INTO market_dates (date, start_time, end_time) VALUES
  ('2026-06-06', '09:00:00', '14:00:00'),
  ('2026-06-13', '09:00:00', '14:00:00'),
  ('2026-06-20', '09:00:00', '14:00:00'),
  ('2026-06-27', '09:00:00', '14:00:00'),
  ('2026-07-04', '09:00:00', '14:00:00'),
  ('2026-07-11', '09:00:00', '14:00:00'),
  ('2026-07-18', '09:00:00', '14:00:00'),
  ('2026-07-25', '09:00:00', '14:00:00'),
  ('2026-08-01', '09:00:00', '14:00:00'),
  ('2026-08-08', '09:00:00', '14:00:00')
ON CONFLICT (date) DO NOTHING;
