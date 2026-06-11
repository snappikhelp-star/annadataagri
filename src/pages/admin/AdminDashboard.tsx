import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp, Users, Package, AlertTriangle,
  ShoppingCart, BookOpen, ArrowUpRight, Building2
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  totalUdhaar: number;
  lowStockCount: number;
  totalProducts: number;
  totalCustomers: number;
  todayInvoices: number;
  companyPending: number;
  pendingSuppliers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0, monthlySales: 0, totalUdhaar: 0,
    lowStockCount: 0, totalProducts: 0, totalCustomers: 0, todayInvoices: 0,
    companyPending: 0, pendingSuppliers: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(
        new Date().getFullYear(), new Date().getMonth(), 1
      ).toISOString();

      const [
        todayInvRes, monthlyInvRes, productsRes, customersRes, lowStockRes, recentInvRes, companyBillsRes
      ] = await Promise.all([
        supabase.from("invoices").select("final_amount").gte("created_at", today),
        supabase.from("invoices").select("final_amount").gte("created_at", monthStart),
        supabase.from("products").select("id, current_stock, low_stock_limit, name, unit").eq("is_active", true),
        supabase.from("customers").select("total_udhaar"),
        supabase.from("products")
          .select("id, name, current_stock, unit, low_stock_limit")
          .eq("is_active", true)
          .limit(10),
        supabase.from("invoices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("supplier_purchase_bills")
          .select("supplier_id, remaining_amount, payment_status")
          .neq("payment_status", "paid")
      ]);

      const prods = productsRes.data || [];
      const lowProds = (lowStockRes.data || []).filter(
        (p: any) => p.current_stock <= p.low_stock_limit
      );

      const companyBills = companyBillsRes.data || [];
      const uniqueSupplierIds = new Set(companyBills.map((b: any) => b.supplier_id).filter(Boolean));
      setStats({
        todaySales: (todayInvRes.data || []).reduce((s: number, i: any) => s + Number(i.final_amount || 0), 0),
        monthlySales: (monthlyInvRes.data || []).reduce((s: number, i: any) => s + Number(i.final_amount || 0), 0),
        totalUdhaar: (customersRes.data || []).reduce((s: number, c: any) => s + Number(c.total_udhaar || 0), 0),
        lowStockCount: prods.filter((p: any) => p.current_stock <= p.low_stock_limit).length,
        totalProducts: prods.length,
        totalCustomers: customersRes.data?.length || 0,
        todayInvoices: todayInvRes.data?.length || 0,
        companyPending: companyBills.reduce((s: number, b: any) => s + Number(b.remaining_amount || 0), 0),
        pendingSuppliers: uniqueSupplierIds.size,
      });
      setLowStockProducts(lowProds.slice(0, 5));
      setRecentInvoices(recentInvRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      label: "आज की बिक्री", value: `₹${stats.todaySales.toLocaleString("en-IN")}`,
      sub: `${stats.todayInvoices} बिल`, icon: ShoppingCart,
      color: "from-green-500 to-green-600", link: "/admin/billing"
    },
    {
      label: "मासिक बिक्री", value: `₹${stats.monthlySales.toLocaleString("en-IN")}`,
      sub: "इस महीने", icon: TrendingUp,
      color: "from-blue-500 to-blue-600", link: "/admin/reports"
    },
    {
      label: "कुल उधार", value: `₹${stats.totalUdhaar.toLocaleString("en-IN")}`,
      sub: "बकाया राशि", icon: BookOpen,
      color: "from-orange-500 to-orange-600", link: "/admin/khata"
    },
    {
      label: "कम स्टॉक", value: stats.lowStockCount.toString(),
      sub: "प्रोडक्ट", icon: AlertTriangle,
      color: "from-red-500 to-red-600", link: "/admin/stock"
    },
    {
      label: "कुल प्रोडक्ट", value: stats.totalProducts.toString(),
      sub: "एक्टिव", icon: Package,
      color: "from-purple-500 to-purple-600", link: "/admin/products"
    },
    {
      label: "कुल ग्राहक", value: stats.totalCustomers.toString(),
      sub: "रजिस्टर्ड", icon: Users,
      color: "from-teal-500 to-teal-600", link: "/admin/customers"
    },
    {
      label: "Company को देना है", value: `₹${stats.companyPending.toLocaleString("en-IN")}`,
      sub: `${stats.pendingSuppliers} कंपनियाँ बाकी`, icon: Building2,
      color: "from-rose-500 to-rose-600", link: "/admin/company-payments"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-hindi">नमस्ते केशव भाई! 🌿</h1>
        <p className="text-gray-500 font-hindi text-sm mt-1">
          {new Date().toLocaleDateString("hi-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.link}>
            <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-white/80 text-xs mt-1 font-hindi">{card.label}</p>
              <p className="text-white/60 text-xs font-hindi">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 font-hindi flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                कम स्टॉक अलर्ट
              </h3>
              <Link href="/admin/stock" className="text-green-600 text-sm font-hindi hover:underline">सब देखें →</Link>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="font-hindi text-gray-700 text-sm">{p.name}</span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold font-hindi">
                    {p.current_stock} {p.unit} बचा
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentInvoices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 font-hindi flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                हाल के बिल
              </h3>
              <Link href="/admin/billing" className="text-green-600 text-sm font-hindi hover:underline">सब देखें →</Link>
            </div>
            <div className="space-y-3">
              {recentInvoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-hindi text-gray-800 text-sm font-medium">{inv.customer_name}</p>
                    <p className="text-gray-400 text-xs font-hindi">{inv.invoice_number} • {inv.customer_village}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">₹{Number(inv.final_amount || 0).toLocaleString("en-IN")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-hindi ${
                      inv.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      inv.payment_status === "udhaar" ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {inv.payment_status === "paid" ? "पेड" : inv.payment_status === "udhaar" ? "उधार" : "आंशिक"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "नया बिल", icon: ShoppingCart, link: "/admin/billing/new", color: "bg-green-600" },
          { label: "प्रोडक्ट जोड़ें", icon: Package, link: "/admin/products/add", color: "bg-blue-600" },
          { label: "स्टॉक इन", icon: Package, link: "/admin/stock", color: "bg-purple-600" },
          { label: "रिपोर्ट", icon: TrendingUp, link: "/admin/reports", color: "bg-orange-600" },
        ].map(btn => (
          <Link key={btn.label} href={btn.link}>
            <button className={`${btn.color} text-white rounded-2xl px-4 py-4 w-full flex flex-col items-center gap-2 hover:opacity-90 transition-opacity shadow-md`}>
              <btn.icon className="w-6 h-6" />
              <span className="font-hindi text-sm font-bold">{btn.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
