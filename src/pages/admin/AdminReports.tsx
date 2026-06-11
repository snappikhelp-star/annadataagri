import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Download, Package, BookOpen } from "lucide-react";
import * as XLSX from "xlsx";

const COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#2563eb", "#7c3aed", "#db2777", "#0891b2"];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "products" | "profit">("daily");
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [profitData, setProfitData] = useState({ revenue: 0, cost: 0, profit: 0, stockValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [
        { data: invoices },
        { data: items },
        { data: products }
      ] = await Promise.all([
        supabase.from("invoices").select("created_at, final_amount, payment_status").order("created_at"),
        supabase.from("invoice_items").select("product_id, product_name, quantity, total, selling_price, discount, invoice_id"),
        supabase.from("products").select("id, name, current_stock, purchase_price, selling_price, category").eq("is_active", true)
      ]);

      const invs = invoices || [];
      const its = items || [];
      const prods = products || [];

      // Daily — last 7 days
      const today = new Date();
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });
      const dayMap: Record<string, number> = {};
      invs.forEach((inv: any) => {
        const d = inv.created_at.split("T")[0];
        dayMap[d] = (dayMap[d] || 0) + Number(inv.final_amount);
      });
      setDailyData(last7.map(d => ({
        date: d.slice(5).replace("-", "/"),
        sales: Math.round(dayMap[d] || 0)
      })));

      // Monthly — last 6 months
      const monthMap: Record<string, number> = {};
      invs.forEach((inv: any) => {
        const m = inv.created_at.slice(0, 7);
        monthMap[m] = (monthMap[m] || 0) + Number(inv.final_amount);
      });
      const months = Object.keys(monthMap).sort().slice(-6);
      setMonthlyData(months.map(m => ({ month: m.slice(5), sales: Math.round(monthMap[m] || 0) })));

      // Top products by revenue
      const prodMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      its.forEach((item: any) => {
        const key = item.product_id || item.product_name;
        if (!prodMap[key]) prodMap[key] = { name: item.product_name, qty: 0, revenue: 0 };
        prodMap[key].qty += Number(item.quantity);
        prodMap[key].revenue += Number(item.total);
      });
      setTopProducts(Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10));

      // Category breakdown
      const catMap: Record<string, number> = {};
      its.forEach((item: any) => {
        const prod = prods.find((p: any) => p.id === item.product_id);
        const cat = prod?.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + Number(item.total);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) })));

      // Profit estimate
      const totalRevenue = invs.reduce((s: number, i: any) => s + Number(i.final_amount), 0);
      // Estimate cost from products purchase price * qty sold
      let totalCost = 0;
      its.forEach((item: any) => {
        const prod = prods.find((p: any) => p.id === item.product_id);
        if (prod) totalCost += Number(prod.purchase_price) * Number(item.quantity);
      });
      const stockVal = prods.reduce((s: number, p: any) => s + Number(p.current_stock) * Number(p.purchase_price), 0);
      setProfitData({ revenue: Math.round(totalRevenue), cost: Math.round(totalCost), profit: Math.round(totalRevenue - totalCost), stockValue: Math.round(stockVal) });

    } catch (err) {
      console.error("Reports error:", err);
    }
    setLoading(false);
  }

  function exportReport() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topProducts.map(p => ({
      प्रोडक्ट: p.name, मात्रा: p.qty, राजस्व: p.revenue
    }))), "Best Sellers");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyData.map(m => ({
      महीना: m.month, बिक्री: m.sales
    }))), "Monthly");
    XLSX.writeFile(wb, "annadata_reports.xlsx");
  }

  const tabs = [
    { id: "daily" as const, label: "दैनिक" },
    { id: "monthly" as const, label: "मासिक" },
    { id: "products" as const, label: "बेस्ट प्रोडक्ट" },
    { id: "profit" as const, label: "लाभ / स्टॉक" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">रिपोर्ट्स</h2>
        <button onClick={exportReport}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200">
          <Download className="w-4 h-4" /> एक्सपोर्ट
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "कुल राजस्व", value: `₹${profitData.revenue.toLocaleString("en-IN")}`, color: "text-green-700 bg-green-50 border-green-100", icon: TrendingUp },
          { label: "अनुमानित लाभ", value: `₹${profitData.profit.toLocaleString("en-IN")}`, color: "text-blue-700 bg-blue-50 border-blue-100", icon: TrendingUp },
          { label: "स्टॉक मूल्य", value: `₹${profitData.stockValue.toLocaleString("en-IN")}`, color: "text-purple-700 bg-purple-50 border-purple-100", icon: Package },
          { label: "बेस्ट सेलर्स", value: topProducts.length.toString(), color: "text-orange-700 bg-orange-50 border-orange-100", icon: BookOpen },
        ].map(c => (
          <div key={c.label} className={`${c.color} border rounded-2xl p-4 text-center`}>
            <p className="font-bold text-xl">{c.value}</p>
            <p className="text-xs font-hindi mt-1 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-hindi whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? "bg-green-600 text-white font-bold shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Daily */}
          {activeTab === "daily" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-700 font-hindi mb-4">पिछले 7 दिन की बिक्री</h3>
              {dailyData.every(d => d.sales === 0) ? (
                <p className="text-center text-gray-400 font-hindi py-8">अभी कोई बिक्री डेटा नहीं</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "बिक्री"]} />
                    <Bar dataKey="sales" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 space-y-2 border-t pt-4">
                {[...dailyData].reverse().slice(0, 5).map(d => (
                  <div key={d.date} className="flex justify-between items-center py-1.5">
                    <span className="text-gray-600 text-sm font-hindi">{d.date}</span>
                    <span className="font-bold text-green-700">₹{d.sales.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly */}
          {activeTab === "monthly" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-700 font-hindi mb-4">मासिक बिक्री (पिछले 6 महीने)</h3>
              {monthlyData.length === 0 ? (
                <p className="text-center text-gray-400 font-hindi py-8">अभी कोई डेटा नहीं</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "बिक्री"]} />
                    <Bar dataKey="sales" fill="#ca8a04" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 space-y-2 border-t pt-4">
                {[...monthlyData].reverse().map(m => (
                  <div key={m.month} className="flex justify-between items-center py-1.5">
                    <span className="text-gray-600 text-sm">{m.month}</span>
                    <span className="font-bold text-yellow-700">₹{m.sales.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Products */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-700 font-hindi mb-4">सर्वाधिक बिकने वाले प्रोडक्ट</h3>
                {topProducts.length === 0 ? (
                  <p className="text-center text-gray-400 font-hindi py-8">अभी कोई बिक्री डेटा नहीं</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-hindi font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, (p.revenue / (topProducts[0]?.revenue || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm text-green-700">₹{p.revenue.toLocaleString("en-IN")}</p>
                          <p className="text-gray-400 text-xs font-hindi">{p.qty} बिके</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {categoryData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 font-hindi mb-4">श्रेणी अनुसार बिक्री</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "बिक्री"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Profit & Stock */}
          {activeTab === "profit" && (
            <div className="space-y-3">
              {[
                { label: "कुल राजस्व", value: profitData.revenue, color: "from-green-50 to-green-100 border-green-200 text-green-800", note: "सभी बिल की कुल राशि" },
                { label: "अनुमानित लागत", value: profitData.cost, color: "from-red-50 to-red-100 border-red-200 text-red-800", note: "खरीद मूल्य × बेची मात्रा" },
                { label: "अनुमानित लाभ", value: profitData.profit, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-800", note: "राजस्व − लागत" },
                { label: "मौजूदा स्टॉक मूल्य", value: profitData.stockValue, color: "from-purple-50 to-purple-100 border-purple-200 text-purple-800", note: "स्टॉक × खरीद मूल्य" },
              ].map(item => (
                <div key={item.label} className={`bg-gradient-to-r ${item.color} border rounded-2xl p-5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-hindi font-bold text-base">{item.label}</p>
                      <p className="text-xs opacity-70 font-hindi mt-0.5">{item.note}</p>
                    </div>
                    <p className="font-bold text-2xl">₹{item.value.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 font-hindi text-center pt-2">
                * लाभ का अनुमान खरीद मूल्य के आधार पर है। वास्तविक लागत अलग हो सकती है।
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
