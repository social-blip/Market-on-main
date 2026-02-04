-- Add image fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS images TEXT[];

-- For vendors that already have images from applications, set the first image as hero
UPDATE vendors
SET image_url = images[1]
WHERE image_url IS NULL AND images IS NOT NULL AND array_length(images, 1) > 0;
