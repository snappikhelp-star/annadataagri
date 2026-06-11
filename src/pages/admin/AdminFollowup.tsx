import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { MessageCircle, Phone, MapPin, RefreshCw, Calendar, Send, ChevronDown, ChevronUp } from "lucide-react";

type FollowupStatus = "recent" | "soon" | "due";

interface CustomerFollowup {
  id: string; name: string; mobile: string; village: string;
  crop_type: string; last_purchase_date: string | null;
  total_udhaar: number; total_purchase: number;
  daysSince: number; status: FollowupStatus;
}

const MESSAGE_TEMPLATES = [
  {
    id: "season",
    label: "🌾 सीजन रिमाइंडर",
    labelEn: "Season Reminder",
    generate: (c: CustomerFollowup) => {
      const crop = c.crop_type && c.crop_type !== "Other" ? c.crop_type : "फसल";
      return `नमस्ते *${c.name}* जी 🙏\n\n*अन्नदाता एग्री & सीड्स*\nसलामतपुर, रायसेन | 📞 6261737388\n\n${crop} की सीजन आ रही है! हमारे पास उच्च गुणवत्ता के बीज और दवाइयां उपलब्ध हैं।\n\n${c.total_udhaar > 0 ? `💰 आपका उधार: *₹${Number(c.total_udhaar).toLocaleString("en-IN")}*\n\n` : ""}कभी भी आएं — *केशव भाई* आपकी सेवा में हमेशा तैयार हैं 🌾`;
    },
  },
  {
    id: "udhaar",
    label: "💰 उधार याद दिलाएं",
    labelEn: "Payment Reminder",
    generate: (c: CustomerFollowup) => {
      return `नमस्ते *${c.name}* जी 🙏\n\n*अन्नदाता एग्री & सीड्स* से केशव भाई बोल रहे हैं।\n\nआपका *₹${Number(c.total_udhaar).toLocaleString("en-IN")}* का उधार बकाया है।\n\nकृपया जल्द से जल्द दुकान पर आकर भुगतान करें।\n\nधन्यवाद 🙏\n📞 6261737388`;
    },
  },
  {
    id: "spray",
    label: "💊 Spray Schedule",
    labelEn: "Spray Reminder",
    generate: (c: CustomerFollowup) => {
      const crop = c.crop_type && c.crop_type !== "Other" ? c.crop_type : "फसल";
      return `नमस्ते *${c.name}* जी 🙏\n\n*अन्नदाता एग्री & सीड्स* — केशव भाई\n\n${crop} की अगली Spray का समय आ गया है! 🌿\n\nसही दवाई लेने के लिए आज ही आएं या WhatsApp करें।\n\n📞 6261737388 | सलामतपुर, रायसेन`;
    },
  },
  {
    id: "offer",
    label: "🎁 Special Offer",
    labelEn: "Special Offer",
    generate: (c: CustomerFollowup) => {
      return `नमस्ते *${c.name}* जी 🙏\n\n*अन्नदाता एग्री & सीड्स* की तरफ से Special Offer!\n\nइस सीजन में खरीदी पर *विशेष छूट* मिल रही है।\n\nआज ही आएं! — केशव भाई\n📞 6261737388 | सलामतपुर, रायसेन 🌾`;
    },
  },
];

