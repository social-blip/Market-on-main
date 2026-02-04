-- Music Applications table for live music performer applications
CREATE TABLE IF NOT EXISTS music_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  social_handles JSONB,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_music_applications_status ON music_applications(status);
CREATE INDEX IF NOT EXISTS idx_music_applications_email ON music_applications(email);
