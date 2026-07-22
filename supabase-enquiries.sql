-- ============================================================
-- Annadata Kisan Enquiry System — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─── HELPER: admin check ────────────────────────────────────
-- Uses the existing profiles table (role column) as the source of truth.
-- Only users with profiles.role = 'admin' can read/update/delete enquiries.

-- ─── ENQUIRIES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  village TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  crop TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  land_area TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'resolved')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- ─── ENQUIRY RLS POLICIES ───────────────────────────────────

-- Anyone (including anonymous) may INSERT a new enquiry (public form submission).
DROP POLICY IF EXISTS "Public can submit enquiry" ON enquiries;
CREATE POLICY "Public can submit enquiry" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Only verified admins (profiles.role = 'admin') may read enquiries.
DROP POLICY IF EXISTS "Admins can read enquiries" ON enquiries;
CREATE POLICY "Admins can read enquiries" ON enquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only verified admins may update (e.g. set status, add reply).
DROP POLICY IF EXISTS "Admins can update enquiries" ON enquiries;
CREATE POLICY "Admins can update enquiries" ON enquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only verified admins may delete enquiries.
DROP POLICY IF EXISTS "Admins can delete enquiries" ON enquiries;
CREATE POLICY "Admins can delete enquiries" ON enquiries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS enquiries_mobile_idx ON enquiries (mobile);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries (status);
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);

-- ─── STORAGE: enquiry-photos bucket ─────────────────────────
-- Step 1 — Create the bucket manually in Supabase Dashboard:
--   Storage → New Bucket → Name: enquiry-photos → Public: OFF
--   (Private bucket; presigned URLs used for admin access)
--
-- Step 2 — Run these storage object policies:

-- Allow anonymous users to upload photos (INSERT only, no read).
DROP POLICY IF EXISTS "Public can upload enquiry photos" ON storage.objects;
CREATE POLICY "Public can upload enquiry photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'enquiry-photos');

-- Only admins can read/download uploaded photos.
DROP POLICY IF EXISTS "Admins can read enquiry photos" ON storage.objects;
CREATE POLICY "Admins can read enquiry photos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'enquiry-photos'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only admins can delete uploaded photos.
DROP POLICY IF EXISTS "Admins can delete enquiry photos" ON storage.objects;
CREATE POLICY "Admins can delete enquiry photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'enquiry-photos'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ─── NOTE on farmer self-lookup ─────────────────────────────
-- Public read access is intentionally NOT granted.
-- If you want farmers to check their reply, implement a Supabase
-- Edge Function or RPC that accepts (mobile, secret_code) and
-- returns only that farmer's own records — not open table SELECT.
