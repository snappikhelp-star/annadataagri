export type Category = "Seeds" | "Pesticides" | "Fertilizers" | "Crop Medicine" | "Other";
export type CropType = "Dhan" | "Gehu" | "Soyabean" | "Chana" | "Other";
export type Unit = "kg" | "gm" | "ltr" | "ml" | "packet" | "bottle" | "bag" | "pcs";
export type PaymentStatus = "paid" | "udhaar" | "partial";
export type StockMovementType = "in" | "out" | "adjustment";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  crop_type: CropType;
  company: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  unit: Unit;
  low_stock_limit: number;
  image_url?: string;
  notes?: string;
  is_active: boolean;
  is_offer: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  total_purchase: number;
  total_udhaar: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  customer_village: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  paid_amount: number;
  udhaar_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  created_by: string;
  customer?: Customer;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: Unit;
  selling_price: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface Payment {
  id: string;
  customer_id: string;
  invoice_id?: string;
  amount: number;
  notes?: string;
  created_at: string;
  created_by: string;
  customer?: Customer;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_at: string;
  created_by: string;
  product?: Product;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  product_id?: string;
  is_active: boolean;
  valid_till?: string;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at">; Update: Partial<Profile> };
      products: { Row: Product; Insert: Omit<Product, "id" | "created_at" | "updated_at">; Update: Partial<Product> };
      customers: { Row: Customer; Insert: Omit<Customer, "id" | "created_at" | "updated_at">; Update: Partial<Customer> };
      invoices: { Row: Invoice; Insert: Omit<Invoice, "id" | "created_at">; Update: Partial<Invoice> };
      invoice_items: { Row: InvoiceItem; Insert: Omit<InvoiceItem, "id">; Update: Partial<InvoiceItem> };
      payments: { Row: Payment; Insert: Omit<Payment, "id" | "created_at">; Update: Partial<Payment> };
      stock_movements: { Row: StockMovement; Insert: Omit<StockMovement, "id" | "created_at">; Update: Partial<StockMovement> };
      offers: { Row: Offer; Insert: Omit<Offer, "id" | "created_at">; Update: Partial<Offer> };
      settings: { Row: Settings; Insert: Omit<Settings, "id" | "updated_at">; Update: Partial<Settings> };
    };
  };
}
