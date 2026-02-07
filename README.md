# Market on Main

A web application for the **Market on Main** farmers market in Downtown Twin Falls, Idaho. Runs every Saturday, 9am-2pm, June through August.

## What It Does

- **Public homepage** with hero section, vendor carousel, live music schedule, news/blog, sponsors, and location info
- **Vendor directory** with profiles, categories (Growers, Makers, Eats, Finds), and scheduling
- **Music schedule** with performer lineup and time slots
- **Vendor portal** where vendors can manage their profile, view invoices, and pay via Stripe
- **Admin dashboard** for managing vendors, music applications, schedules, invoices, and blog posts

## Tech Stack

- **Frontend**: React (Create React App), vanilla CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Payments**: Stripe (Payment Element + webhooks)
- **Email**: Resend
- **Hosting**: DigitalOcean droplet (165.232.145.5), Nginx reverse proxy

## Project Structure

```
Street/
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/         # Public-facing pages
│   │   │   │   └── TestHome4.js  # Homepage (main landing page)
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   └── vendor/         # Vendor portal pages
│   │   ├── styles/
│   │   │   └── public.css      # ALL homepage/public styling (hero, vendors, music, news, footer, responsive)
│   │   └── components/
│   │       └── PublicLayout.js  # Shared header/footer for public pages
│   └── public/
│       └── images/             # Static images (carousel, market photos, sponsors)
├── server/                     # Express API backend
│   ├── index.js                # Server entry point
│   ├── routes/                 # API route handlers
│   ├── uploads/                # User-uploaded files (vendor images, etc.)
│   └── .env                    # Environment config (DB, Stripe, email keys)
├── CLAUDE.md                   # AI assistant instructions
└── DEV-SETUP.md                # Dev environment startup guide
```

## Key Styling File

**`client/src/styles/public.css`** contains ALL public page styles:

- Hero section (`.hero__*`) — maroon background, animated image carousel, tabs
- Vendor section (`.vendors-section__*`, `.homepage-vendor-card*`) — peach card with scrollable vendor cards
- Music section (`.music-section__*`, `.music-card*`) — live music schedule cards
- News section (`.news-section__*`, `.news-card*`) — blog/news grid
- Sponsors section (`.sponsors-section__*`) — logo grid
- CTA cards (`.cta-card*`) — colored action cards
- Location section (`.location-section__*`) — map and photos
- Footer (`.footer__*`)
- Responsive breakpoints at bottom: 1200px, 1024px, 768px

## Recent Work (Feb 2026)

### Mobile Responsive Homepage
- **Hero section**: Auto height on mobile, horizontal image marquee using per-item CSS animation (inspired by Paint It Easy reference site), hide second image column
- **Vendor section**: 70vw scrollable cards, title row with inline "See All Vendors" CTA, filter buttons wrap properly (All Vendors on own row), hide scroll arrows on mobile
- **Music section**: Single column layout, hide decorative image, 70vw scrollable cards, hide arrows
- **Scroll dot sync**: Added scroll event listeners so pagination dots update on swipe for both vendor and music carousels
- **Sponsors**: 2-column grid on mobile (down from 3)
- **News**: Hide featured image on mobile
- **Image optimization**: Compressed 20 carousel images from ~2-3MB each to ~40KB each (400px max, quality 60). Added `loading="lazy"` to all below-fold images.
- **Cleanup**: Deleted unused `testhome4.css` (was never imported)

### Other Recent Features
- Vendor date request system with admin review flow
- Split social handles into separate Facebook/Instagram/X fields
- Mark-paid with payment method/memo
- Stripe receipt emails
