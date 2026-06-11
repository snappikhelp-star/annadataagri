import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search, Download, Phone, MapPin, History, X,
  Bell, Clock, CheckCircle2, AlertCircle, Leaf
} from "lucide-react";
import * as XLSX from "xlsx";

// ── Follow-up configuration ───────────────────────────────────────────────────
const FOLLOWUP_DAYS: Record<string, number> = {
  Seeds: 25,
  Pesticides: 15,
  "Crop Medicine": 15,
  Fertilizers: 20,
  Other: 30,
};

const CATEGORY_HI: Record<string, string> = {
  Seeds: "बीज",
  Pesticides: "कीटनाशक",
  Fertilizers: "खाद",
  "Crop Medicine": "फसल दवाई",
  Other: "अन्य",
};

const CROP_HI: Record<string, string> = {
  Dhan: "धान", Gehu: "गेहूं", Soyabean: "सोयाबीन",
  Chana: "चना", Other: "फसल",
};

function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function followUpStatus(days: number, limit: number): "green" | "yellow" | "red" {
  if (days < limit * 0.6) return "green";
  if (days < limit) return "yellow";
  return "red";
}

const STATUS_CONFIG = {
  green: {
    label: "✅ हाल में आए",
    badge: "bg-green-100 text-green-700 border-green-200",
    card: "border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-500",
  },
  yellow: {
    label: "⏰ जल्दी फॉलो-अप करें",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    card: "border-yellow-300",
    icon: Clock,
    iconColor: "text-yellow-500",
  },
  red: {
    label: "🔴 फॉलो-अप जरूरी",
    badge: "bg-red-100 text-red-700 border-red-200",
    card: "border-red-300",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("all");
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "followup">("all");

  // Detail modal
  const [selected, setSelected] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // Follow-up enriched data
  const [followupData, setFollowupData] = useState<any[]>([]);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [fuSearch, setFuSearch] = useState("");
  const [fuFilter, setFuFilter] = useState<"all" | "green" | "yellow" | "red">("all");

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    let r = [...customers];
    if (search) r = r.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || "").includes(search) ||
      (c.village || "").toLowerCase().includes(search.toLowerCase())
    );
    if (villageFilter !== "all") r = r.filter(c => c.village === villageFilter);
    setFiltered(r);
  }, [customers, search, villageFilter]);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) console.error("Customers fetch:", error);
    const custs = data || [];
    setCustomers(custs);
    const vs: string[] = [
      ...new Set(custs.map((c: any) => c.village).filter(Boolean))
    ].sort() as string[];
    setVillages(vs);
    setLoading(false);
  }

  // ── Follow-up data loading ────────────────────────────────────────────────
  async function loadFollowupData() {
    setFollowupLoading(true);
    try {
      // 1. All invoices (id, customer info, date)
      const { data: invs } = await supabase
        .from("invoices")
        .select("id, customer_mobile, customer_name, created_at")
        .order("created_at", { ascending: false });

      // 2. Build "last invoice" map per customer (keyed by mobile or name)
      const lastInvMap: Record<string, any> = {};
      (invs || []).forEach((inv: any) => {
        const key = (inv.customer_mobile || "").trim() || inv.customer_name;
        if (!lastInvMap[key]) lastInvMap[key] = inv;
      });

      // 3. Fetch items for those last invoices (with product category + crop)
      const lastIds = Object.values(lastInvMap).map((i: any) => i.id);
      let categoryMap: Record<string, string> = {};
      let cropMap: Record<string, string> = {};
      if (lastIds.length > 0) {
        const { data: items } = await supabase
          .from("invoice_items")
          .select("invoice_id, product_id, quantity, product:products(category, crop_type)")
          .in("invoice_id", lastIds);

        // Priority: Seeds > Pesticides/Crop Medicine > Fertilizers > Other
        const PRIO: Record<string, number> = {
          Seeds: 4, "Crop Medicine": 3, Pesticides: 3, Fertilizers: 2, Other: 1
        };
        (items || []).forEach((item: any) => {
          const iid = item.invoice_id;
          const cat = item.product?.category || "Other";
          const crop = item.product?.crop_type || "Other";
          const existing = categoryMap[iid];
          if (!existing || (PRIO[cat] || 0) > (PRIO[existing] || 0)) {
            categoryMap[iid] = cat;
            cropMap[iid] = crop;
          }
        });
      }

      // 4. Enrich each customer
      const enriched = customers.map(c => {
        const key = (c.mobile || "").trim() || c.name;
        const lastInv = lastInvMap[key];
        const category = lastInv ? (categoryMap[lastInv.id] || "Other") : null;
        const crop = lastInv ? (cropMap[lastInv.id] || "Other") : null;
        const days = lastInv ? daysSince(lastInv.created_at) : null;
        const limit = category ? (FOLLOWUP_DAYS[category] || 20) : null;
        const status =
          days !== null && limit !== null
            ? followUpStatus(days, limit)
            : null;
        const nextDate =
          lastInv && limit
            ? new Date(new Date(lastInv.created_at).getTime() + limit * 86400000)
                .toLocaleDateString("hi-IN")
            : null;
        return {
          ...c,
          lastPurchaseDate: lastInv?.created_at || null,
          daysSince: days,
          primaryCategory: category,
          primaryCrop: crop,
          followUpDays: limit,
          followUpStatus: status,
          nextFollowUp: nextDate,
        };
      }).filter(c => c.lastPurchaseDate); // only customers with purchases

      setFollowupData(enriched);
    } catch (err) {
      console.error("Follow-up fetch error:", err);
    }
    setFollowupLoading(false);
  }

  function switchTab(tab: "all" | "followup") {
    setActiveTab(tab);
    if (tab === "followup" && followupData.length === 0) loadFollowupData();
  }

  // ── Customer detail modal ─────────────────────────────────────────────────
  async function openHistory(c: any) {
    setSelected(c);
    setHistLoading(true);
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .or(`customer_mobile.eq.${c.mobile},customer_name.eq.${c.name}`)
      .order("created_at", { ascending: false });
    setHistory(data || []);
    setHistLoading(false);
  }

  // ── WhatsApp messages ────────────────────────────────────────────────────
  function waReminder(c: any) {
    const msg = [
      `नमस्ते *${c.name}* जी 🙏`,
      ``,
      `*अन्नदाता एग्री & सीड्स*`,
      `सलामतपुर, रायसेन | 📞 6261737388`,
      ``,
      `आपका उधार बकाया:`,
      `💰 *₹${Number(c.total_udhaar).toLocaleString("en-IN")}*`,
      ``,
      `कृपया जल्दी जमा करें।`,
      `_धन्यवाद — केशव भाई 🌾_`
    ].join("\n");
    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function waFollowUp(c: any) {
    const catHi = CATEGORY_HI[c.primaryCategory] || "खाद/दवाई";
    const cropHi = CROP_HI[c.primaryCrop] || c.primaryCrop || "आपकी फसल";
    const msg = [
      `नमस्ते *${c.name}* जी 🌾`,
      ``,
      `Annadata Agri & Seeds से *केशव भाई* बोल रहे हैं।`,
      ``,
      `आपकी *${cropHi}* फसल के लिए अगर`,
      `*${catHi}* या किसी और चीज़ की ज़रूरत हो`,
      `तो हमें बताएं — हम आपके लिए हमेशा तैयार हैं! 💚`,
      ``,
      `📍 सलामतपुर, रायसेन`,
      `📞 6261737388`,
      ``,
      `_जय किसान 🌱 — अन्नदाता एग्री & सीड्स_`
    ].join("\n");
    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportCustomers() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(customers.map(c => ({
        नाम: c.name, मोबाइल: c.mobile, गांव: c.village,
        कुल_खरीद: c.total_purchase, कुल_उधार: c.total_udhaar,
        तारीख: new Date(c.created_at).toLocaleDateString("hi-IN")
      }))), "Customers");
    XLSX.writeFile(wb, "annadata_customers.xlsx");
  }

  // ── Follow-up list (filtered) ────────────────────────────────────────────
  const filteredFollowup = followupData
    .filter(c => {
      if (fuFilter !== "all" && c.followUpStatus !== fuFilter) return false;
      if (fuSearch) {
        const q = fuSearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.mobile || "").includes(fuSearch) ||
          (c.village || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const ord = { red: 0, yellow: 1, green: 2, null: 3 };
      return (ord[a.followUpStatus as keyof typeof ord] ?? 3) -
             (ord[b.followUpStatus as keyof typeof ord] ?? 3);
    });

  const totalPurchase = customers.reduce((s, c) => s + Number(c.total_purchase || 0), 0);
  const totalUdhaar = customers.reduce((s, c) => s + Number(c.total_udhaar || 0), 0);
  const dueCount = followupData.filter(c => c.followUpStatus === "red").length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">ग्राहक मैनेजमेंट</h2>
        <button onClick={exportCustomers}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200">
          <Download className="w-4 h-4" /> एक्सपोर्ट
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
          <p className="text-gray-500 text-xs font-hindi mt-1">कुल ग्राहक</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-lg font-bold text-green-700">₹{totalPurchase.toLocaleString("en-IN")}</p>
          <p className="text-gray-500 text-xs font-hindi mt-1">कुल बिक्री</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-lg font-bold text-orange-600">₹{totalUdhaar.toLocaleString("en-IN")}</p>
          <p className="text-gray-500 text-xs font-hindi mt-1">कुल उधार</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-white">{dueCount || "—"}</p>
          <p className="text-red-100 text-xs font-hindi mt-1">फॉलो-अप जरूरी</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => switchTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === "all" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600"}`}>
          सभी ग्राहक
        </button>
        <button onClick={() => switchTab("followup")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all flex items-center gap-1.5 ${activeTab === "followup" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600"}`}>
          <Bell className="w-3.5 h-3.5" />
          किसान फॉलो-अप
          {dueCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {dueCount}
            </span>
          )}
        </button>
      </div>

      {/* ── DETAIL MODAL ────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-green-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-800 font-hindi text-lg">{selected.name}</h3>
                <p className="text-gray-500 text-sm font-hindi">{selected.village} • {selected.mobile}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <p className="font-bold text-green-700 text-xl">₹{Number(selected.total_purchase).toLocaleString("en-IN")}</p>
                  <p className="text-gray-500 text-xs font-hindi">कुल खरीद</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                  <p className="font-bold text-orange-600 text-xl">₹{Number(selected.total_udhaar).toLocaleString("en-IN")}</p>
                  <p className="text-gray-500 text-xs font-hindi">कुल उधार</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${selected.mobile}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-hindi font-bold hover:bg-green-700 transition-colors">
                  <Phone className="w-4 h-4" /> Call करें
                </a>
                {Number(selected.total_udhaar) > 0 && (
                  <button onClick={() => waReminder(selected)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-hindi font-bold hover:opacity-90 transition-opacity">
                    📱 उधार रिमाइंडर
                  </button>
                )}
              </div>
              <h4 className="font-bold text-gray-700 font-hindi border-t pt-4">खरीद इतिहास</h4>
              {histLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {history.length === 0
                    ? <p className="text-center text-gray-400 font-hindi py-4">कोई खरीद नहीं</p>
                    : history.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-hindi text-gray-800 font-medium">{inv.invoice_number}</p>
                          <p className="text-gray-400 text-xs">{new Date(inv.created_at).toLocaleDateString("hi-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-800">₹{Number(inv.final_amount).toLocaleString("en-IN")}</p>
                          <span className={`text-xs font-hindi ${inv.payment_status === "paid" ? "text-green-600" : "text-orange-600"}`}>
                            {inv.payment_status === "paid" ? "पेड" : "उधार"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ══ ALL CUSTOMERS TAB ══════════════════════════════════════════ */}
          {activeTab === "all" && (
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="नाम, मोबाइल या गांव से खोजें..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi" />
                </div>
                <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi">
                  <option value="all">सभी गांव</option>
                  {villages.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {filtered.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 font-hindi">{c.name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {c.mobile && (
                            <span className="flex items-center gap-1 text-gray-500 text-xs">
                              <Phone className="w-3 h-3" />{c.mobile}
                            </span>
                          )}
                          {c.village && (
                            <span className="flex items-center gap-1 text-gray-500 text-xs font-hindi">
                              <MapPin className="w-3 h-3" />{c.village}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => openHistory(c)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors ml-2">
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <div className="flex-1 bg-green-50 rounded-xl py-2 text-center border border-green-100">
                        <p className="font-bold text-green-700 text-sm">₹{Number(c.total_purchase).toLocaleString("en-IN")}</p>
                        <p className="text-gray-500 text-xs font-hindi">कुल खरीद</p>
                      </div>
                      {Number(c.total_udhaar) > 0 && (
                        <div className="flex-1 bg-orange-50 rounded-xl py-2 text-center border border-orange-100">
                          <p className="font-bold text-orange-600 text-sm">₹{Number(c.total_udhaar).toLocaleString("en-IN")}</p>
                          <p className="text-gray-500 text-xs font-hindi">उधार</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400 font-hindi">
                    {search || villageFilter !== "all" ? "कोई ग्राहक नहीं मिला" : "अभी कोई ग्राहक नहीं"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ FARMER SMART FOLLOW-UP TAB ═════════════════════════════════ */}
          {activeTab === "followup" && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold font-hindi text-base">किसान स्मार्ट फॉलो-अप सिस्टम</p>
                    <p className="text-green-200 text-xs font-hindi mt-0.5">
                      बीज खरीदी → 25 दिन बाद | कीटनाशक/दवाई → 15 दिन बाद | खाद → 20 दिन बाद
                    </p>
                  </div>
                </div>
              </div>

              {/* Status filters */}
              <div className="flex gap-2 flex-wrap">
                {([
                  { id: "all", label: `सभी (${followupData.length})` },
                  { id: "red", label: `🔴 जरूरी (${followupData.filter(c => c.followUpStatus === "red").length})` },
                  { id: "yellow", label: `⏰ जल्दी (${followupData.filter(c => c.followUpStatus === "yellow").length})` },
                  { id: "green", label: `✅ ठीक है (${followupData.filter(c => c.followUpStatus === "green").length})` },
                ] as const).map(opt => (
                  <button key={opt.id} onClick={() => setFuFilter(opt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-hindi font-semibold border transition-all ${fuFilter === opt.id ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={fuSearch} onChange={e => setFuSearch(e.target.value)}
                  placeholder="ग्राहक खोजें..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi" />
              </div>

              {followupLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-hindi text-sm">डेटा लोड हो रहा है...</p>
                </div>
              ) : filteredFollowup.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400 font-hindi">
                    {fuFilter !== "all" ? "इस श्रेणी में कोई ग्राहक नहीं" : "अभी कोई डेटा नहीं"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFollowup.map((c: any) => {
                    const cfg = c.followUpStatus
                      ? STATUS_CONFIG[c.followUpStatus as keyof typeof STATUS_CONFIG]
                      : null;
                    const StatusIcon = cfg?.icon;
                    return (
                      <div key={c.id}
                        className={`bg-white rounded-2xl border-2 ${cfg?.card || "border-gray-200"} p-4 shadow-sm transition-shadow hover:shadow-md`}>

                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-800 font-hindi">{c.name}</p>
                              {cfg && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-hindi font-bold border ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1">
                              {c.mobile && (
                                <span className="flex items-center gap-1 text-gray-500 text-xs">
                                  <Phone className="w-3 h-3" />{c.mobile}
                                </span>
                              )}
                              {c.village && (
                                <span className="flex items-center gap-1 text-gray-500 text-xs font-hindi">
                                  <MapPin className="w-3 h-3" />{c.village}
                                </span>
                              )}
                            </div>
                          </div>
                          {StatusIcon && (
                            <StatusIcon className={`w-6 h-6 flex-shrink-0 ${cfg?.iconColor}`} />
                          )}
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {c.primaryCategory && (
                            <span className="bg-green-50 border border-green-100 text-green-700 text-xs px-2.5 py-1 rounded-lg font-hindi font-semibold">
                              🛒 {CATEGORY_HI[c.primaryCategory] || c.primaryCategory}
                            </span>
                          )}
                          {c.primaryCrop && c.primaryCrop !== "Other" && (
                            <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-lg font-hindi font-semibold">
                              🌾 {CROP_HI[c.primaryCrop] || c.primaryCrop}
                            </span>
                          )}
                          {c.daysSince !== null && (
                            <span className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-lg font-hindi">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {c.daysSince} दिन पहले खरीदा
                            </span>
                          )}
                          {c.nextFollowUp && (
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-hindi border ${
                              c.followUpStatus === "red"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : c.followUpStatus === "yellow"
                                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>
                              📅 फॉलो-अप: {c.nextFollowUp}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          {c.mobile && (
                            <button onClick={() => waFollowUp(c)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2.5 rounded-xl text-xs font-hindi font-bold hover:opacity-90 transition-opacity shadow-sm">
                              📱 फॉलो-अप WhatsApp
                            </button>
                          )}
                          <a href={`tel:${c.mobile}`}
                            className="flex items-center justify-center gap-1.5 bg-green-50 text-green-700 py-2.5 px-4 rounded-xl text-xs font-hindi font-bold hover:bg-green-100 transition-colors border border-green-200">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <button onClick={() => openHistory(c)}
                            className="flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 py-2.5 px-4 rounded-xl text-xs font-hindi font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Due progress bar */}
                        {c.daysSince !== null && c.followUpDays && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 font-hindi mb-1">
                              <span>खरीद की तारीख</span>
                              <span>{Math.min(c.daysSince, c.followUpDays)}/{c.followUpDays} दिन</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  c.followUpStatus === "red"
                                    ? "bg-red-500"
                                    : c.followUpStatus === "yellow"
                                    ? "bg-yellow-400"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(100, (c.daysSince / c.followUpDays) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
