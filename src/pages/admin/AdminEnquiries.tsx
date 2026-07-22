import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search, Download, Phone, X, Eye, MessageSquare,
  CheckCircle2, Clock, AlertCircle, Filter, Image as ImageIcon,
  RefreshCw, ChevronDown, User, MapPin, Leaf, Crop, Send
} from "lucide-react";
import * as XLSX from "xlsx";

type Enquiry = {
  id: string;
  name: string;
  mobile: string;
  village: string;
  district: string;
  crop: string;
  problem: string;
  land_area: string;
  message: string;
  photo_url?: string;
  status: "pending" | "replied" | "resolved";
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
};

const STATUS_CONFIG = {
  pending: {
    label: "प्रतीक्षा में",
    labelEn: "Pending",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    iconColor: "text-yellow-500",
    dot: "bg-yellow-400",
  },
  replied: {
    label: "जवाब दिया",
    labelEn: "Replied",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: MessageSquare,
    iconColor: "text-blue-500",
    dot: "bg-blue-400",
  },
  resolved: {
    label: "हल हो गया",
    labelEn: "Resolved",
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    dot: "bg-green-400",
  },
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filtered, setFiltered] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setEnquiries(data as Enquiry[]);
      setFiltered(data as Enquiry[]);
    }
    setLoading(false);
  }, []);

  // Generate a short-lived signed URL for a private photo path (1 hour)
  const getPhotoUrl = useCallback(async (path: string): Promise<string | null> => {
    if (signedUrls[path]) return signedUrls[path];
    const { data, error } = await supabase.storage
      .from("enquiry-photos")
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) return null;
    setSignedUrls(prev => ({ ...prev, [path]: data.signedUrl }));
    return data.signedUrl;
  }, [signedUrls]);

  const openPhoto = useCallback(async (path: string) => {
    const url = await getPhotoUrl(path);
    if (url) setPhotoModal(url);
  }, [getPhotoUrl]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  // Filter logic
  useEffect(() => {
    let result = [...enquiries];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(s) ||
        e.mobile.includes(s) ||
        e.village.toLowerCase().includes(s) ||
        e.district.toLowerCase().includes(s) ||
        e.problem.toLowerCase().includes(s) ||
        e.crop.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") result = result.filter(e => e.status === statusFilter);
    if (cropFilter !== "all") result = result.filter(e => e.crop.toLowerCase().includes(cropFilter.toLowerCase()));
    setFiltered(result);
  }, [search, statusFilter, cropFilter, enquiries]);

  // Reply + status update
  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    const { error } = await supabase
      .from("enquiries")
      .update({
        admin_reply: replyText.trim(),
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    if (!error) {
      setEnquiries(prev =>
        prev.map(e => e.id === selected.id
          ? { ...e, admin_reply: replyText.trim(), status: "replied", replied_at: new Date().toISOString() }
          : e
        )
      );
      setSelected(prev => prev ? { ...prev, admin_reply: replyText.trim(), status: "replied" } : null);
      setReplyText("");
    }
    setReplying(false);
  };

  const handleStatusChange = async (id: string, newStatus: Enquiry["status"]) => {
    const { error } = await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      setSelected(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
    }
  };

  const sendWhatsApp = (e: Enquiry) => {
    const msg = `नमस्ते ${e.name} जी! 🙏\n\nआपकी Annadata Agri & Seeds में Enquiry मिली:\n📌 *${e.problem}*\n\n${e.admin_reply ? `✅ हमारी सलाह:\n${e.admin_reply}\n\n` : ""}किसी भी सवाल के लिए कभी भी पूछें!\n\n🌾 Keshav Meena\nAnnadata Agri & Seeds\n📞 9691712455`;
    window.open(`https://wa.me/91${e.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Export to Excel
  const exportExcel = () => {
    const rows = filtered.map(e => ({
      "नाम": e.name,
      "मोबाइल": e.mobile,
      "गांव": e.village,
      "जिला": e.district,
      "फसल": e.crop,
      "समस्या": e.problem,
      "एकड़": e.land_area,
      "संदेश": e.message,
      "स्थिति": STATUS_CONFIG[e.status]?.labelEn || e.status,
      "जवाब": e.admin_reply || "-",
      "तारीख": formatDate(e.created_at),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Enquiries");
    XLSX.writeFile(wb, `Annadata_Enquiries_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Stats
  const stats = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === "pending").length,
    replied: enquiries.filter(e => e.status === "replied").length,
    resolved: enquiries.filter(e => e.status === "resolved").length,
  };

  const crops = ["all", ...Array.from(new Set(enquiries.map(e => e.crop).filter(Boolean)))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-hindi">किसान Enquiry प्रबंधन</h1>
          <p className="text-gray-500 text-sm font-hindi mt-0.5">वेबसाइट से आई सभी enquiries यहाँ दिखती हैं</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEnquiries} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-hindi transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-hindi hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "कुल Enquiries", value: stats.total, color: "text-gray-800", bg: "bg-white" },
          { label: "प्रतीक्षा में", value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "जवाब दिया", value: stats.replied, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "हल हो गया", value: stats.resolved, color: "text-green-700", bg: "bg-green-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-gray-100 shadow-sm`}>
            <p className="text-gray-500 text-xs font-hindi mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="नाम, मोबाइल, गांव, समस्या खोजें..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm font-hindi outline-none focus:border-green-400 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm font-hindi outline-none focus:border-green-400 bg-white cursor-pointer">
              <option value="all">सभी स्थिति</option>
              <option value="pending">प्रतीक्षा में</option>
              <option value="replied">जवाब दिया</option>
              <option value="resolved">हल हो गया</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm font-hindi outline-none focus:border-green-400 bg-white cursor-pointer">
              {crops.map(c => (
                <option key={c} value={c}>{c === "all" ? "सभी फसल" : c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-hindi">कोई enquiry नहीं मिली</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(enq => {
            const sc = STATUS_CONFIG[enq.status];
            const StatusIcon = sc.icon;
            const days = daysSince(enq.created_at);
            return (
              <div key={enq.id}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${enq.status === "pending" ? "border-yellow-200" : enq.status === "replied" ? "border-blue-200" : "border-green-200"}`}
                onClick={() => { setSelected(enq); setReplyText(enq.admin_reply || ""); }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${enq.status === "pending" ? "bg-yellow-100" : enq.status === "replied" ? "bg-blue-100" : "bg-green-100"}`}>
                        <span className="font-bold text-gray-700 text-sm">{enq.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 font-hindi">{enq.name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          {enq.photo_url && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                              <ImageIcon className="w-3 h-3" /> फोटो
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-hindi flex-wrap">
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{enq.mobile}</span>
                          {enq.village && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{enq.village}{enq.district ? `, ${enq.district}` : ""}</span>}
                          {enq.crop && <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5" />{enq.crop}</span>}
                        </div>
                        <p className="text-sm font-hindi text-gray-700 mt-1.5 font-medium">📌 {enq.problem}</p>
                        {enq.message && <p className="text-xs text-gray-500 font-hindi mt-0.5 line-clamp-1">{enq.message}</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 font-hindi">{formatDate(enq.created_at)}</p>
                      <p className="text-xs text-gray-400 font-hindi">{days === 0 ? "आज" : `${days} दिन पहले`}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Reply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 p-5 rounded-t-3xl sm:rounded-t-2xl flex items-start justify-between">
              <div>
                <p className="text-green-300 text-xs font-medium uppercase tracking-wider mb-1">Enquiry विवरण</p>
                <h3 className="text-white font-hindi font-bold text-xl">{selected.name}</h3>
                <p className="text-green-200 text-sm font-hindi mt-0.5">{selected.mobile} {selected.village ? `• ${selected.village}` : ""}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "नाम", value: selected.name },
                  { label: "मोबाइल", value: selected.mobile },
                  { label: "गांव", value: selected.village || "-" },
                  { label: "जिला", value: selected.district || "-" },
                  { label: "फसल", value: selected.crop || "-" },
                  { label: "भूमि", value: selected.land_area ? `${selected.land_area} एकड़` : "-" },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-hindi mb-0.5">{f.label}</p>
                    <p className="text-sm font-bold text-gray-800 font-hindi">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Problem */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs text-yellow-600 font-hindi font-bold uppercase tracking-wider mb-1">समस्या</p>
                <p className="font-hindi text-gray-800 font-semibold text-sm">📌 {selected.problem}</p>
                {selected.message && (
                  <p className="text-gray-600 text-sm font-hindi mt-2 leading-relaxed">{selected.message}</p>
                )}
              </div>

              {/* Photo */}
              {selected.photo_url && (
                <div>
                  <p className="text-xs text-gray-500 font-hindi font-bold uppercase tracking-wider mb-2">अपलोड की गई फोटो</p>
                  <button
                    onClick={() => openPhoto(selected.photo_url!)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 text-purple-700 font-hindi text-sm hover:bg-purple-100 transition-colors">
                    <ImageIcon className="w-4 h-4" /> फोटो देखें (क्लिक करें)
                  </button>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs text-gray-500 font-hindi font-bold uppercase tracking-wider mb-2">स्थिति बदलें</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "replied", "resolved"] as const).map(s => {
                    const sc = STATUS_CONFIG[s];
                    return (
                      <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-hindi font-bold border transition-all ${selected.status === s ? sc.badge + " scale-105 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Existing reply */}
              {selected.admin_reply && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-hindi font-bold uppercase tracking-wider mb-1">✅ आपका जवाब</p>
                  <p className="text-sm text-gray-700 font-hindi leading-relaxed">{selected.admin_reply}</p>
                </div>
              )}

              {/* Reply box */}
              <div>
                <p className="text-xs text-gray-500 font-hindi font-bold uppercase tracking-wider mb-2">जवाब लिखें</p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="किसान को जवाब लिखें..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors resize-none font-hindi"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-hindi font-bold rounded-xl text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {replying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  जवाब सेव करें
                </button>
                <button
                  onClick={() => sendWhatsApp(selected)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-hindi font-bold rounded-xl text-sm hover:bg-[#1ebe5d] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Fullscreen Modal */}
      {photoModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPhotoModal(null)}>
          <img src={photoModal} alt="Enquiry Photo" className="max-w-full max-h-full rounded-xl object-contain" />
          <button onClick={() => setPhotoModal(null)} className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