export default function AdminFollowup() {
  const { t } = useLang();
  const [customers, setCustomers] = useState<CustomerFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|FollowupStatus>("all");
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("name");
    const today = new Date();

    const mapped: CustomerFollowup[] = (data || []).map((c: any) => {
      const lastDate = c.last_purchase_date ? new Date(c.last_purchase_date) : c.updated_at ? new Date(c.updated_at) : null;
      const daysSince = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const status: FollowupStatus = daysSince < 30 ? "recent" : daysSince < 60 ? "soon" : "due";
      return { ...c, daysSince, status };
    });

    mapped.sort((a, b) => b.daysSince - a.daysSince);
    setCustomers(mapped);
    setLoading(false);
  }

  const filtered = filter === "all" ? customers : customers.filter(c => c.status === filter);
  const counts = {
    recent: customers.filter(c => c.status === "recent").length,
    soon: customers.filter(c => c.status === "soon").length,
    due: customers.filter(c => c.status === "due").length,
  };

  function sendWA(c: CustomerFollowup) {
    const template = MESSAGE_TEMPLATES[selectedTemplate];
    const msg = template.generate(c);
    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function sendBulkDue() {
    const dueCustomers = customers.filter(c => c.status === "due" && c.mobile);
    if (dueCustomers.length === 0) return;
    let i = 0;
    const openNext = () => {
      if (i >= dueCustomers.length) return;
      sendWA(dueCustomers[i]);
      i++;
      setTimeout(openNext, 1500);
    };
    openNext();
  }

  const statusConfig = {
    recent: { label: t("recent"), color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
    soon: { label: t("followupSoon"), color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
    due: { label: t("followupDue"), color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("followupTitle")} 🌾</h1>
        <button onClick={fetchCustomers} className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["recent","soon","due"] as const).map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? "all" : s)}
            className={`rounded-2xl p-4 text-center transition-all border-2 ${filter === s ? statusConfig[s].color + " shadow-md" : "bg-white border-gray-100 hover:border-gray-200"}`}>
            <div className={`w-3 h-3 rounded-full ${statusConfig[s].dot} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${filter === s ? "" : "text-gray-800"}`}>{counts[s]}</p>
            <p className={`text-xs font-hindi mt-0.5 ${filter === s ? "" : "text-gray-500"}`}>
              {s === "recent" ? "हाल में" : s === "soon" ? "जल्द करें" : "जरूरी"}
            </p>
          </button>
        ))}
      </div>

      {/* Message Template Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-green-700" />
            </div>
            <div className="text-left">
              <p className="font-hindi font-bold text-gray-800 text-sm">संदेश टेम्पलेट</p>
              <p className="text-xs text-gray-500 font-hindi">{MESSAGE_TEMPLATES[selectedTemplate].label}</p>
            </div>
          </div>
          {showTemplates ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showTemplates && (
          <div className="border-t border-gray-100 p-3 space-y-2">
            {MESSAGE_TEMPLATES.map((tpl, idx) => (
              <button
                key={tpl.id}
                onClick={() => { setSelectedTemplate(idx); setShowTemplates(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all border ${
                  selectedTemplate === idx ? "bg-green-50 border-green-200 text-green-800" : "border-gray-100 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-lg">{tpl.label.split(" ")[0]}</span>
                <div>
                  <p className="font-hindi font-semibold text-sm">{tpl.label}</p>
                  <p className="text-xs text-gray-400">{tpl.labelEn}</p>
                </div>
                {selectedTemplate === idx && <span className="ml-auto text-green-600 font-bold text-xs">✓ चुना</span>}
              </button>
            ))}
          </div>
        )}

        {counts.due > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 bg-red-50">
            <button
              onClick={sendBulkDue}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-hindi font-bold py-3 rounded-xl hover:bg-red-600 transition-colors text-sm shadow-sm"
            >
              <Send className="w-4 h-4" />
              सभी जरूरी {counts.due} ग्राहकों को संदेश भेजें
            </button>
            <p className="text-center text-xs text-red-400 font-hindi mt-1">एक-एक करके WhatsApp खुलेगा</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-10 text-center">
          <p className="text-gray-400 font-hindi text-lg">इस श्रेणी में कोई ग्राहक नहीं</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const sc = statusConfig[c.status];
            return (
              <div key={c.id} className={`bg-white rounded-2xl border-2 shadow-sm p-4 ${c.status === "due" ? "border-red-200" : c.status === "soon" ? "border-yellow-200" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                      <p className="font-hindi font-bold text-gray-800">{c.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 ml-4">
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
                      {c.crop_type && c.crop_type !== "Other" && (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-hindi">🌾 {c.crop_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-hindi font-bold ${sc.badge}`}>
                      {c.daysSince >= 999 ? "पुराना" : `${c.daysSince} ${t("days")} पहले`}
                    </span>
                    {c.total_udhaar > 0 && (
                      <p className="text-orange-600 font-bold text-sm mt-1 font-hindi">₹{Number(c.total_udhaar).toLocaleString("en-IN")} उधार</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-gray-400 text-xs font-hindi">
                    {t("lastPurchase")}: {c.last_purchase_date
                      ? new Date(c.last_purchase_date).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "जानकारी नहीं"}
                  </p>
                </div>

                <div className="flex gap-2">
                  {c.mobile && (
                    <button onClick={() => sendWA(c)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-hindi font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                      {MESSAGE_TEMPLATES[selectedTemplate].label.split(" ").slice(1).join(" ")} भेजें
                    </button>
                  )}
                  {c.mobile && (
                    <a href={`tel:${c.mobile}`}
                      className="px-4 flex items-center justify-center bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-100">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
