import { useEffect, useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Search, Upload, Download, ImageIcon, X } from "lucide-react";
import * as XLSX from "xlsx";

const CATEGORIES = ["Seeds", "Pesticides", "Fertilizers", "Crop Medicine", "Other"] as const;
const CROP_TYPES = ["Dhan", "Gehu", "Soyabean", "Chana", "Other"] as const;
const UNITS = ["kg", "gm", "ltr", "ml", "packet", "bottle", "bag", "pcs"] as const;

const CATEGORY_HI: Record<string, string> = {
  Seeds: "बीज", Pesticides: "कीटनाशक", Fertilizers: "खाद",
  "Crop Medicine": "फसल दवाई", Other: "अन्य"
};
const CROP_HI: Record<string, string> = {
  Dhan: "धान", Gehu: "गेहूं", Soyabean: "सोयाबीन", Chana: "चना", Other: "अन्य"
};

const emptyForm = {
  name: "", category: "Seeds", crop_type: "Dhan", company: "",
  purchase_price: 0, selling_price: 0, current_stock: 0,
  unit: "kg", low_stock_limit: 5, image_url: "", notes: "",
  is_active: true, is_offer: false
};

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const [isAddRoute] = useRoute("/admin/products/add");
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    if (isAddRoute) { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); }
  }, [isAddRoute]);

  useEffect(() => {
    let r = [...products];
    if (search) r = r.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.company || "").toLowerCase().includes(search.toLowerCase())
    );
    if (catFilter !== "all") r = r.filter(p => p.category === catFilter);
    setFiltered(r);
  }, [products, search, catFilter]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) console.error("Products fetch error:", error);
    setProducts(data || []);
    setLoading(false);
  }

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error || !data) return "";
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let image_url = form.image_url;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) image_url = url;
    }
    const payload = {
      name: form.name,
      category: form.category,
      crop_type: form.crop_type,
      company: form.company,
      purchase_price: Number(form.purchase_price),
      selling_price: Number(form.selling_price),
      current_stock: Number(form.current_stock),
      unit: form.unit,
      low_stock_limit: Number(form.low_stock_limit),
      image_url: image_url || null,
      notes: form.notes || null,
      is_active: form.is_active,
      is_offer: form.is_offer,
      updated_at: new Date().toISOString()
    };

    let error: any;
    if (editId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("products").insert([payload]));
    }
    if (error) { alert("Error: " + error.message); }
    setSaving(false);
    closeForm();
    fetchProducts();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" को डिलीट करना चाहते हैं?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Delete error: " + error.message);
    else fetchProducts();
  }

  async function toggleStatus(p: any) {
    await supabase.from("products").update({
      is_active: !p.is_active, updated_at: new Date().toISOString()
    }).eq("id", p.id);
    fetchProducts();
  }

  function openEdit(p: any) {
    setForm({
      name: p.name, category: p.category, crop_type: p.crop_type,
      company: p.company || "", purchase_price: p.purchase_price,
      selling_price: p.selling_price, current_stock: p.current_stock,
      unit: p.unit, low_stock_limit: p.low_stock_limit,
      image_url: p.image_url || "", notes: p.notes || "",
      is_active: p.is_active, is_offer: p.is_offer
    });
    setImagePreview(p.image_url || "");
    setImageFile(null);
    setEditId(p.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview("");
    if (isAddRoute) setLocation("/admin/products");
  }

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(products.map(p => ({
      नाम: p.name, श्रेणी: CATEGORY_HI[p.category] || p.category,
      फसल: CROP_HI[p.crop_type] || p.crop_type, कंपनी: p.company,
      खरीद_मूल्य: p.purchase_price, बिक्री_मूल्य: p.selling_price,
      स्टॉक: p.current_stock, इकाई: p.unit,
      स्थिति: p.is_active ? "एक्टिव" : "बंद"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "annadata_products.xlsx");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab);
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const toInsert = rows.map(r => ({
      name: String(r["नाम"] || r["name"] || "").trim(),
      category: r["category"] || "Other",
      crop_type: r["crop_type"] || "Other",
      company: String(r["कंपनी"] || r["company"] || "").trim(),
      purchase_price: Number(r["खरीद_मूल्य"] || r["purchase_price"] || 0),
      selling_price: Number(r["बिक्री_मूल्य"] || r["selling_price"] || 0),
      current_stock: Number(r["स्टॉक"] || r["current_stock"] || 0),
      unit: r["unit"] || r["इकाई"] || "kg",
      low_stock_limit: Number(r["low_stock_limit"] || 5),
      is_active: true, is_offer: false
    })).filter(r => r.name);

    if (!toInsert.length) return alert("कोई valid data नहीं मिला।");
    const { error } = await supabase.from("products").insert(toInsert);
    if (error) alert("Import error: " + error.message);
    else { fetchProducts(); alert(`✅ ${toInsert.length} प्रोडक्ट इम्पोर्ट हुए!`); }
    if (importRef.current) importRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">प्रोडक्ट मैनेजमेंट</h2>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi cursor-pointer hover:bg-gray-200">
            <Upload className="w-4 h-4" /> इम्पोर्ट
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" ref={importRef} />
          </label>
          <button onClick={handleExport} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200">
            <Download className="w-4 h-4" /> एक्सपोर्ट
          </button>
          <button
            onClick={() => { setForm({ ...emptyForm }); setEditId(null); setImageFile(null); setImagePreview(""); setShowForm(true); }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-hindi hover:bg-green-700 shadow-md"
          >
            <Plus className="w-4 h-4" /> नया प्रोडक्ट
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="प्रोडक्ट खोजें..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi"
          />
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi"
        >
          <option value="all">सभी श्रेणी</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_HI[c]}</option>)}
        </select>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-800 font-hindi text-lg">
                {editId ? "प्रोडक्ट एडिट करें" : "नया प्रोडक्ट जोड़ें"}
              </h3>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">प्रोडक्ट का नाम *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                  placeholder="जैसे: पूसा-1886 धान बीज" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">श्रेणी *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi">
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_HI[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">फसल</label>
                <select value={form.crop_type} onChange={e => setForm(f => ({ ...f, crop_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi">
                  {CROP_TYPES.map(c => <option key={c} value={c}>{CROP_HI[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">कंपनी</label>
                <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                  placeholder="जैसे: Bayer, Syngenta" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">इकाई</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">खरीद मूल्य (₹) *</label>
                <input type="number" min="0" required value={form.purchase_price}
                  onChange={e => setForm(f => ({ ...f, purchase_price: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">बिक्री मूल्य (₹) *</label>
                <input type="number" min="0" required value={form.selling_price}
                  onChange={e => setForm(f => ({ ...f, selling_price: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">मौजूदा स्टॉक *</label>
                <input type="number" min="0" required value={form.current_stock}
                  onChange={e => setForm(f => ({ ...f, current_stock: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">कम स्टॉक लिमिट</label>
                <input type="number" min="0" value={form.low_stock_limit}
                  onChange={e => setForm(f => ({ ...f, low_stock_limit: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">प्रोडक्ट फोटो</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-green-400 text-sm text-gray-500">
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-hindi">फोटो चुनें</span>
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                    }} className="hidden" />
                  </label>
                  {imagePreview && <img src={imagePreview} alt="" className="w-16 h-16 rounded-xl object-cover border" />}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 font-hindi mb-1">नोट्स</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi resize-none"
                  placeholder="कोई खास जानकारी..." />
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-hindi text-gray-700">एक्टिव</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_offer} onChange={e => setForm(f => ({ ...f, is_offer: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-hindi text-gray-700">ऑफर में</span>
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-hindi font-bold hover:bg-green-700 disabled:opacity-60 transition-colors">
                  {saving ? "सेव हो रहा है..." : editId ? "अपडेट करें" : "जोड़ें"}
                </button>
                <button type="button" onClick={closeForm}
                  className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-hindi hover:bg-gray-200 transition-colors">
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500 font-hindi">
            कुल {filtered.length} प्रोडक्ट
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-hindi text-gray-600 font-semibold">नाम</th>
                  <th className="text-left px-4 py-3 font-hindi text-gray-600 font-semibold hidden md:table-cell">श्रेणी</th>
                  <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">मूल्य</th>
                  <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">स्टॉक</th>
                  <th className="text-center px-4 py-3 font-hindi text-gray-600 font-semibold hidden sm:table-cell">स्थिति</th>
                  <th className="text-right px-4 py-3 font-hindi text-gray-600 font-semibold">क्रिया</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold text-sm">{p.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 font-hindi">{p.name}</p>
                          <p className="text-gray-400 text-xs">{p.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-hindi">
                        {CATEGORY_HI[p.category] || p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-800">₹{Number(p.selling_price).toLocaleString("en-IN")}</p>
                      <p className="text-gray-400 text-xs">खरीद: ₹{Number(p.purchase_price).toLocaleString("en-IN")}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold font-hindi ${Number(p.current_stock) <= Number(p.low_stock_limit) ? "text-red-600" : "text-gray-800"}`}>
                        {p.current_stock} {p.unit}
                      </span>
                      {Number(p.current_stock) <= Number(p.low_stock_limit) && (
                        <p className="text-red-500 text-xs font-hindi">कम स्टॉक!</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <button onClick={() => toggleStatus(p)}
                        className={`text-xs px-3 py-1 rounded-full font-hindi font-bold ${p.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {p.is_active ? "एक्टिव" : "बंद"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 font-hindi">
                      {search || catFilter !== "all" ? "कोई प्रोडक्ट नहीं मिला" : "अभी कोई प्रोडक्ट नहीं — ऊपर से जोड़ें"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
