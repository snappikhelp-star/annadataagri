-- ============================================================
-- Annadata Smart Dukaan — Migration SQL
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add bill_image_url to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_image_url TEXT;

-- 2. Add crop_type and last_purchase_date to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS crop_type TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase_date DATE;

-- 3. Create purchase_bills table (Supplier Purchase Bills)
CREATE TABLE IF NOT EXISTS purchase_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  supplier_mobile TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  bill_photo_url TEXT,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins manage purchase_bills"
  ON purchase_bills FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Create purchase_bill_items table
CREATE TABLE IF NOT EXISTS purchase_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_bill_id UUID NOT NULL REFERENCES purchase_bills(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kg',
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE purchase_bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins manage purchase_bill_items"
  ON purchase_bill_items FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Storage Buckets — Create these in Supabase Dashboard > Storage:
--    - bill-images     (Public)
--    - purchase-bills  (Public)
--    - product-images  (Public)
-- (Already created via API — no action needed here)

SELECT 'Migration complete! ✅' AS status;
