-- ============================================================
-- Annadata Smart Dukaan System — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Seeds', 'Pesticides', 'Fertilizers', 'Crop Medicine', 'Other')),
  crop_type TEXT NOT NULL DEFAULT 'Other' CHECK (crop_type IN ('Dhan', 'Gehu', 'Soyabean', 'Chana', 'Other')),
  company TEXT NOT NULL DEFAULT '',
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'gm', 'ltr', 'ml', 'packet', 'bottle', 'bag', 'pcs')),
  low_stock_limit NUMERIC(10,2) NOT NULL DEFAULT 5,
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_offer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can do all on products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- ─── CUSTOMERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL DEFAULT '',
  village TEXT NOT NULL DEFAULT '',
  total_purchase NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_udhaar NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');

-- ─── INVOICES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL DEFAULT '',
  customer_village TEXT NOT NULL DEFAULT '',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  final_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  udhaar_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'udhaar', 'partial')),
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');

-- ─── INVOICE ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kg',
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoice_items" ON invoice_items FOR ALL USING (auth.role() = 'authenticated');

-- ─── PAYMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (auth.role() = 'authenticated');

-- ─── STOCK MOVEMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  previous_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  new_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage stock_movements" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- ─── OFFERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_id UUID REFERENCES products(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_till TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active offers" ON offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage offers" ON offers FOR ALL USING (auth.role() = 'authenticated');

-- ─── SETTINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- ─── STORAGE BUCKET ─────────────────────────────────────────
-- Run this separately in Supabase Storage settings:
-- Create a public bucket named "product-images"

