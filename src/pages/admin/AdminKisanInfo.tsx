import { useEffect, useState, useCallback } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown,
  Eye, EyeOff, RefreshCw, BookOpen, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type KisanInfoRow = {
  id: string;
  emoji: string;
  name_hi: string;
  name_en: string;
  color: string;
  symptoms: string[];
  how_to_identify: string;
  causes: string[];
  expected_loss: string;
  expert_note: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

const EMPTY_FORM: Omit<KisanInfoRow, "created_at"> = {
  id: "",
  emoji: "🌱",
  name_hi: "",
  name_en: "",
  color: "#4CAF50",
  symptoms: [""],
  how_to_identify: "",
  causes: [""],
  expected_loss: "",
  expert_note: "",
  category: "general",
  is_active: true,
  sort_order: 0,
};

const COLOR_PRESETS = [
  "#4CAF50", "#F9A825", "#ef4444", "#7E57C2",
  "#EF6C00", "#795548", "#0288D1", "#009688",
  "#E91E63", "#607D8B",
];

function TagArrayInput({
  label, values, onChange
}: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...values, ""]);
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <div className="space-y-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v} onChange={e => update(i, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-hindi focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`${label} ${i + 1}`}
            />
            <button type="button" onClick={() => remove(i)}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="mt-2 text-xs text-green-600 font-bold hover:underline flex items-center gap-1">
        <Plus className="w-3 h-3" /> जोड़ें
      </button>
    </div>
  );
}

