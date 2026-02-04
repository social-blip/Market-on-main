-- Vendor signups from February 2026
-- Run this to populate the vendors table

INSERT INTO vendors (email, business_name, contact_name, phone, website, social_handles, description, booth_size, needs_power, is_nonprofit, is_active, is_approved)
VALUES
  ('edgerly.jenn@yahoo.com', 'SNAKE RIVER EDGE', 'Jennifer Edgerly', '15592407242', 'https://snakeriveredge.etsy.com', 'Snake_River_Edge', 'Unique Handmade sterling silver jewelry made by me. Booth is clean and boutique like looking. I would bring fun and unique jewelry.', 'single', false, false, true, false),

  ('info@wellnesstreeclinic.org', 'Wellness Tree Community Clinic', 'Tamara Harmon', '208-734-2610', 'https://wellnesstreeclinic.org', NULL, 'We are a local nonprofit providing free healthcare for adults who do not have insurance. We are looking to have an informational booth about our services to ensure community members know about us.', 'single', false, true, true, false),

  ('support@smoothmovesolution.com', 'Smooth Move Solution', 'Elicia Garza', '12084047367', 'http://www.smoothmovesolution.com', 'https://www.facebook.com/smoothmovesolution', 'Our booth will include a tent with a hands-on display of our reusable moving totes and moving dollies, allowing visitors to see how much can be packed into each tote and how easily the system transports stacked items. We are a locally owned, family-run business offering this service exclusively to the local community and surrounding areas.', 'single', false, false, true, false),

  ('wildthing08@gmail.com', 'Erin''s Sweet Creations', 'Erin Godfrey', '12084048359', NULL, '@eggsweetcreations', 'I sell baked goods as well as weighted animals and fused glass jewelry.', 'single', false, false, true, false),

  ('vsteinmetz@petwants.com', 'Pet Wants', 'Valerie Steinmetz', '208-948-0457', 'http://PetWantsTwinFalls.com', 'facebook.com/petwantstwinfalls - instagram.com/petwantstwinfalls', 'Pet Wants would bring a fun, pet-friendly vendor experience featuring fresh, premium pet food, treats, chews and supplements in an engaging, educational booth. We focus on building community connections while supporting local pets and pet parents through quality products and friendly, knowledgeable service.', 'double', false, false, true, false),

  ('jam25@idahovaqueras.com', 'Idaho Vaqueras', 'Juana Benavides', '2087514011', 'http://idahovaqueras.com', 'Idaho Vaqueras', 'Our booth is a fun western boutique with some amazing western clothing that we know people will love. We have tops and bottoms, some jewelry and other lovely accessories.', 'single', false, false, true, false),

  ('ibagelyourpardonyf@gmail.com', 'I bagel your pardon food truck', 'Katie Flavel', '2085398088', NULL, 'I bagel your pardon Facebook', 'We do coffee red bull drinks and Italian sodas. We have bagel sandwiches breakfast and lunch. Bagels with smear with homemade cream cheeses all different flavors from sweet to savory.', 'double', false, false, true, false),

  ('marsha@unforeclosure.com', 'Marsha Marsha Marsha Elevated Goods', 'Marsha L. Hartman PhD, MPH, CPH', '8324443109', 'http://MMMarsha.com', 'https://www.facebook.com/people/Marshamarshamarsha-Elevated-Goods/61559395511262/', 'Same as last years', 'single', true, false, true, false),

  ('STEVIERAYS24@GMAIL.COM', 'STEVIE RAY''S SMOKIN TREATS', 'Stefani Fries', '2084102498', 'https://www.stevie-rays.com', 'INSTA: @stevie_rays_smokin_treats', 'Small batch BBQ Sauce, Sweet & Spicy Mustards, Seasonings, Rubs, Jerky, Whipped Tallow and Dog treat chews', 'single', false, false, true, false),

  ('rudysnow88@gmail.com', 'A&M Prints', 'Rudy Sena', '(208) 3086815', NULL, 'A&M Prints', '3d printed crafts huge huge variety', 'single', true, false, true, false),

  ('homeplacesweets@gmail.com', 'Home Place Sweets', 'Megan Garrison', '2083203757', 'https://bakesy.shop/b/home-place-sweets-1', '@homeplacesweets', 'Home Place Sweets offers a variety of deserts including decorated sugar cookies, cookies, cotton candy, cake pops, mini cakes, Swiss rolls and specialty breads. We are a cottage bakery located in Jerome Idaho who specializes in custom desserts', 'single', false, false, true, false),

  ('linkedxthea@gmail.com', 'Thea', 'Christine Kennedy', '2084107563', NULL, 'Linkedxthea', 'Simple & relaxed display, unique jewelry items; beaded, leather, glass, sterling/gold fill, vintage upcycle, Lip balms & cuticle oil, permanent jewelry, charms/connectors, small selection upcycled home decor items. Lots of unique items with fun vintage pieces!', 'single', false, false, true, false),

  ('michella72@me.com', 'Cookie Rush', 'Michelle Lester', '2097490737', NULL, 'IG CookieRush208', 'My booth will be pretty basic a 10x10 tent and 3 table. I make custom ordered sugar cookies. I also offer a small menus of mini loaf cakes and decorate yourself cookie kits to take home.', 'single', true, false, true, false),

  ('bs208creations@gmail.com', 'BS208Creations', 'Shelli Stokesberry', '12087316551', NULL, '@bs208creations', 'We have 3d printed figurines including farm animals, zoo animals, exotic animals, snakes, lizards, frogs, and others. Most of our figurines are multicolored and unique to our store.', 'single', false, false, true, false),

  ('rgreiner@therustydog.biz', 'The Rusty Dog', 'Robb Greiner', '2087810529', 'http://therustydog.biz', NULL, 'Gourmet style hand dipped corndogs with sides of fresh cut twice fries', 'double', true, false, true, false),

  ('waynettterry@yahoo.com', 'Wild Way Designs', 'Waynett L Page', '12084201205', 'http://Wild-way-designs.myshopify.com', 'Wild.way.designs', 'Hand pressed DTF, sublimated, and screen printed images on assorted tops. Also pick and press. You can pick your top and image and we press it right then.', 'single', true, false, true, false)

ON CONFLICT (email) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  social_handles = EXCLUDED.social_handles,
  description = EXCLUDED.description,
  booth_size = EXCLUDED.booth_size,
  needs_power = EXCLUDED.needs_power,
  is_nonprofit = EXCLUDED.is_nonprofit;
