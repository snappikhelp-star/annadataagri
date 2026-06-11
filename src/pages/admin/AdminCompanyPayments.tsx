import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2, Plus, CheckCircle, History, Upload, X, Trash2,
  CreditCard, BarChart3, Phone, MapPin, User, Copy, ChevronDown,
  ChevronUp, AlertCircle, IndianRupee
} from "lucide-react";

/* ─── types ─────────────────────────────────────────── */
interface Supplier { id: string; name: string; mobile?: string; address?: string; contact_person?: string; notes?: string; }
interface BillItem { product_id?: string; product_name: string; quantity: number; unit: string; rate: number; total: number; }
interface Bill {
  id: string; supplier_id?: string; supplier_name: string; bill_number?: string;
  bill_date: string; total_amount: number; paid_amount: number; remaining_amount: number;
  payment_status: "paid"|"partial"|"pending"; bill_image_url?: string; notes?: string;
  supplier_purchase_bill_items?: BillItem[];
}
interface Payment { id: string; supplier_id: string; purchase_bill_id?: string; amount: number; payment_mode: string; payment_date: string; notes?: string; }

type Tab = "suppliers"|"newbill"|"payments"|"reports";

const STATUS_COLORS = { paid: "bg-green-100 text-green-700", partial: "bg-yellow-100 text-yellow-800", pending: "bg-red-100 text-red-700" };
const STATUS_LABELS = { paid: "पेड ✅", partial: "आंशिक 🕐", pending: "बाकी ❗" };
const MODE_LABELS: Record<string,string> = { cash: "नकद 💵", upi: "UPI 📱", bank: "बैंक 🏦", cheque: "चेक 📝" };

function makeBillNo() {
  const d = new Date();
  return `SP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000)+1000}`;
}

