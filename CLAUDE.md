# Project Notes

## CRITICAL: How to Not Waste Time

### When Asked to Copy or Mirror Something

1. **"Copy" means COPY.** Read the existing code first. Duplicate it exactly. Change only what's necessary.
2. **"Mirror" means flip the layout, not redesign.** Same colors, same spacing, same styles. Just swap left/right or top/bottom.
3. **Do NOT pick new colors.** Ever. Unless explicitly asked "what color should this be?"
4. **Do NOT add features.** No animations, no hover effects, no "improvements" unless requested.
5. **Do NOT invent new CSS classes.** Copy the existing class names and modify minimally.

### Before Writing ANY Code

1. **Check if the data already exists.** Search the entire codebase. Check all database tables. Don't create new tables with fake data.
2. **Read related existing code completely.** If making a music section similar to vendors section, read EVERY line of the vendor section first.
3. **Look at screenshots the user provides.** They show you exactly what they want. Don't ignore them.

### When You Get Corrected

1. **Stop and re-read the original request.** Word for word.
2. **Ask yourself: what ELSE am I doing wrong?** Don't just fix the one thing mentioned.
3. **Don't justify your choices.** If you weren't asked to make a choice, you shouldn't have made it.

### General Rules

1. **Activity is not progress.** 50 lines of correct code beats 500 lines of wrong code.
2. **This is the user's project, not yours.** Execute their vision. Don't add your own ideas unless asked.
3. **When in doubt, ask.** "Do you want the exact same colors?" is better than guessing wrong.
4. **Literal interpretation first.** If they say "copy the vendor section," your first instinct should be Ctrl+C, Ctrl+V, then modify.
5. **NEVER use browser tools to view pages.** Always ask the user to check the page and tell you what they see. Do not attempt to view pages yourself.

### Before Submitting Code

1. **Did you change any colors that weren't requested?** Undo them.
2. **Did you add any styling that wasn't requested?** Remove it.
3. **Did you create fake/sample data?** Delete it and find the real data.
4. **Is your code 3x longer than it needs to be?** You're overcomplicating it.

---

## Local Development

**Never ask the user to restart the server.** If backend changes require a server restart, do it yourself:
```bash
# Find and kill the running server process, then restart it
pkill -f "node.*server" && cd /Users/jared.lauritsen/Documents/Street/server && node index.js &
```

## Deployment

**Server:** DigitalOcean droplet at `165.232.145.5`, SSH user `jared`

**Project location:** `/var/www/app`

**Nginx config:**
- Static frontend served from `/var/www/html`
- API proxied at `/api/` → `http://127.0.0.1:5001`
- Uploads served at `/uploads/` → `/var/www/app/server/uploads/`

**Deploy steps:**
```bash
ssh 165.232.145.5 "cd /var/www/app && git pull && cd client && npm run build"
ssh 165.232.145.5 "sudo cp -r /var/www/app/client/build/* /var/www/html/"
```

**Important:** Images use relative paths (`/uploads/...`) because nginx serves them directly. Do NOT prepend `API_URL`.

**Database:** PostgreSQL (connection config in `.env`)

## Payment Process

**Current Implementation:**
1. Admin creates invoice via `POST /payments` (backend ready)
2. Vendor sees invoice in their Payments tab under "Open Invoices"
3. Vendor clicks "Pay Now" → Stripe Payment Element appears
4. Payment completes → webhook updates status to 'paid'

**TODO:**
- Add admin UI to create invoices when reviewing/approving vendor applications
- Connect invoice generation to vendor approval workflow
