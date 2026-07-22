# Annadata Agri & Seeds Website

## Project Overview

A bilingual (Hindi/English) agricultural consultation platform and retail management system for **Annadata Agri & Seeds**, Salamatpur, Raisen, MP. Built with React + Vite + Supabase.

### Public Website (`/`)
- Hero section with seasonal messaging
- **Kisan Information Center** — 12 rice/crop problem cards with symptoms, causes, expected loss, expert advice, and enquiry CTA
- Smart Farmer Help Section — problem-based quick enquiry triggers
- Crop Doctor Section — interactive crop problem diagnosis
- Products section, seasonal crop calendar, Dhan booking, pickup service
- WhyChoose, Stats, Shop Gallery, Owner profile, Kisan Club, Contact, Map
- Google Reviews integration
- PWA support (install as app)

### Enquiry System
- Database-backed enquiry form (Name, Mobile, Village, District, Crop, Problem, Land Area, Message, Photo)
- Stores all enquiries in Supabase `enquiries` table
- WhatsApp fallback if DB unavailable
- Admin dashboard to view, reply, filter, export enquiries

### Admin Panel (`/admin`)
- Login: Supabase Auth
- **Enquiries** — view/reply/status-change/export farmer enquiries (NEW)
- Dashboard — farmer follow-up system
- Quick Sale / Quick Stock
- Billing — PDF invoice generation (jsPDF)
- Products, Stock, Customers, Khata/Udhaar
- Bill Photo, Purchase (supplier bills), Company Payments
- Follow-up, Reports
- Simple Mode / Full Mode toggle

## Tech Stack

- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: Wouter
- **State**: TanStack Query
- **UI**: Shadcn UI (Radix primitives)
- **Charts**: Recharts
- **PDF**: jsPDF + jsPDF-AutoTable
- **Export**: SheetJS (xlsx)

## How to Run

```bash
npm install && npm run dev
```

Runs on port 5000.

## Environment

Supabase URL and Anon Key are configured in Replit environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Setup

Run SQL files in Supabase SQL Editor (in order):
1. `supabase_schema.sql` — core tables (products, customers, invoices, etc.)
2. `supabase-company-payments.sql` — supplier payments
3. `supabase-enquiries.sql` — farmer enquiry system (NEW)

Also create a Supabase Storage bucket named `enquiry-photos` (**Private** — not public). Admins view photos via short-lived signed URLs; farmers cannot access photos directly.

## Deployment

See `README_DEPLOY.txt` for Cloudflare Pages / Vercel deploy instructions.

## User Preferences

- Do NOT redesign the existing UI — design, animations, branding, typography are fixed
- Feature and business conversion updates only
- Maintain Lighthouse score, SEO, lazy loading, animations, responsiveness
- Hindi-first content with English labels in admin
- Keep all customer enquiries in database (not just WhatsApp)
