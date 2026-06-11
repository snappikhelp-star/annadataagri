import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Minus, RefreshCw, History, AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type MovementType = "in" | "out" | "adjustment";

const MOV_LABEL: Record<MovementType, string> = { in: "स्टॉक इन", out: "स्टॉक आउट", adjustment: "एडजस्ट" };
const MOV_COLOR: Record<MovementType, string> = {
  in: "text-green-600 bg-green-50",
  out: "text-red-600 bg-red-50",
  adjustment: "text-blue-600 bg-blue-50"
};

export default function AdminStock() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"stock" | "history" | "alerts">("stock");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [movType, setMovType] = useState<MovementType>("in");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [prodSearch, setProdSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: prods, error: pe }, { data: movs, error: me }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("stock_movements")
        .select("*, product:products(name, unit)")
        .order("created_at", { ascending: false })
        .limit(100)
    ]);
    if (pe) console.error("Products error:", pe);
    if (me) console.error("Movements error:", me);
    setProducts(prods || []);
    setMovements(movs || []);
    setLoading(false);
  }

  async function handleMovement() {
    if (!selectedProduct || qty <= 0) return;
    setSaving(true);
    const prev = Number(selectedProduct.current_stock);
    let newStock = prev;
    if (movType === "in") newStock = prev + qty;
    else if (movType === "out") newStock = Math.max(0, prev - qty);
    else newStock = qty;

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("stock_movements").insert([{
        product_id: selectedProduct.id,
        movement_type: movType,
        quantity: qty,
        previous_stock: prev,
        new_stock: newStock,
        notes: notes || null,
        created_by: user?.email || "admin"
      }]),
      supabase.from("products").update({
        current_stock: newStock,
        updated_at: new Date().toISOString()
      }).eq("id", selectedProduct.id)
    ]);

    if (e1) console.error("Movement insert error:", e1);
    if (e2) console.error("Product update error:", e2);

    setSaving(false);
    setShowModal(false);
    setSelectedProduct(null);
    setQty(1);
    setNotes("");
    fetchData();
  }

  function openModal(p: any, type: MovementType) {
    setSelectedProduct(p);
    setMovType(type);
    setQty(type === "adjustment" ? Number(p.current_stock) : 1);
    setNotes("");
    setShowModal(true);
  }

  const lowStockProducts = products.filter(
    (p: any) => Number(p.current_stock) <= Number(p.low_stock_limit) && p.is_active
  );

  const filteredProducts = products.filter((p: any) =>
    !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 font-hindi">स्टॉक मैनेजमेंट</h2>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {([
          { id: "stock", label: "स्टॉक" },
          { id: "history", label: "इतिहास" },
          { id: "alerts", label: `⚠️ अलर्ट (${lowStockProducts.length})` }
        ] as const).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === t.id ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Movement Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800 font-hindi">{MOV_LABEL[movType]}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="font-hindi font-bold text-gray-800">{selectedProduct.name}</p>
                <p className="text-gray-500 text-sm font-hindi mt-1">
                  मौजूदा स्टॉक:{" "}
                  <span className="font-bold text-gray-700">
                    {selectedProduct.current_stock} {selectedProduct.unit}
                  </span>
                </p>
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">प्रकार</label>
                <div className="flex gap-2">
                  {(["in", "out", "adjustment"] as MovementType[]).map(t => (
                    <button key={t} onClick={() => { setMovType(t); if (t === "adjustment") setQty(Number(selectedProduct.current_stock)); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-hindi font-bold border-2 transition-all ${movType === t ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
                      {MOV_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">
                  {movType === "adjustment" ? "नई मात्रा" : "मात्रा"} ({selectedProduct.unit})
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(movType === "adjustment" ? 0 : 1, q - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input type="number" min={movType === "adjustment" ? 0 : 1} value={qty}
                    onChange={e => setQty(Math.max(0, Number(e.target.value)))}
                    className="flex-1 text-center border border-gray-200 rounded-xl py-2.5 text-xl font-bold focus:outline-none focus:border-green-500" />
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {movType !== "adjustment" && (
                  <p className="text-sm text-gray-500 font-hindi mt-2 text-center">
                    नया स्टॉक:{" "}
                    <span className="font-bold text-gray-700">
                      {movType === "in"
                        ? Number(selectedProduct.current_stock) + qty
                        : Math.max(0, Number(selectedProduct.current_stock) - qty)}{" "}
                      {selectedProduct.unit}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">नोट (वैकल्पिक)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi"
                  placeholder="कोई कारण..." />
              </div>

              <button onClick={handleMovement} disabled={saving || qty < 0}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-hindi font-bold hover:bg-green-700 disabled:opacity-60 transition-colors">
                {saving ? "सेव हो रहा है..." : "✅ सेव करें"}
              </button>
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
          {/* STOCK TAB */}
          {activeTab === "stock" && (
            <div className="space-y-3">
              <input value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                placeholder="प्रोडक्ट खोजें..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-hindi text-gray-600 font-semibold">प्रोडक्ट</th>
                        <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">स्टॉक</th>
                        <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold hidden md:table-cell">लिमिट</th>
                        <th className="text-center px-4 py-3 font-hindi text-gray-600 font-semibold hidden sm:table-cell">स्थिति</th>
                        <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">क्रिया</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-hindi font-semibold text-gray-800">{p.name}</p>
                            <p className="text-gray-400 text-xs">{p.company}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold font-hindi text-base ${Number(p.current_stock) <= Number(p.low_stock_limit) ? "text-red-600" : "text-gray-800"}`}>
                              {p.current_stock} {p.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm hidden md:table-cell font-hindi">
                            {p.low_stock_limit} {p.unit}
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span className={`text-xs px-2 py-1 rounded-full font-hindi font-bold ${Number(p.current_stock) <= Number(p.low_stock_limit) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {Number(p.current_stock) <= Number(p.low_stock_limit) ? "कम स्टॉक" : "ठीक है"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => openModal(p, "in")} title="स्टॉक इन"
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <Plus className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(p, "out")} title="स्टॉक आउट"
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Minus className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(p, "adjustment")} title="एडजस्ट"
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-400 font-hindi">
                            कोई प्रोडक्ट नहीं मिला
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-hindi text-gray-600 font-semibold">प्रोडक्ट</th>
                      <th className="text-center px-4 py-3 font-hindi text-gray-600 font-semibold">प्रकार</th>
                      <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">मात्रा</th>
                      <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold hidden md:table-cell">पुराना → नया</th>
                      <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold hidden sm:table-cell">तारीख</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-hindi text-gray-800 font-medium">
                          {m.product?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-hindi font-bold ${MOV_COLOR[m.movement_type as MovementType] || "bg-gray-100 text-gray-600"}`}>
                            {MOV_LABEL[m.movement_type as MovementType] || m.movement_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-hindi">
                          {m.quantity} {m.product?.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell font-hindi">
                          {m.previous_stock} → {m.new_stock}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs hidden sm:table-cell">
                          {new Date(m.created_at).toLocaleDateString("hi-IN")}
                          <br />
                          <span className="text-gray-300">{m.notes || ""}</span>
                        </td>
                      </tr>
                    ))}
                    {movements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400 font-hindi">
                          कोई इतिहास नहीं
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === "alerts" && (
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <p className="text-green-700 font-hindi text-xl font-bold">✅ सभी प्रोडक्ट का स्टॉक ठीक है!</p>
                  <p className="text-green-500 font-hindi text-sm mt-2">कोई कम स्टॉक नहीं</p>
                </div>
              ) : (
                lowStockProducts.map((p: any) => (
                  <div key={p.id} className="bg-white rounded-2xl border-2 border-red-200 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-hindi font-bold text-gray-800">{p.name}</p>
                      <p className="text-red-600 text-sm font-hindi mt-0.5">
                        स्टॉक: <strong>{p.current_stock} {p.unit}</strong> (लिमिट: {p.low_stock_limit} {p.unit})
                      </p>
                    </div>
                    <button onClick={() => openModal(p, "in")}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-hindi hover:bg-green-700 whitespace-nowrap flex-shrink-0">
                      + स्टॉक इन
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
