# Project Notes

## Payment Process

**Current Implementation:**
1. Admin creates invoice via `POST /payments` (backend ready)
2. Vendor sees invoice in their Payments tab under "Open Invoices"
3. Vendor clicks "Pay Now" → Stripe Payment Element appears
4. Payment completes → webhook updates status to 'paid'

**TODO:**
- Add admin UI to create invoices when reviewing/approving vendor applications
- Connect invoice generation to vendor approval workflow
