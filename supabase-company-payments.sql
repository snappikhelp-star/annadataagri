-- Run this in Supabase → SQL Editor
-- Company Payments feature tables

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text,
  address text,
  contact_person text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists supplier_purchase_bills (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_name text not null,
  bill_number text,
  bill_date date default current_date,
  total_amount numeric(12,2) default 0,
  paid_amount numeric(12,2) default 0,
  remaining_amount numeric(12,2) generated always as (total_amount - paid_amount) stored,
  payment_status text default 'pending' check (payment_status in ('paid','partial','pending')),
  bill_image_url text,
  notes text,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists supplier_purchase_bill_items (
  id uuid primary key default gen_random_uuid(),
  purchase_bill_id uuid references supplier_purchase_bills(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  quantity numeric(10,3) default 0,
  unit text,
  rate numeric(12,2) default 0,
  total numeric(12,2) default 0
);

create table if not exists supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  purchase_bill_id uuid references supplier_purchase_bills(id) on delete set null,
  amount numeric(12,2) not null,
  payment_mode text default 'cash' check (payment_mode in ('cash','upi','bank','cheque')),
  payment_date date default current_date,
  notes text,
  created_by text,
  created_at timestamptz default now()
);

-- Enable RLS (optional but recommended)
alter table suppliers enable row level security;
alter table supplier_purchase_bills enable row level security;
alter table supplier_purchase_bill_items enable row level security;
alter table supplier_payments enable row level security;

-- Allow authenticated users full access
create policy "auth users all" on suppliers for all using (auth.role() = 'authenticated');
create policy "auth users all" on supplier_purchase_bills for all using (auth.role() = 'authenticated');
create policy "auth users all" on supplier_purchase_bill_items for all using (auth.role() = 'authenticated');
create policy "auth users all" on supplier_payments for all using (auth.role() = 'authenticated');