/* ─── Supplier Card ─────────────────────────────────── */
function SupplierCard({ s, onDelete }: { s: Supplier; onDelete: (id:string)=>void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 font-hindi text-base">{s.name}</p>
        {s.contact_person && <p className="text-gray-500 text-xs font-hindi flex items-center gap-1 mt-0.5"><User className="w-3 h-3" />{s.contact_person}</p>}
        {s.mobile && <a href={`tel:${s.mobile}`} className="text-green-600 text-xs font-hindi flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{s.mobile}</a>}
        {s.address && <p className="text-gray-400 text-xs font-hindi flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.address}</p>}
        {s.notes && <p className="text-gray-400 text-xs italic mt-1 font-hindi">{s.notes}</p>}
      </div>
      <button onClick={() => onDelete(s.id)} className="text-red-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────── */
export default function AdminCompanyPayments() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("suppliers");

  /* suppliers */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supLoading, setSupLoading] = useState(true);
  const [showAddSup, setShowAddSup] = useState(false);
  const [supForm, setSupForm] = useState({ name:"", mobile:"", address:"", contact_person:"", notes:"" });
  const [supSaving, setSupSaving] = useState(false);

  /* new bill */
  const [products, setProducts] = useState<any[]>([]);
  const [billSupplierId, setBillSupplierId] = useState("");
  const [billNumber, setBillNumber] = useState(makeBillNo());
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [billPaid, setBillPaid] = useState<number>(0);
  const [billPhoto, setBillPhoto] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const [billNotes, setBillNotes] = useState("");
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selProduct, setSelProduct] = useState("");
  const [selQty, setSelQty] = useState<number>(1);
  const [selRate, setSelRate] = useState<number>(0);
  const [billSaving, setBillSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [billError, setBillError] = useState("");

  /* payments tab */
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [payBillId, setPayBillId] = useState("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState("cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [paySaved, setPaySaved] = useState(false);
  const [payError, setPayError] = useState("");
  const [expandedBill, setExpandedBill] = useState<string|null>(null);

  /* reports */
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string|null>(null);

  /* ── fetch ── */
  useEffect(() => { fetchSuppliers(); fetchProducts(); }, []);
  useEffect(() => { if (tab === "payments") fetchBills(); }, [tab]);
  useEffect(() => { if (tab === "reports") buildReport(); }, [tab]);

  async function fetchSuppliers() {
    setSupLoading(true);
    const { data } = await supabase.from("suppliers").select("*").eq("is_active", true).order("name");
    setSuppliers(data || []);
    setSupLoading(false);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("id,name,unit,purchase_price").eq("is_active", true).order("name");
    setProducts(data || []);
  }

  async function fetchBills() {
    setBillsLoading(true);
    const { data } = await supabase.from("supplier_purchase_bills")
      .select("*, supplier_purchase_bill_items(*)")
      .order("created_at", { ascending: false }).limit(50);
    setBills(data || []);
    setBillsLoading(false);
  }

  async function buildReport() {
    setReportLoading(true);
    const { data: sups } = await supabase.from("suppliers").select("*").eq("is_active", true);
    const { data: bls } = await supabase.from("supplier_purchase_bills").select("supplier_id, total_amount, paid_amount, remaining_amount, bill_date, payment_status");
    const { data: pays } = await supabase.from("supplier_payments").select("supplier_id, amount, payment_date").order("payment_date", { ascending: false });

    const rows = (sups || []).map((s: Supplier) => {
      const sb = (bls || []).filter((b: any) => b.supplier_id === s.id);
      const sp = (pays || []).filter((p: any) => p.supplier_id === s.id);
      const lastPay = sp[0];
      return {
        ...s,
        totalPurchase: sb.reduce((a: number, b: any) => a + Number(b.total_amount || 0), 0),
        totalPaid:     sb.reduce((a: number, b: any) => a + Number(b.paid_amount || 0), 0),
        remaining:     sb.reduce((a: number, b: any) => a + Number(b.remaining_amount || 0), 0),
        lastPayDate:   lastPay ? lastPay.payment_date : null,
        hasPending:    sb.some((b: any) => b.payment_status !== "paid"),
      };
    });
    setReportData(rows);
    setReportLoading(false);
  }

  /* ── suppliers CRUD ── */
  async function addSupplier() {
    if (!supForm.name.trim()) return;
    setSupSaving(true);
    await supabase.from("suppliers").insert([{ ...supForm }]);
    setSupForm({ name:"", mobile:"", address:"", contact_person:"", notes:"" });
    setShowAddSup(false);
    setSupSaving(false);
    fetchSuppliers();
  }

  async function deleteSupplier(id: string) {
    if (!confirm("इस सप्लायर को हटाएं?")) return;
    await supabase.from("suppliers").update({ is_active: false }).eq("id", id);
    fetchSuppliers();
  }

  /* ── bill items ── */
  function addBillItem() {
    const prod = products.find(p => p.id === selProduct);
    if (!selProduct || selQty <= 0 || selRate <= 0) return;
    setBillItems(prev => [...prev, {
      product_id: prod?.id, product_name: prod?.name || "",
      quantity: selQty, unit: prod?.unit || "kg", rate: selRate, total: selQty * selRate
    }]);
    setSelProduct(""); setSelQty(1); setSelRate(0);
  }

  const billTotal = billItems.reduce((s, i) => s + i.total, 0);

  async function uploadPhoto(file: File) {
    setUploading(true);
    const path = `supplier-bill-${Date.now()}.${file.name.split(".").pop()}`;
    const { data, error } = await supabase.storage.from("purchase-bills").upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: url } = supabase.storage.from("purchase-bills").getPublicUrl(data.path);
      setBillPhoto(url.publicUrl);
    }
    setUploading(false);
  }

  async function saveBill() {
    if (!billSupplierId) { setBillError("सप्लायर/कंपनी चुनें"); return; }
    if (billItems.length === 0) { setBillError("कम से कम एक आइटम जोड़ें"); return; }
    setBillSaving(true); setBillError("");
    try {
      const sup = suppliers.find(s => s.id === billSupplierId);
      const paidAmt = Math.min(billPaid, billTotal);
      const status: "paid"|"partial"|"pending" = paidAmt >= billTotal ? "paid" : paidAmt > 0 ? "partial" : "pending";

      const { data: bill, error: bErr } = await supabase.from("supplier_purchase_bills").insert([{
        supplier_id: billSupplierId, supplier_name: sup?.name || "",
        bill_number: billNumber, bill_date: billDate,
        total_amount: billTotal, paid_amount: paidAmt,
        payment_status: status, bill_image_url: billPhoto,
        notes: billNotes || null, created_by: user?.email || "admin"
      }]).select().single();
      if (bErr) throw bErr;

      if (billItems.length > 0) {
        await supabase.from("supplier_purchase_bill_items").insert(
          billItems.map(i => ({ purchase_bill_id: bill.id, ...i }))
        );
      }

      // auto-update stock
      await Promise.all(billItems.filter(i => i.product_id).map(async i => {
        const { data: prod } = await supabase.from("products").select("current_stock").eq("id", i.product_id!).single();
        if (prod) {
          const newStock = Number(prod.current_stock) + i.quantity;
          await supabase.from("products").update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq("id", i.product_id!);
          await supabase.from("stock_movements").insert([{
            product_id: i.product_id, movement_type: "in",
            quantity: i.quantity, previous_stock: prod.current_stock,
            new_stock: newStock, notes: `कंपनी खरीद ${billNumber}`, created_by: user?.email || "admin"
          }]);
        }
      }));

      setBillSaved(true);
      setBillItems([]); setBillSupplierId(""); setBillPaid(0); setBillPhoto(null); setBillNotes("");
      setBillNumber(makeBillNo()); setBillDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => setBillSaved(false), 4000);
    } catch(e: any) { setBillError(e.message || "Error"); }
    finally { setBillSaving(false); }
  }

  /* ── payment recording ── */
  async function savePayment() {
    if (!payBillId) { setPayError("बिल चुनें"); return; }
    if (!payAmount || payAmount <= 0) { setPayError("राशि डालें"); return; }
    setPaySaving(true); setPayError("");
    try {
      const bill = bills.find(b => b.id === payBillId);
      await supabase.from("supplier_payments").insert([{
        supplier_id: bill?.supplier_id, purchase_bill_id: payBillId,
        amount: payAmount, payment_mode: payMode, payment_date: payDate,
        notes: payNotes || null, created_by: user?.email || "admin"
      }]);

      // update bill paid_amount
      const newPaid = Math.min(Number(bill?.paid_amount || 0) + payAmount, Number(bill?.total_amount || 0));
      const newStatus: "paid"|"partial"|"pending" = newPaid >= Number(bill?.total_amount || 0) ? "paid" : newPaid > 0 ? "partial" : "pending";
      await supabase.from("supplier_purchase_bills").update({ paid_amount: newPaid, payment_status: newStatus }).eq("id", payBillId);

      setPaySaved(true); setPayAmount(0); setPayNotes(""); setPayBillId("");
      setTimeout(() => setPaySaved(false), 3000);
      fetchBills();
    } catch(e: any) { setPayError(e.message || "Error"); }
    finally { setPaySaving(false); }
  }

  /* ── WhatsApp message ── */
  function copyWAMessage(sup: any) {
    const today = new Date().toLocaleDateString("hi-IN", { day:"numeric", month:"long", year:"numeric" });
    const msg = `नमस्ते ${sup.name},\n\nAnnadata Agri & Seeds की तरफ से ₹${sup.remaining.toLocaleString("en-IN")} payment बाकी है।\nकृपया confirm करें।\n\n— Keshav Bhai, Annadata Agri & Seeds\n📞 6261737388`;
    navigator.clipboard.writeText(msg).then(() => { setCopiedId(sup.id); setTimeout(() => setCopiedId(null), 2500); });
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"suppliers", label:"कंपनियाँ", icon:<Building2 className="w-4 h-4" /> },
    { id:"newbill",   label:"नई खरीद",  icon:<Plus className="w-4 h-4" /> },
    { id:"payments",  label:"Payment",  icon:<CreditCard className="w-4 h-4" /> },
    { id:"reports",   label:"रिपोर्ट",  icon:<BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-hindi flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-600" /> Company को देना है 💼
        </h1>
        <p className="text-gray-400 text-sm font-hindi mt-1">सप्लायर और कंपनी का हिसाब-किताब</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-hindi font-bold text-sm transition-all ${tab === t.id ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SUPPLIERS ──────────────────────────────── */}
      {tab === "suppliers" && (
        <div className="space-y-3">
          <button onClick={() => setShowAddSup(!showAddSup)}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl font-hindi font-bold hover:bg-purple-700 transition-colors shadow-md">
            <Plus className="w-4 h-4" /> नई कंपनी / सप्लायर जोड़ें
          </button>

          {showAddSup && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-purple-800 font-hindi">नई कंपनी का विवरण</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key:"name", placeholder:"कंपनी / सप्लायर का नाम *", type:"text" },
                  { key:"mobile", placeholder:"मोबाइल नंबर", type:"tel" },
                  { key:"contact_person", placeholder:"Contact Person (व्यक्ति का नाम)", type:"text" },
                  { key:"address", placeholder:"पता / शहर", type:"text" },
                ].map(f => (
                  <input key={f.key} type={f.type}
                    value={(supForm as any)[f.key]}
                    onChange={e => setSupForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-sm" />
                ))}
                <textarea value={supForm.notes} onChange={e => setSupForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Notes (वैकल्पिक)" rows={2}
                  className="border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-sm sm:col-span-2 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={addSupplier} disabled={!supForm.name.trim() || supSaving}
                  className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-hindi font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {supSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  सेव करें
                </button>
                <button onClick={() => setShowAddSup(false)} className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-hindi font-bold hover:bg-gray-300 transition-colors">रद्द</button>
              </div>
            </div>
          )}

          {supLoading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : suppliers.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center"><p className="text-gray-400 font-hindi text-lg">कोई कंपनी नहीं जोड़ी गई</p></div>
          ) : (
            <div className="space-y-3">
              {suppliers.map(s => <SupplierCard key={s.id} s={s} onDelete={deleteSupplier} />)}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: NEW BILL ──────────────────────────────── */}
      {tab === "newbill" && (
        <div className="space-y-4">
          {billSaved && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-800 font-hindi font-bold">खरीदारी सेव हो गई ✅</p>
                <p className="text-green-600 text-sm font-hindi">स्टॉक ऑटो-अपडेट हो गया ✅</p>
              </div>
            </div>
          )}

          {/* Supplier + Bill info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">कंपनी / सप्लायर चुनें</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={billSupplierId} onChange={e => setBillSupplierId(e.target.value)}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base col-span-1 sm:col-span-2">
                <option value="">-- कंपनी / सप्लायर चुनें *</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}{s.mobile ? ` (${s.mobile})` : ""}</option>)}
              </select>
              <input value={billNumber} onChange={e => setBillNumber(e.target.value)} placeholder="बिल नंबर"
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>

            {/* Bill photo */}
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-purple-200 rounded-xl px-4 py-3 hover:bg-purple-50 transition-colors">
              <Upload className="w-5 h-5 text-purple-500" />
              <span className="font-hindi text-purple-700 text-sm">{uploading ? "अपलोड हो रहा है..." : "बिल फोटो अपलोड करें (वैकल्पिक)"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]); }} />
              {billPhoto && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-hindi">✅ अपलोड हो गया</span>}
            </label>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">प्रोडक्ट जोड़ें</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2">
                <select value={selProduct} onChange={e => { setSelProduct(e.target.value); const p = products.find(x => x.id === e.target.value); if (p) setSelRate(Number(p.purchase_price) || 0); }}
                  className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base">
                  <option value="">प्रोडक्ट चुनें</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
              </div>
              <input type="number" min="0.1" step="0.1" value={selQty || ""} onChange={e => setSelQty(Number(e.target.value))} placeholder="मात्रा"
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              <input type="number" min="0" value={selRate || ""} onChange={e => setSelRate(Number(e.target.value))} placeholder="दाम ₹"
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>
            <button onClick={addBillItem} disabled={!selProduct || selQty <= 0 || selRate <= 0}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl font-hindi font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors">
              <Plus className="w-4 h-4" /> आइटम जोड़ें
            </button>

            {billItems.length > 0 && (
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                  {billItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-hindi font-bold text-gray-800 text-sm">{item.product_name}</p>
                        <p className="text-gray-400 text-xs font-hindi">{item.quantity} {item.unit} × ₹{item.rate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-800">₹{item.total.toLocaleString("en-IN")}</p>
                        <button onClick={() => setBillItems(p => p.filter((_,i) => i !== idx))} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="font-hindi font-bold text-purple-800">कुल बिल राशि</span>
                  <span className="text-2xl font-bold text-purple-700">₹{billTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">Payment विवरण</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 font-hindi mb-1.5">अभी पेड राशि (₹)</label>
                <input type="number" min="0" value={billPaid || ""} onChange={e => setBillPaid(Number(e.target.value))} placeholder="0"
                  className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                  <p className="text-xs text-red-600 font-hindi">बाकी राशि</p>
                  <p className="text-xl font-black text-red-600">₹{Math.max(0, billTotal - billPaid).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
            <textarea value={billNotes} onChange={e => setBillNotes(e.target.value)} placeholder="नोट (वैकल्पिक)" rows={2}
              className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-sm resize-none" />
          </div>

          {billError && <p className="text-red-600 font-hindi text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{billError}</p>}

          <button onClick={saveBill} disabled={billSaving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-hindi font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60">
            {billSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {billSaving ? "सेव हो रहा है..." : "खरीदारी सेव करें"}
          </button>
        </div>
      )}

      {/* ── TAB: PAYMENTS ──────────────────────────────── */}
      {tab === "payments" && (
        <div className="space-y-4">
          {paySaved && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" /><p className="text-green-800 font-hindi font-bold">Payment दर्ज हो गई ✅</p>
            </div>
          )}

          {/* Add payment form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">नई Payment दर्ज करें</h3>
            <div className="space-y-3">
              <select value={payBillId} onChange={e => { setPayBillId(e.target.value); const b = bills.find(x => x.id === e.target.value); if (b) setPayAmount(Number(b.remaining_amount) || 0); }}
                className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base">
                <option value="">-- बिल चुनें (बाकी payment के लिए)</option>
                {bills.filter(b => b.payment_status !== "paid").map(b => (
                  <option key={b.id} value={b.id}>{b.supplier_name} — {b.bill_number} — बाकी ₹{Number(b.remaining_amount).toLocaleString("en-IN")}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input type="number" min="1" value={payAmount || ""} onChange={e => setPayAmount(Number(e.target.value))} placeholder="Payment राशि ₹"
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
                <select value={payMode} onChange={e => setPayMode(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base">
                  {Object.entries(MODE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-base col-span-2 sm:col-span-1" />
              </div>
              <input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="नोट (वैकल्पिक)"
                className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 font-hindi outline-none text-sm" />
            </div>
            {payError && <p className="text-red-600 font-hindi text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{payError}</p>}
            <button onClick={savePayment} disabled={paySaving}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-hindi font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors">
              {paySaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              Payment दर्ज करें
            </button>
          </div>

          {/* Bill list */}
          <h3 className="font-bold text-gray-700 font-hindi text-base mt-2">सभी बिल</h3>
          {billsLoading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : bills.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center"><p className="text-gray-400 font-hindi">कोई बिल नहीं</p></div>
          ) : (
            <div className="space-y-3">
              {bills.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedBill(expandedBill === b.id ? null : b.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 font-hindi">{b.supplier_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-hindi font-bold ${STATUS_COLORS[b.payment_status]}`}>
                          {STATUS_LABELS[b.payment_status]}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-hindi mt-0.5">{b.bill_number} • {new Date(b.bill_date).toLocaleDateString("hi-IN")}</p>
                      <div className="flex gap-4 mt-2">
                        <div><p className="text-[10px] text-gray-400 font-hindi">कुल</p><p className="font-bold text-gray-700 text-sm">₹{Number(b.total_amount).toLocaleString("en-IN")}</p></div>
                        <div><p className="text-[10px] text-gray-400 font-hindi">पेड</p><p className="font-bold text-green-600 text-sm">₹{Number(b.paid_amount).toLocaleString("en-IN")}</p></div>
                        <div><p className="text-[10px] text-gray-400 font-hindi">बाकी</p><p className="font-bold text-red-600 text-sm">₹{Number(b.remaining_amount).toLocaleString("en-IN")}</p></div>
                      </div>
                    </div>
                    {expandedBill === b.id ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />}
                  </div>
                  {expandedBill === b.id && b.supplier_purchase_bill_items && b.supplier_purchase_bill_items.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-1">
                      {b.supplier_purchase_bill_items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 font-hindi">
                          <span>{item.product_name} ({item.quantity} {item.unit})</span>
                          <span>₹{Number(item.total).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: REPORTS ──────────────────────────────── */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
              <IndianRupee className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-black">₹{reportData.reduce((s,r) => s + r.remaining, 0).toLocaleString("en-IN")}</p>
              <p className="text-white/80 text-xs font-hindi mt-1">कुल बकाया (सभी कंपनियाँ)</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
              <Building2 className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-black">{reportData.filter(r => r.hasPending).length}</p>
              <p className="text-white/80 text-xs font-hindi mt-1">कंपनियाँ जिन्हें देना है</p>
            </div>
          </div>

          {reportLoading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : reportData.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center"><p className="text-gray-400 font-hindi">कोई डेटा नहीं</p></div>
          ) : (
            <div className="space-y-3">
              {reportData.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 font-hindi">{r.name}</p>
                        {r.mobile && <a href={`tel:${r.mobile}`} className="text-green-600 text-xs font-hindi">{r.mobile}</a>}
                      </div>
                    </div>
                    {r.remaining > 0 && (
                      <button onClick={() => copyWAMessage(r)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${copiedId === r.id ? "bg-green-100 text-green-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                        {copiedId === r.id ? <><CheckCircle className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />WhatsApp</>}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label:"कुल खरीद", val:`₹${r.totalPurchase.toLocaleString("en-IN")}`, color:"text-gray-700" },
                      { label:"कुल पेड",   val:`₹${r.totalPaid.toLocaleString("en-IN")}`,    color:"text-green-600" },
                      { label:"बाकी",      val:`₹${r.remaining.toLocaleString("en-IN")}`,    color: r.remaining > 0 ? "text-red-600 font-black" : "text-gray-400" },
                    ].map(c => (
                      <div key={c.label} className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                        <p className="text-[10px] text-gray-400 font-hindi">{c.label}</p>
                        <p className={`font-bold text-sm ${c.color}`}>{c.val}</p>
                      </div>
                    ))}
                  </div>
                  {r.lastPayDate && (
                    <p className="text-xs text-gray-400 font-hindi mt-2">आखिरी payment: {new Date(r.lastPayDate).toLocaleDateString("hi-IN")}</p>
                  )}
                  {r.remaining <= 0 && r.totalPurchase > 0 && (
                    <div className="mt-2 bg-green-50 rounded-xl px-3 py-1.5 text-xs text-green-700 font-hindi font-bold text-center">✅ पूरा पेड हो गया</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