export default function AdminKisanInfo() {
  const [rows, setRows] = useState<KisanInfoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null); // null = list, "__new__" = new form
  const [form, setForm] = useState<Omit<KisanInfoRow, "created_at">>(EMPTY_FORM);
  const [expandId, setExpandId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!supabaseConfigured) {
      setError("Supabase configured नहीं है। VITE_SUPABASE_URL और VITE_SUPABASE_ANON_KEY Replit Secrets में set करें।");
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("kisan_info")
      .select("*")
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startNew() {
    setForm({ ...EMPTY_FORM, sort_order: rows.length + 1 });
    setEditId("__new__");
  }

  function startEdit(row: KisanInfoRow) {
    setForm({
      id: row.id,
      emoji: row.emoji,
      name_hi: row.name_hi,
      name_en: row.name_en,
      color: row.color,
      symptoms: row.symptoms?.length ? row.symptoms : [""],
      how_to_identify: row.how_to_identify,
      causes: row.causes?.length ? row.causes : [""],
      expected_loss: row.expected_loss,
      expert_note: row.expert_note,
      category: row.category,
      is_active: row.is_active,
      sort_order: row.sort_order,
    });
    setEditId(row.id);
  }

  function cancel() {
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function save() {
    if (!form.name_hi.trim()) { setError("हिंदी नाम जरूरी है।"); return; }
    if (!form.id.trim() && editId === "__new__") { setError("ID जरूरी है (lowercase, hyphens allowed)."); return; }
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      symptoms: form.symptoms.filter(Boolean),
      causes: form.causes.filter(Boolean),
    };
    const { error: err } = editId === "__new__"
      ? await supabase.from("kisan_info").insert(payload)
      : await supabase.from("kisan_info").update(payload).eq("id", form.id);
    if (err) setError(err.message);
    else { cancel(); await load(); }
    setSaving(false);
  }

  async function toggleActive(row: KisanInfoRow) {
    await supabase.from("kisan_info").update({ is_active: !row.is_active }).eq("id", row.id);
    load();
  }

  async function deleteRow(row: KisanInfoRow) {
    if (!window.confirm(`"${row.name_hi}" को डिलीट करें?`)) return;
    await supabase.from("kisan_info").delete().eq("id", row.id);
    load();
  }

  async function moveOrder(row: KisanInfoRow, dir: -1 | 1) {
    const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(r => r.id === row.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("kisan_info").update({ sort_order: swap.sort_order }).eq("id", row.id),
      supabase.from("kisan_info").update({ sort_order: row.sort_order }).eq("id", swap.id),
    ]);
    load();
  }

  // ── Form ──────────────────────────────────────────────────
  if (editId !== null) {
    const isNew = editId === "__new__";
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 font-hindi">
            {isNew ? "नई जानकारी जोड़ें" : "जानकारी Edit करें"}
          </h2>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
          {/* ID — only for new */}
          {isNew && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">ID (unique, no spaces) *</label>
              <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. leaf-yellowing" />
            </div>
          )}

          {/* Emoji + Color */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Emoji</label>
              <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={4} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COLOR_PRESETS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? "#000" : "transparent" }} />
                ))}
              </div>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="w-12 h-8 rounded cursor-pointer border border-gray-200" />
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">नाम (हिंदी) *</label>
              <input value={form.name_hi} onChange={e => setForm(f => ({ ...f, name_hi: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-hindi focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="धान की ग्रोथ नहीं" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Name (English)</label>
              <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rice Not Growing" />
            </div>
          </div>

          {/* Symptoms */}
          <TagArrayInput label="लक्षण (Symptoms)" values={form.symptoms} onChange={v => setForm(f => ({ ...f, symptoms: v }))} />

          {/* How to identify */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">कैसे पहचानें?</label>
            <textarea value={form.how_to_identify} onChange={e => setForm(f => ({ ...f, how_to_identify: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-hindi focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="खेत में जाकर देखें..." />
          </div>

          {/* Causes */}
          <TagArrayInput label="संभावित कारण (Causes)" values={form.causes} onChange={v => setForm(f => ({ ...f, causes: v }))} />

          {/* Expected Loss */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">संभावित नुकसान (Expected Loss)</label>
            <input value={form.expected_loss} onChange={e => setForm(f => ({ ...f, expected_loss: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-hindi focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="20-40% तक पैदावार कम हो सकती है" />
          </div>

          {/* Expert Note */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">विशेषज्ञ सलाह (Expert Note)</label>
            <textarea value={form.expert_note} onChange={e => setForm(f => ({ ...f, expert_note: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-hindi focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="रोपाई के 15 दिन बाद भी..." />
          </div>

          {/* Category + Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="general">General</option>
                <option value="disease">Disease (रोग)</option>
                <option value="pest">Pest (कीट)</option>
                <option value="nutrition">Nutrition (पोषण)</option>
                <option value="weed">Weed (खरपतवार)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
              <input type="checkbox" className="sr-only" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
            </div>
            <span className="text-sm font-medium text-gray-700">Active (वेबसाइट पर दिखाएं)</span>
          </label>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={save} disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? "सेव हो रहा है..." : "सेव करें"}
          </button>
          <button onClick={cancel} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-hindi flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600" /> Kisan Info Center
          </h2>
          <p className="text-sm text-gray-500 font-hindi mt-0.5">फसल की समस्याओं की जानकारी manage करें</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={startNew}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> नई जानकारी जोड़ें
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
            {!supabaseConfigured && (
              <p className="mt-2 font-hindi text-xs">
                Replit Secrets में <strong>VITE_SUPABASE_URL</strong> और <strong>VITE_SUPABASE_ANON_KEY</strong> set करें, फिर app restart करें।
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-hindi font-bold text-lg">कोई जानकारी नहीं</p>
          <p className="text-sm mt-1 font-hindi">ऊपर "नई जानकारी जोड़ें" पर click करें</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {sorted.map((row, idx) => (
          <motion.div key={row.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Row Header */}
            <div className="flex items-center gap-3 p-4">
              {/* Color dot + emoji */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${row.color}18` }}>
                {row.emoji}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-hindi font-bold text-gray-800 text-base leading-tight">{row.name_hi}</p>
                  {row.name_en && <p className="text-xs text-gray-400">{row.name_en}</p>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${row.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {row.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">#{row.sort_order}</span>
                  <span className="text-xs text-gray-400 font-hindi">{row.category}</span>
                  <div className="w-3 h-3 rounded-full" style={{ background: row.color }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Order */}
                <button onClick={() => moveOrder(row, -1)} disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveOrder(row, 1)} disabled={idx === sorted.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Toggle active */}
                <button onClick={() => toggleActive(row)}
                  className={`p-1.5 rounded-lg transition-colors ${row.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                  title={row.is_active ? "छुपाएं" : "दिखाएं"}>
                  {row.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Expand preview */}
                <button onClick={() => setExpandId(expandId === row.id ? null : row.id)}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button onClick={() => startEdit(row)}
                  className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button onClick={() => deleteRow(row)}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Preview */}
            <AnimatePresence>
              {expandId === row.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3 space-y-3 text-sm font-hindi">

                  {row.symptoms?.length > 0 && (
                    <div>
                      <p className="font-bold text-gray-600 mb-1 text-xs uppercase tracking-wide">🔍 लक्षण</p>
                      <ul className="space-y-0.5">
                        {row.symptoms.map((s, i) => <li key={i} className="text-gray-700">• {s}</li>)}
                      </ul>
                    </div>
                  )}
                  {row.how_to_identify && (
                    <div>
                      <p className="font-bold text-gray-600 mb-1 text-xs uppercase tracking-wide">👁️ कैसे पहचानें</p>
                      <p className="text-gray-700">{row.how_to_identify}</p>
                    </div>
                  )}
                  {row.causes?.length > 0 && (
                    <div>
                      <p className="font-bold text-gray-600 mb-1 text-xs uppercase tracking-wide">⚡ कारण</p>
                      <div className="flex flex-wrap gap-1.5">
                        {row.causes.map((c, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {row.expected_loss && (
                    <div className="bg-red-50 rounded-lg p-2 text-xs text-red-700 font-bold">
                      📉 {row.expected_loss}
                    </div>
                  )}
                  {row.expert_note && (
                    <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
                      💡 {row.expert_note}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
