import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { ShoppingCart, BookOpen, Banknote, Receipt, Package, RefreshCw } from "lucide-react";

export default function AdminToday() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ sales: 0, udhaar: 0, cash: 0, bills: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { fetchToday(); }, []);

  async function fetchToday() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const todayEnd = today + "T23:59:59.999Z";
    const todayStart = today + "T00:00:00.000Z";

    const [{ data: invs }, { data: invItems }] = await Promise.all([
      supabase.from("invoices").select("*")
        .gte("created_at", todayStart).lte("created_at", todayEnd)
        .order("created_at", { ascending: false }),
      supabase.from("invoice_items").select("*, invoice:invoices!inner(created_at)")
        .gte("invoices.created_at", todayStart).lte("invoices.created_at", todayEnd),
    ]);

    const list = invs || [];
    const sales = list.reduce((s, i) => s + Number(i.final_amount || 0), 0);
    const udhaar = list.reduce((s, i) => s + Number(i.udhaar_amount || 0), 0);
    const cash = list.reduce((s, i) => s + Number(i.paid_amount || 0), 0);

    setStats({ sales, udhaar, cash, bills: list.length });
    setInvoices(list);
    setItems(invItems || []);
    setLoading(false);
  }

  const cards = [
    { label: t("todaySales"), value: `₹${stats.sales.toLocaleString("en-IN")}`, icon: ShoppingCart, color: "from-green-500 to-green-600" },
    { label: t("todayCash"), value: `₹${stats.cash.toLocaleString("en-IN")}`, icon: Banknote, color: "from-blue-500 to-blue-600" },
    { label: t("todayUdhaar"), value: `₹${stats.udhaar.toLocaleString("en-IN")}`, icon: BookOpen, color: "from-orange-500 to-orange-600" },
    { label: t("todayBills"), value: stats.bills.toString(), icon: Receipt, color: "from-purple-500 to-purple-600" },
  ];

  const now = new Date().toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("todayTitle")} 📅</h1>
          <p className="text-gray-500 font-hindi text-sm mt-0.5">{now}</p>
        </div>
        <button onClick={fetchToday} className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {cards.map(c => (
              <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-white/80 text-sm font-hindi mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {invoices.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🌾</p>
              <p className="text-yellow-800 font-hindi text-xl font-bold">{t("noSalesToday")}</p>
              <p className="text-yellow-600 font-hindi text-sm mt-2">आज का पहला बिल बनाएं!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800 font-hindi">आज के बिल ({invoices.length})</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 font-hindi">{inv.customer_name}</p>
                      <p className="text-gray-400 text-xs font-hindi">
                        {inv.invoice_number} • {inv.customer_village}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(inv.created_at).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">₹{Number(inv.final_amount || 0).toLocaleString("en-IN")}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-hindi font-bold ${
                        inv.payment_status === "paid" ? "bg-green-100 text-green-700" :
                        inv.payment_status === "udhaar" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {inv.payment_status === "paid" ? "✅ पेड" : inv.payment_status === "udhaar" ? "🔴 उधार" : "🟡 आंशिक"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-green-50 border-t border-green-100 flex justify-between items-center">
                <span className="font-hindi font-bold text-green-800">कुल आज</span>
                <span className="text-2xl font-bold text-green-700">₹{stats.sales.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
