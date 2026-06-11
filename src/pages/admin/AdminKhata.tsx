import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, Phone, MapPin, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";

export default function AdminKhata() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("all");
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    // Only show customers with udhaar
    let r = customers.filter(c => Number(c.total_udhaar) > 0);
    if (search) r = r.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || "").includes(search) ||
      (c.village || "").toLowerCase().includes(search.toLowerCase())
    );
    if (villageFilter !== "all") r = r.filter(c => c.village === villageFilter);
    r.sort((a, b) => Number(b.total_udhaar) - Number(a.total_udhaar));
    setFiltered(r);
  }, [customers, search, villageFilter]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) console.error("Customers fetch:", error);
    const custs = data || [];
    setCustomers(custs);
    const vs: string[] = [...new Set(custs.map((c: any) => c.village).filter(Boolean))].sort() as string[];
    setVillages(vs);
    setLoading(false);
  }

  async function openCustomer(c: any) {
    setSelected(c);
    setPayAmount(0);
    setPayNotes("");
    const [{ data: invs }, { data: pays }] = await Promise.all([
      supabase.from("invoices").select("*")
        .or(`customer_mobile.eq.${c.mobile},customer_name.eq.${c.name}`)
        .gt("udhaar_amount", 0)
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("*")
        .eq("customer_id", c.id)
        .order("created_at", { ascending: false })
    ]);
    setInvoices(invs || []);
    setPayments(pays || []);
  }

  async function addPayment() {
    if (!selected || payAmount <= 0) return;
    setSaving(true);
    const newUdhaar = Math.max(0, Number(selected.total_udhaar) - payAmount);

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("payments").insert([{
        customer_id: selected.id,
        amount: payAmount,
        notes: payNotes || `₹${payAmount} प्राप्त`,
        created_by: user?.email || "admin"
      }]),
      supabase.from("customers").update({
        total_udhaar: newUdhaar,
        updated_at: new Date().toISOString()
      }).eq("id", selected.id)
    ]);

    if (e1) console.error("Payment insert:", e1);
    if (e2) console.error("Customer update:", e2);

    setSaving(false);
    setSelected(null);
    setPayAmount(0);
    setPayNotes("");
    fetchData();
  }

  function waReminder(c: any) {
    const msg = `नमस्ते *${c.name}* जी 🙏\n\n*अन्नदाता एग्री & सीड्स*\nसलामतपुर, रायसेन | 📞 6261737388\n\nआपका उधार बकाया:\n💰 *₹${Number(c.total_udhaar).toLocaleString("en-IN")}*\n\nकृपया जल्दी जमा करें।\n\n_धन्यवाद — केशव भाई 🌾_`;
    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function exportUdhaar() {
    const udhaarList = customers.filter(c => Number(c.total_udhaar) > 0);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(udhaarList.map(c => ({
        नाम: c.name, मोबाइल: c.mobile, गांव: c.village,
        उधार_राशि: c.total_udhaar, कुल_खरीद: c.total_purchase
      }))), "Udhaar");
    XLSX.writeFile(wb, "annadata_udhaar.xlsx");
  }

  const totalUdhaar = customers.reduce((s, c) => s + Number(c.total_udhaar || 0), 0);
  const udhaarCount = customers.filter(c => Number(c.total_udhaar) > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">खाता / उधार</h2>
        <button onClick={exportUdhaar}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200">
          <Download className="w-4 h-4" /> एक्सपोर्ट
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-3xl font-bold">₹{totalUdhaar.toLocaleString("en-IN")}</p>
          <p className="text-orange-100 font-hindi mt-1 text-sm">कुल उधार बकाया</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-3xl font-bold">{udhaarCount}</p>
          <p className="text-red-100 font-hindi mt-1 text-sm">उधारदार ग्राहक</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="नाम, मोबाइल या गांव..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi" />
        </div>
        <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi">
          <option value="all">सभी गांव</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Payment Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-orange-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-800 font-hindi text-lg">{selected.name}</h3>
                <p className="text-gray-500 text-sm font-hindi">{selected.village} • {selected.mobile}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-orange-600">₹{Number(selected.total_udhaar).toLocaleString("en-IN")}</p>
                <p className="text-gray-500 font-hindi text-sm mt-1">बकाया उधार</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">भुगतान राशि (₹)</label>
                <div className="flex gap-2">
                  <input type="number" min="0" max={Number(selected.total_udhaar)}
                    value={payAmount || ""}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    placeholder="₹ राशि दर्ज करें"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-center focus:outline-none focus:border-green-500" />
                  <button onClick={() => setPayAmount(Number(selected.total_udhaar))}
                    className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-hindi font-bold hover:bg-green-100 border-2 border-green-200 transition-colors">
                    पूरा
                  </button>
                </div>
                {payAmount > 0 && (
                  <p className="text-sm text-gray-500 font-hindi mt-2 text-center">
                    बाकी बचेगा: <span className="font-bold text-gray-700">
                      ₹{Math.max(0, Number(selected.total_udhaar) - payAmount).toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
              </div>

              <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                placeholder="नोट (वैकल्पिक)..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />

              <div className="flex gap-2">
                <button onClick={addPayment} disabled={saving || payAmount <= 0}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-hindi font-bold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle className="w-5 h-5" />
                  {saving ? "..." : "भुगतान दर्ज करें"}
                </button>
                <button onClick={() => waReminder(selected)}
                  className="px-4 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity text-lg">
                  📱
                </button>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 font-hindi border-t pt-3 mb-2">भुगतान इतिहास</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {payments.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
                        <div>
                          <p className="font-hindi text-gray-600">{p.notes}</p>
                          <p className="text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString("hi-IN")}</p>
                        </div>
                        <p className="font-bold text-green-700">+₹{Number(p.amount).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Udhaar invoices */}
              {invoices.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 font-hindi border-t pt-3 mb-2">उधार बिल</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invoices.map((inv: any) => (
                      <div key={inv.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
                        <div>
                          <p className="font-hindi text-gray-800 font-medium">{inv.invoice_number}</p>
                          <p className="text-gray-400 text-xs">{new Date(inv.created_at).toLocaleDateString("hi-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">₹{Number(inv.udhaar_amount).toLocaleString("en-IN")}</p>
                          <p className="text-gray-400 text-xs font-hindi">बकाया</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <p className="text-green-700 font-hindi text-xl font-bold">✅ कोई उधार बकाया नहीं!</p>
          <p className="text-green-500 font-hindi text-sm mt-2">सभी ग्राहकों का हिसाब साफ है</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: any) => (
            <div key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
              onClick={() => openCustomer(c)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 font-hindi">{c.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {c.mobile && (
                      <span className="flex items-center gap-1 text-gray-500 text-xs font-hindi">
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
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-2xl font-bold text-orange-600">₹{Number(c.total_udhaar).toLocaleString("en-IN")}</p>
                  <p className="text-gray-400 text-xs font-hindi">बकाया</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <button onClick={() => openCustomer(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 py-2 rounded-xl text-xs font-hindi font-bold hover:bg-green-100 transition-colors border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5" /> भुगतान लें
                </button>
                <button onClick={() => waReminder(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/10 text-green-700 py-2 rounded-xl text-xs font-hindi font-bold hover:bg-green-100 transition-colors border border-green-100">
                  📱 WhatsApp रिमाइंडर
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
