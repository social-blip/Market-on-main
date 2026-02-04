-- Add category field to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'makers';

-- Update any existing vendors to have a default category
UPDATE vendors SET category = 'makers' WHERE category IS NULL;
