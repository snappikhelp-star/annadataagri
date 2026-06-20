// AUTO-BILINGUAL UPDATE: Hardcoded Hindi UI labels converted to English where possible.
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, IndianRupee, Users, CheckCircle, X,
  Phone, MapPin, Clock, AlertTriangle, TrendingDown,
  MessageSquare, Filter, ChevronDown, Wallet
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  total_udhaar: number;
  total_purchase: number;
  updated_at: string;
  created_at: string;
}

type AgeBucket = "all" | "fresh" | "medium" | "overdue";

function daysSince(dateStr: string) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function getBucket(c: Customer): AgeBucket {
  const days = daysSince(c.updated_at || c.created_at);
  if (days <= 30) return "fresh";
  if (days <= 60) return "medium";
  return "overdue";
}

export default function AdminUdhaar() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<AgeBucket>("all");
  const [villageFilter, setVillageFilter] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .gt("total_udhaar", 0)
      .order("total_udhaar", { ascending: false });
    if (error) console.error(error);
    setCustomers(data || []);
    setLoading(false);
  }

  const villages = useMemo(() => {
    const vs = [...new Set(customers.map(c => c.village).filter(Boolean))].sort();
    return vs as string[];
  }, [customers]);

  const filtered = useMemo(() => {
    let r = [...customers];
    if (bucket !== "all") r = r.filter(c => getBucket(c) === bucket);
    if (villageFilter !== "all") r = r.filter(c => c.village === villageFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        (c.mobile || "").includes(q) ||
        (c.village || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [customers, bucket, villageFilter, search]);

  const totals = useMemo(() => ({
    total: customers.reduce((s, c) => s + Number(c.total_udhaar || 0), 0),
    count: customers.length,
    fresh: customers.filter(c => getBucket(c) === "fresh").length,
    medium: customers.filter(c => getBucket(c) === "medium").length,
    overdue: customers.filter(c => getBucket(c) === "overdue").length,
  }), [customers]);

  async function handleMarkPaid() {
    if (!selected || !payAmount || Number(payAmount) <= 0) return;
    setSaving(true);
    const amt = Number(payAmount);
    const newUdhaar = Math.max(0, Number(selected.total_udhaar) - amt);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("payments").insert([{
        customer_id: selected.id,
        amount: amt,
        notes: payNotes || `₹${amt} Credit Collection — ${selected.name}`,
        created_by: user?.email || "admin",
      }]),
      supabase.from("customers").update({
        total_udhaar: newUdhaar,
        updated_at: new Date().toISOString(),
      }).eq("id", selected.id),
    ]);
    setSaving(false);
    if (e1 || e2) { setToast("❌ कुछ गड़बड़ हुई, फिर कोशिश करें"); return; }
    setToast(`✅ ₹${amt.toLocaleString("en-IN")} Received — ${selected.name}`);
    setSelected(null);
    setPayAmount("");
    setPayNotes("");
    fetchData();
  }

  function sendWhatsApp(c: Customer) {
    const days = daysSince(c.updated_at || c.created_at);
    const msg =
      `नमस्ते *${c.name}* जी 🙏\n\n` +
      `*अन्नदाता एग्री & सीड्स*\n` +
      `सलामतपुर, रायtoन रोड | 📞 6261737388\n\n` +
      `आपका Credit बकाया है:\n` +
      `💰 *₹${Number(c.total_udhaar).toLocaleString("en-IN")}*\n` +
      `📅 ${days} दिन to बकाया\n\n` +
      `कृपया जल्द Payment करें।\n\n` +
      `_धन्यवाद — केशव मीणा 🌾_`;
    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const bucketConfig = {
    all: { label: "All", color: "bg-gray-100 text-gray-700 border-gray-200", count: totals.count },
    fresh: { label: "0–30 दिन", color: "bg-green-50 text-green-700 border-green-200", count: totals.fresh },
    medium: { label: "31–60 दिन", color: "bg-yellow-50 text-yellow-700 border-yellow-200", count: totals.medium },
    overdue: { label: "60+ दिन ⚠️", color: "bg-red-50 text-red-700 border-red-200", count: totals.overdue },
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-xl rounded-xl px-4 py-3 font-hindi text-sm font-bold text-gray-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-hindi">Credit Collection</h2>
          <p className="text-gray-500 text-xs font-hindi mt-0.5">बकाया Amount ट्रैक करें और वसूल करें</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-5 h-5 opacity-80" />
            <span className="text-orange-100 text-sm font-hindi">Total Due Credit</span>
          </div>
          <p className="text-3xl font-black">₹{totals.total.toLocaleString("en-IN")}</p>
          <p className="text-orange-200 text-xs mt-1 font-hindi">{totals.count} ग्राहकों to वसूलना है</p>
        </div>

        <div className="bg-white border border-yellow-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 text-xs font-hindi font-bold">31–60 दिन</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{totals.medium}</p>
          <p className="text-gray-500 text-xs font-hindi">जल्द संपर्क करें</p>
        </div>

        <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-xs font-hindi font-bold">60+ दिन</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{totals.overdue}</p>
          <p className="text-gray-500 text-xs font-hindi">अत्यावश्यक</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="नाम, Mobile Number या Village खोजें..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {(Object.keys(bucketConfig) as AgeBucket[]).map(k => (
            <button
              key={k}
              onClick={() => setBucket(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-hindi font-bold border transition-all ${
                bucket === k
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : bucketConfig[k].color + " hover:opacity-80"
              }`}
            >
              {bucketConfig[k].label} ({bucketConfig[k].count})
            </button>
          ))}

          {villages.length > 0 && (
            <div className="relative ml-auto">
              <select
                value={villageFilter}
                onChange={e => setVillageFilter(e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-hindi focus:outline-none focus:border-green-500 bg-white"
              >
                <option value="all">All Villages</option>
                {villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-hindi">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-hindi">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">कोई बकाया Credit नहीं मिला</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const days = daysSince(c.updated_at || c.created_at);
            const bkt = getBucket(c);
            const urgency =
              bkt === "overdue" ? "border-red-200 bg-red-50/30" :
              bkt === "medium" ? "border-yellow-200 bg-yellow-50/20" :
              "border-gray-200 bg-white";
            const ageColor =
              bkt === "overdue" ? "text-red-600 bg-red-50" :
              bkt === "medium" ? "text-yellow-700 bg-yellow-50" :
              "text-green-700 bg-green-50";

            return (
              <div key={c.id} className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${urgency}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                      {c.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 font-hindi text-sm">{c.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ageColor}`}>
                          {days} दिन
                        </span>
                        {bkt === "overdue" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> अत्यावश्यक
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {c.mobile && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{c.mobile}
                          </span>
                        )}
                        {c.village && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{c.village}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-orange-600">
                      ₹{Number(c.total_udhaar).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-gray-400 font-hindi">बकाया</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setSelected(c); setPayAmount(""); setPayNotes(""); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 text-xs font-hindi font-bold transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Payment मिला
                  </button>
                  {c.mobile && (
                    <button
                      onClick={() => sendWhatsApp(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl py-2 text-xs font-hindi font-bold transition-colors shadow-sm"
                    >
                      <FaWhatsapp className="w-4 h-4" /> WhatsApp याद दिलाएं
                    </button>
                  )}
                  {c.mobile && (
                    <a
                      href={`tel:${c.mobile}`}
                      className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-3 py-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b bg-orange-50 rounded-t-3xl">
              <div>
                <h3 className="font-bold text-gray-800 font-hindi text-lg">{selected.name}</h3>
                <p className="text-gray-500 text-sm font-hindi">{selected.village} • {selected.mobile}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Current Balance */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                <p className="text-4xl font-black text-orange-600">
                  ₹{Number(selected.total_udhaar).toLocaleString("en-IN")}
                </p>
                <p className="text-gray-500 font-hindi text-sm mt-1">बकाया Credit</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">
                  Received Amount (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={Number(selected.total_udhaar)}
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="₹ Amount दर्ज करें"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-center focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={() => setPayAmount(Number(selected.total_udhaar))}
                    className="bg-green-50 border-2 border-green-200 text-green-700 px-4 rounded-xl text-sm font-hindi font-bold hover:bg-green-100 transition-colors"
                  >
                    पूरा
                  </button>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 2000, 5000].filter(a => a < Number(selected.total_udhaar)).map(a => (
                  <button
                    key={a}
                    onClick={() => setPayAmount(a)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                  >
                    ₹{a.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {/* New balance preview */}
              {payAmount !== "" && Number(payAmount) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-green-700 font-hindi text-sm font-bold">Payment के बाद बकाया:</span>
                  <span className="text-green-800 font-black text-lg">
                    ₹{Math.max(0, Number(selected.total_udhaar) - Number(payAmount)).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Notes */}
              <input
                value={payNotes}
                onChange={e => setPayNotes(e.target.value)}
                placeholder="Notes (optional)..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-hindi font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel करें
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={saving || !payAmount || Number(payAmount) <= 0}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-hindi font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {saving ? "Saving..." : "Payment दर्ज करें"}
                </button>
              </div>

              {/* WhatsApp Reminder in modal */}
              {selected.mobile && (
                <button
                  onClick={() => sendWhatsApp(selected)}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl py-2.5 font-hindi font-bold text-sm transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4" /> WhatsApp पर याद दिलाएं
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
