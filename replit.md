# Annadata Agri & Seeds — Website

A React + Vite frontend website for Annadata Agri & Seeds, a farm supply store in Salamatpur, Raisen. Includes a public-facing website and an admin panel (Smart Dukaan system).

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend/Database**: Supabase (PostgreSQL)
- **UI**: Radix UI components, Framer Motion, shadcn/ui
- **Routing**: Wouter
- **State**: TanStack Query

## Running the App
```bash
npm install && npm run dev
```
Runs on port 5000.

## Required Secrets
Set these in Replit Secrets before running:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

The app works without Supabase (falls back to hardcoded data), but features like enquiry forms, billing, products, and the Kisan Info Center won't persist.

## Database Setup
Run the SQL files in your Supabase SQL Editor:
1. `supabase_schema.sql` — core tables (products, customers, bills, etc.)
2. `supabase-enquiries.sql` — farmer enquiries table
3. `supabase-company-payments.sql` — company payments table
4. `supabase-kisan-info.sql` — Kisan Information Center table (NEW)

## Key Pages
- `/` — Public website (home page)
- `/reviews` — Google reviews page
- `/admin/login` — Admin login
- `/admin` — Admin dashboard (requires Supabase auth)

## Admin Sections
- Today's Summary, Quick Sale, Quick Stock
- Billing, Products, Stock management
- Customers, Khata/Credit ledger
- Udhaar Collection, Farmer Enquiries
- **Kisan Info Center** — manage farm problem info cards shown on the website
- Company Payments, Purchase bills
- Follow-up tracker, Reports

## User Preferences
- Hindi UI labels are used throughout (with English toggle in admin)
- Keep existing project structure — do not restructure or migrate
