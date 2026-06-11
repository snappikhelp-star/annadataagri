import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Minus, AlertTriangle, RefreshCw, Search, X, Check } from "lucide-react";

export default function AdminQuickStock() {
  const { t } = useLang();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [movType, setMovType] = useState<"in"|"out">("in");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string|null>(null);
  const [filter, setFilter] = useState<"all"|"low">("all");

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").eq("is_active", true).order("name");
    setProducts(data || []);
    setLoading(false);
  }

  const filtered = (products.filter(p => filter === "low" ? p.current_stock <= p.low_stock_limit : true))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aLow = a.current_stock <= a.low_stock_limit;
      const bLow = b.current_stock <= b.low_stock_limit;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;
      return 0;
    });

  const lowCount = products.filter(p => p.current_stock <= p.low_stock_limit).length;

  async function doMovement() {
    if (!selected || qty <= 0) return;
    setSaving(true);
    const prev = Number(selected.current_stock);
    const newStock = movType === "in" ? prev + qty : Math.max(0, prev - qty);

    await Promise.all([
      supabase.from("products").update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq("id", selected.id),
      supabase.from("stock_movements").insert([{
        product_id: selected.id, movement_type: movType,
        quantity: qty, previous_stock: prev, new_stock: newStock,
        notes: movType === "in" ? `${t("stockIn")} — Quick` : `${t("stockOut")} — Quick`,
        created_by: user?.email || "admin"
      }])
    ]);

    setProducts(prev => prev.map(p => p.id === selected.id ? { ...p, current_stock: newStock } : p));
    setFlash(movType === "in" ? `✅ +${qty} ${selected.unit} ${t("stockAdded")}` : `✅ -${qty} ${selected.unit} ${t("stockReduced")}`);
    setTimeout(() => setFlash(null), 3000);
    setSelected(null);
    setQty(1);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("quickStockTitle")} 📦</h1>
        <button onClick={fetchProducts} className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {flash && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl px-4 py-3 text-green-800 font-hindi font-bold text-center text-lg">
          {flash}
        </div>
      )}

      {lowCount > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="font-hindi text-red-700 font-bold">{lowCount} प्रोडक्ट का स्टॉक कम है!</p>
          <button onClick={() => setFilter(f => f === "low" ? "all" : "low")}
            className={`ml-auto text-xs px-3 py-1 rounded-lg font-hindi font-bold transition-colors ${filter === "low" ? "bg-red-500 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
            {filter === "low" ? "सब देखें" : "सिर्फ कम स्टॉक"}
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="प्रोडक्ट खोजें..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl outline-none font-hindi text-base" />
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-hindi font-bold text-gray-800 text-lg leading-tight">{selected.name}</p>
                <p className="text-gray-400 text-sm font-hindi">वर्तमान स्टॉक: <strong className="text-gray-700">{selected.current_stock} {selected.unit}</strong></p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMovType("in")}
                className={`py-4 rounded-xl font-hindi font-bold text-base transition-all ${movType === "in" ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-green-50"}`}>
                <Plus className="w-5 h-5 mx-auto mb-1" /> {t("stockIn")}
              </button>
              <button onClick={() => setMovType("out")}
                className={`py-4 rounded-xl font-hindi font-bold text-base transition-all ${movType === "out" ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-red-50"}`}>
                <Minus className="w-5 h-5 mx-auto mb-1" /> {t("stockOut")}
              </button>
            </div>

            <div>
              <label className="block font-hindi text-sm font-semibold text-gray-700 mb-2">{t("enterQty")} ({selected.unit})</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 text-2xl font-bold">-</button>
                <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))}
                  className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-xl py-3 text-center text-2xl font-bold outline-none" />
                <button onClick={() => setQty(q => q + 1)}
                  className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 text-2xl font-bold">+</button>
              </div>
              {qty > 0 && (
                <p className="text-center text-gray-500 font-hindi text-sm mt-2">
                  नया स्टॉक: <strong className={movType === "in" ? "text-green-700" : "text-red-600"}>
                    {movType === "in" ? Number(selected.current_stock) + qty : Math.max(0, Number(selected.current_stock) - qty)} {selected.unit}
                  </strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSelected(null)} className="py-4 bg-gray-100 text-gray-700 rounded-xl font-hindi font-bold text-base hover:bg-gray-200 transition-colors">
                रद्द करें
              </button>
              <button onClick={doMovement} disabled={saving || qty <= 0}
                className={`py-4 rounded-xl font-hindi font-bold text-base text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${movType === "in" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-5 h-5" />}
                {saving ? "..." : "सेव करें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(p => {
            const isLow = p.current_stock <= p.low_stock_limit;
            return (
              <div key={p.id} className={`bg-white rounded-2xl border-2 shadow-sm p-4 ${isLow ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-hindi font-bold text-gray-800 leading-tight">{p.name}</p>
                    <p className="text-gray-400 text-xs font-hindi mt-0.5">{p.category}</p>
                  </div>
                  {isLow && <span className="flex-shrink-0 ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-hindi font-bold">कम स्टॉक ⚠️</span>}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-2xl font-bold ${isLow ? "text-red-600" : "text-gray-800"}`}>{p.current_stock}</p>
                    <p className="text-gray-400 text-xs font-hindi">{p.unit} | लिमिट: {p.low_stock_limit}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setSelected(p); setMovType("in"); setQty(1); }}
                    className="bg-green-600 text-white py-3 rounded-xl font-hindi font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-green-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> {t("stockIn")}
                  </button>
                  <button onClick={() => { setSelected(p); setMovType("out"); setQty(1); }}
                    className="bg-orange-500 text-white py-3 rounded-xl font-hindi font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-orange-600 transition-colors shadow-sm">
                    <Minus className="w-4 h-4" /> {t("stockOut")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
