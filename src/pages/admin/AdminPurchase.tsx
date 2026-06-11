import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, CheckCircle, History, Upload, X } from "lucide-react";

interface PurchaseItem {
  product_id: string; product_name: string;
  quantity: number; unit: string; purchase_price: number; total: number;
}

function makePBNum() {
  const d = new Date();
  return `PB-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000)+1000}`;
}

export default function AdminPurchase() {
  const { t } = useLang();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"new"|"history">("new");
  const [products, setProducts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [billPhoto, setBillPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selQty, setSelQty] = useState(1);
  const [selPrice, setSelPrice] = useState(0);

  useEffect(() => {
    supabase.from("products").select("id,name,unit,purchase_price").eq("is_active", true).order("name")
      .then(({ data }) => setProducts(data || []));
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  async function fetchHistory() {
    setHistLoading(true);
    const { data } = await supabase.from("purchase_bills")
      .select("*, purchase_bill_items(*)")
      .order("created_at", { ascending: false }).limit(50);
    setHistory(data || []);
    setHistLoading(false);
  }

  async function uploadBillPhoto(file: File) {
    setUploading(true);
    const path = `purchase-${Date.now()}.${file.name.split(".").pop()}`;
    const { data, error } = await supabase.storage.from("purchase-bills").upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: url } = supabase.storage.from("purchase-bills").getPublicUrl(data.path);
      setBillPhoto(url.publicUrl);
    }
    setUploading(false);
  }

  function addItem() {
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod || selQty <= 0 || selPrice <= 0) return;
    setItems(prev => [...prev, {
      product_id: prod.id, product_name: prod.name, unit: prod.unit,
      quantity: selQty, purchase_price: selPrice, total: selQty * selPrice
    }]);
    setSelectedProduct(""); setSelQty(1); setSelPrice(0);
  }

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  async function savePurchase() {
    if (!supplierName.trim()) { setError(t("enterSupplier")); return; }
    if (items.length === 0) { setError(t("addAtLeastOne")); return; }
    setSaving(true); setError("");

    try {
      const pbNum = makePBNum();
      const { data: pb, error: pbErr } = await supabase.from("purchase_bills").insert([{
        bill_number: pbNum, supplier_name: supplierName,
        supplier_mobile: supplierMobile || null, purchase_date: purchaseDate,
        total_amount: totalAmount, bill_photo_url: billPhoto,
        created_by: user?.email || "admin"
      }]).select().single();
      if (pbErr) throw pbErr;

      await supabase.from("purchase_bill_items").insert(items.map(i => ({
        purchase_bill_id: pb.id, product_id: i.product_id, product_name: i.product_name,
        quantity: i.quantity, unit: i.unit, purchase_price: i.purchase_price, total: i.total
      })));

      await Promise.all(items.map(async i => {
        const { data: prod } = await supabase.from("products").select("current_stock").eq("id", i.product_id).single();
        if (prod) {
          const newStock = Number(prod.current_stock) + i.quantity;
          await supabase.from("products").update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq("id", i.product_id);
          await supabase.from("stock_movements").insert([{
            product_id: i.product_id, movement_type: "in",
            quantity: i.quantity, previous_stock: prod.current_stock,
            new_stock: newStock, notes: `खरीदारी ${pbNum}`, created_by: user?.email || "admin"
          }]);
        }
      }));

      setSaved(true);
      setSupplierName(""); setSupplierMobile(""); setBillPhoto(null); setItems([]);
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => setSaved(false), 4000);
    } catch (e: any) {
      setError(e.message || t("errorMsg"));
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("purchaseTitle")} 🧾</h1>

      <div className="flex gap-2">
        {(["new","history"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-hindi font-bold text-sm transition-all ${activeTab === tab ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {tab === "new" ? <><Plus className="w-4 h-4" /> नई खरीदारी</> : <><History className="w-4 h-4" /> {t("purchaseHistory")}</>}
          </button>
        ))}
      </div>

      {activeTab === "new" && (
        <div className="space-y-4">
          {saved && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-800 font-hindi font-bold">{t("purchaseSaved")}</p>
                <p className="text-green-600 font-hindi text-sm">{t("stockAutoUpdated")} ✅</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">सप्लायर विवरण</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={supplierName} onChange={e => setSupplierName(e.target.value)}
                placeholder={`${t("supplierName")} *`}
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              <input value={supplierMobile} onChange={e => setSupplierMobile(e.target.value)}
                placeholder="मोबाइल" type="tel"
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              <input value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                type="date" className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>
            <div>
              <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">सप्लायर बिल फोटो (वैकल्पिक)</label>
              <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-green-200 rounded-xl px-4 py-3 hover:bg-green-50 transition-colors">
                <Upload className="w-5 h-5 text-green-500" />
                <span className="font-hindi text-green-700 text-sm">{uploading ? t("uploading") : "फोटो अपलोड करें"}</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) uploadBillPhoto(e.target.files[0]); }} />
                {billPhoto && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-hindi">✅ अपलोड हो गया</span>}
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi">प्रोडक्ट जोड़ें</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-2">
                <select value={selectedProduct} onChange={e => {
                  setSelectedProduct(e.target.value);
                  const p = products.find(x => x.id === e.target.value);
                  if (p) setSelPrice(Number(p.purchase_price));
                }} className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base">
                  <option value="">{t("selectProduct")}</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
              </div>
              <input type="number" min="0.1" step="0.1" value={selQty || ""} onChange={e => setSelQty(Number(e.target.value))}
                placeholder={t("quantity")}
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              <input type="number" min="0" value={selPrice || ""} onChange={e => setSelPrice(Number(e.target.value))}
                placeholder="खरीद दाम ₹"
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>
            <button onClick={addItem} disabled={!selectedProduct || selQty <= 0 || selPrice <= 0}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-hindi font-bold hover:bg-green-700 disabled:opacity-50 transition-colors">
              <Plus className="w-4 h-4" /> {t("addItem")}
            </button>

            {items.length > 0 && (
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-hindi font-bold text-gray-800 text-sm">{item.product_name}</p>
                        <p className="text-gray-400 text-xs font-hindi">{item.quantity} {item.unit} × ₹{item.purchase_price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-800">₹{item.total.toLocaleString("en-IN")}</p>
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3">
                  <span className="font-hindi font-bold text-green-800">{t("total")}</span>
                  <span className="text-2xl font-bold text-green-700">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-600 font-hindi text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={savePurchase} disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-hindi font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {saving ? "सेव हो रहा है..." : t("savePurchase")}
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {histLoading ? (
            <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : history.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center">
              <p className="text-gray-400 font-hindi text-lg">कोई खरीदारी रिकॉर्ड नहीं</p>
            </div>
          ) : history.map(pb => (
            <div key={pb.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-hindi font-bold text-gray-800">{pb.supplier_name}</p>
                  <p className="text-gray-400 text-xs font-hindi">{pb.bill_number} • {new Date(pb.purchase_date).toLocaleDateString("hi-IN")}</p>
                </div>
                <p className="text-xl font-bold text-green-700">₹{Number(pb.total_amount).toLocaleString("en-IN")}</p>
              </div>
              {pb.purchase_bill_items?.length > 0 && (
                <div className="space-y-1">
                  {pb.purchase_bill_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600 font-hindi">
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
  );
}