-- ─── SAMPLE DATA: 40 AGRI PRODUCTS ─────────────────────────
INSERT INTO products (name, category, crop_type, company, purchase_price, selling_price, current_stock, unit, low_stock_limit, is_active, notes) VALUES
-- SEEDS - Dhan
('पूसा-1886 धान बीज', 'Seeds', 'Dhan', 'IARI Delhi', 1800, 2200, 50, 'kg', 10, true, 'हाइब्रिड, उच्च उत्पादन'),
('PB-1 (परमल बासमती)', 'Seeds', 'Dhan', 'Punjab Agriculture', 1500, 1800, 40, 'kg', 8, true, 'सुगंधित बासमती'),
('HYB-110 धान बीज', 'Seeds', 'Dhan', 'Advanta Seeds', 2200, 2700, 30, 'kg', 5, true, 'हाइब्रिड धान'),
('MTU-7029 (सांभा महसूरी)', 'Seeds', 'Dhan', 'ICAR', 1200, 1500, 35, 'kg', 8, true, 'लंबे दाने'),
('Swarna Dhan Beej', 'Seeds', 'Dhan', 'Bayer Crop', 2500, 3000, 25, 'kg', 5, true, 'प्रीमियम हाइब्रिड'),
-- SEEDS - Gehu
('GW-322 गेहूं बीज', 'Seeds', 'Gehu', 'JNKVV', 600, 750, 100, 'kg', 20, true, 'अच्छी उपज'),
('HD-2967 गेहूं', 'Seeds', 'Gehu', 'IARI Delhi', 650, 800, 80, 'kg', 20, true, 'रतुआ प्रतिरोधी'),
('MP Shakti गेहूं', 'Seeds', 'Gehu', 'JNKVV Jabalpur', 700, 850, 60, 'kg', 15, true, 'MP के लिए उपयुक्त'),
-- SEEDS - Soyabean
('JS-335 सोयाबीन', 'Seeds', 'Soyabean', 'JNKVV', 900, 1100, 80, 'kg', 15, true, 'उच्च प्रोटीन'),
('NRC-37 सोयाबीन', 'Seeds', 'Soyabean', 'ICAR Indore', 1000, 1200, 60, 'kg', 12, true, 'कीट सहनशील'),
('Ahilya-4 सोयाबीन', 'Seeds', 'Soyabean', 'JNKVV', 850, 1050, 70, 'kg', 15, true, 'जल्दी पकने वाली'),
-- SEEDS - Chana
('JG-11 चना बीज', 'Seeds', 'Chana', 'JNKVV', 700, 850, 50, 'kg', 10, true, 'बोल्ड दाना'),
('JG-16 चना', 'Seeds', 'Chana', 'ICRISAT', 750, 900, 40, 'kg', 8, true, 'उकठा रोग प्रतिरोधी'),
('PKV Kabuli Chana', 'Seeds', 'Chana', 'PKV Akola', 1200, 1500, 30, 'kg', 6, true, 'काबुली किस्म'),
-- PESTICIDES
('Chlorpyrifos 50% EC', 'Pesticides', 'Other', 'Dhanuka Agri', 450, 580, 30, 'ltr', 5, true, 'कीट नियंत्रण'),
('Imidacloprid 17.8 SL', 'Pesticides', 'Other', 'Bayer CropScience', 380, 480, 25, 'ltr', 5, true, 'माहू, थ्रिप्स'),
('Lambda Cyhalothrin', 'Pesticides', 'Dhan', 'Syngenta', 320, 400, 20, 'ltr', 4, true, 'तना छेदक'),
('Profenofos 40%+Cypermethrin', 'Pesticides', 'Other', 'Coromandel', 550, 680, 15, 'ltr', 3, true, 'चौड़ा असर'),
('Thiamethoxam 25 WG', 'Pesticides', 'Other', 'Syngenta', 280, 360, 30, 'packet', 5, true, 'सस्तेपर में असरदार'),
('Carbendazim 50 WP', 'Pesticides', 'Other', 'UPL', 180, 230, 40, 'packet', 8, true, 'कवक रोग'),
('Mancozeb 75 WP', 'Pesticides', 'Other', 'Indofil', 160, 200, 35, 'packet', 7, true, 'झुलसा रोग'),
('Cypermethrin 10% EC', 'Pesticides', 'Other', 'Gharda Chemicals', 200, 260, 25, 'ltr', 5, true, 'इल्ली नियंत्रण'),
-- FERTILIZERS
('DAP (डीएपी) 50kg', 'Fertilizers', 'Other', 'IFFCO', 1350, 1400, 100, 'bag', 20, true, 'बुवाई के समय'),
('यूरिया 50kg', 'Fertilizers', 'Other', 'IFFCO', 266, 280, 150, 'bag', 30, true, 'नाइट्रोजन'),
('NPK 10:26:26', 'Fertilizers', 'Other', 'IFFCO', 1450, 1550, 60, 'bag', 10, true, 'संतुलित खाद'),
('जिंक सल्फेट 21%', 'Fertilizers', 'Other', 'Coromandel', 60, 80, 50, 'kg', 10, true, 'जिंक की कमी'),
('बोरान 20%', 'Fertilizers', 'Other', 'Gujarat State', 120, 160, 30, 'kg', 5, true, 'दाना भरने के लिए'),
('Potash (MOP) 50kg', 'Fertilizers', 'Other', 'IPL', 700, 750, 80, 'bag', 15, true, 'पोटेशियम'),
('Ferrous Sulphate', 'Fertilizers', 'Other', 'Various', 55, 70, 40, 'kg', 8, true, 'आयरन की कमी'),
-- CROP MEDICINE
('Propiconazole 25 EC', 'Crop Medicine', 'Dhan', 'Syngenta', 350, 450, 20, 'ltr', 4, true, 'ब्लास्ट, शीथ ब्लाइट'),
('Hexaconazole 5% SC', 'Crop Medicine', 'Other', 'Bayer', 320, 420, 18, 'ltr', 3, true, 'कवक रोग'),
('Kasugamycin 3 SL', 'Crop Medicine', 'Dhan', 'Dhanuka', 600, 780, 12, 'ltr', 3, true, 'धान ब्लास्ट'),
('Tebuconazole 25 WG', 'Crop Medicine', 'Gehu', 'Bayer', 400, 520, 15, 'packet', 3, true, 'गेहूं रतुआ'),
('Metalaxyl + Mancozeb', 'Crop Medicine', 'Soyabean', 'Syngenta', 280, 360, 20, 'packet', 4, true, 'जड़ सड़न'),
('Validamycin 3L', 'Crop Medicine', 'Dhan', 'Indofil', 250, 320, 15, 'ltr', 3, true, 'शीथ ब्लाइट'),
-- CROP MEDICINE - Herbicides
('Butachlor 50% EC', 'Crop Medicine', 'Dhan', 'Dhanuka', 180, 230, 30, 'ltr', 5, true, 'धान खरपतवार'),
('Pendimethalin 30 EC', 'Crop Medicine', 'Gehu', 'BASF', 220, 280, 25, 'ltr', 5, true, 'खरपतवार नाशक'),
('Pretilachlor 50 EC', 'Crop Medicine', 'Dhan', 'Syngenta', 280, 360, 20, 'ltr', 4, true, 'रोपाई के बाद'),
-- OTHER
('कृषि पाइप (1.5 inch) 50m', 'Other', 'Other', 'Supreme', 850, 1100, 10, 'pcs', 2, true, 'सिंचाई पाइप'),
('हाथ पम्प स्प्रेयर 16L', 'Other', 'Other', 'Aspee', 1200, 1600, 8, 'pcs', 2, true, 'मैनुअल स्प्रे पम्प'),
('जैव खाद (वर्मीकम्पोस्ट)', 'Other', 'Other', 'Local', 8, 12, 500, 'kg', 100, true, 'जैविक खाद');

-- ─── SETTINGS ───────────────────────────────────────────────
INSERT INTO settings (key, value) VALUES
('shop_name', 'Annadata Agri & Seeds'),
('shop_address', 'Salamatpur, Raisen, MP 464993'),
('shop_mobile', '9691712455'),
('shop_owner', 'Keshav Meena'),
('invoice_prefix', 'INV');

-- ─── HOW TO CREATE ADMIN USER ───────────────────────────────
-- In Supabase Dashboard:
-- 1. Go to Authentication > Users > Invite User
-- 2. Enter email (e.g. keshav@annadata.in) and set password
-- 3. The user can then login at /admin/login
-- OR use Supabase Auth API to create user programmatically
