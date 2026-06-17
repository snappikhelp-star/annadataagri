import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Package, Image, Lightbulb, Phone,
  Search, ChevronRight, X, Star, MapPin,
  MessageCircle, Clock, CheckCircle, Leaf,
  Bug, Droplets, Sprout, Wheat, ChevronDown, ChevronUp,
  AlertCircle
} from "lucide-react";
import { FaWhatsapp, FaGoogle, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import logoPath from "@assets/logo.webp";
import bannerPath from "@assets/banner-mobile.webp";
import shopImg1 from "@assets/shop1.webp";
import shopImg2 from "@assets/shop2.webp";
import shopImg3 from "@assets/shop3.webp";
import shopImg4 from "@assets/shop4.webp";

const PHONE = "916261737388";
const PHONE_SHORT = "6261737388";
const MAPS_LINK = "https://maps.app.goo.gl/42WDXZz6qG67UkQY7?g_st=ic";
const GOOGLE_REVIEW_LINK = "https://g.page/r/Cc8Vg4qNog9QEBM/review";
function waLink(msg: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

type Tab = "home" | "products" | "gallery" | "advice" | "contact";

const TABS: { id: Tab; label: string; labelHi: string; icon: React.ReactNode }[] = [
  { id: "home",     label: "Home",     labelHi: "होम",      icon: <Home className="w-5 h-5" /> },
  { id: "products", label: "Products", labelHi: "उत्पाद",   icon: <Package className="w-5 h-5" /> },
  { id: "gallery",  label: "Gallery",  labelHi: "गैलरी",   icon: <Image className="w-5 h-5" /> },
  { id: "advice",   label: "Advice",   labelHi: "सलाह",    icon: <Lightbulb className="w-5 h-5" /> },
  { id: "contact",  label: "Contact",  labelHi: "संपर्क",   icon: <Phone className="w-5 h-5" /> },
];


const PRODUCTS = [
{
id:1,
name:"धान First Spray",
nameEn:"Dhan First Spray",
category:"Spray",
crop:"Dhan",
emoji:"💦",
badge:"NOW",
badgeColor:"#16a34a",
desc:"धान में पहला स्प्रे कब और कैसे करें",
price:"सलाह लें"
},
{
id:2,
name:"खरपतवार नियंत्रण",
nameEn:"Weed Control",
category:"Dawai",
crop:"Dhan",
emoji:"🌱",
badge:"HOT",
badgeColor:"#f59e0b",
desc:"धान में घास नियंत्रण सलाह",
price:"सलाह लें"
},
{
id:3,
name:"कीट नियंत्रण",
nameEn:"Pest Control",
category:"Dawai",
crop:"Dhan",
emoji:"🐛",
badge:"IMPORTANT",
badgeColor:"#ef4444",
desc:"धान के कीटों से बचाव",
price:"सलाह लें"
},
{
id:4,
name:"फोटो भेजकर सलाह",
nameEn:"Photo Guidance",
category:"Guidance",
crop:"Dhan",
emoji:"📸",
badge:"FREE",
badgeColor:"#22c55e",
desc:"खेत की फोटो भेजें और सलाह लें",
price:"Free"
}
];
const CATEGORIES = ["All", "Spray", "Dawai", "Guidance"];
const CROPS = ["All", "Dhan"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "30%" : "-30%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "30%", opacity: 0 }),
};

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [prevTab, setPrevTab] = useState<Tab>("home");

  const tabOrder: Tab[] = ["home", "products", "gallery", "advice", "contact"];
  const direction = tabOrder.indexOf(activeTab) - tabOrder.indexOf(prevTab);

  const switchTab = (tab: Tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0d1f0d] flex flex-col overflow-hidden" style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {activeTab === "home"     && <HomeTab onTabChange={switchTab} />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "gallery"  && <GalleryTab />}
          {activeTab === "advice"   && <AdviceTab />}
          {activeTab === "contact"  && <ContactTab />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 relative"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "linear-gradient(180deg, rgba(8,18,8,0.98) 0%, rgba(5,12,5,1) 100%)",
          borderTop: "1px solid rgba(249,168,37,0.18)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
        }}>
        <div className="grid grid-cols-5 h-[62px]">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 relative transition-all active:scale-90"
              >
                {active && (
                  <>
                    <motion.div
                      layoutId="tab-bg-pill"
                      className="absolute inset-x-1 inset-y-1.5 rounded-2xl"
                      style={{ background: "rgba(249,168,37,0.12)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #F9A825, #FFD54F)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  </>
                )}
                <motion.span
                  animate={active ? { scale: [1, 1.25, 1.1], y: [0, -2, 0] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={`relative z-10 transition-colors text-[18px] ${active ? "text-[#F9A825]" : "text-white/35"}`}>
                  {tab.icon}
                </motion.span>
                <span className={`relative z-10 text-[9px] font-black leading-none transition-colors ${active ? "text-[#F9A825]" : "text-white/30"}`}>
                  {tab.labelHi}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME TAB
═══════════════════════════════════════════════ */
function HomeTab({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "🌅 शुभ प्रभात, किसान भाई!";
    if (h < 17) return "☀️ नमस्ते, किसान भाई!";
    return "🌙 शुभ संध्या, किसान भाई!";
  });

  return (
    <div className="min-h-full bg-[#0a1a0a] relative overflow-hidden">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-20 px-4 pt-3 pb-2.5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          background: "linear-gradient(180deg, rgba(10,26,10,0.98) 0%, rgba(10,26,10,0.95) 100%)",
          borderBottom: "1px solid rgba(249,168,37,0.15)",
          backdropFilter: "blur(16px)",
        }}>
        {/* Greeting strip */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/55 text-[10px] font-bold tracking-wide">{greeting}</span>
          <div className="flex items-center gap-1 text-[10px] font-black text-red-400">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            खरीफ 2026 LIVE
          </div>
        </div>

        {/* Brand Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-2xl overflow-hidden flex-shrink-0"
              style={{ border: "2px solid rgba(249,168,37,0.6)", boxShadow: "0 0 12px rgba(249,168,37,0.4)" }}>
              <img src={logoPath} alt="Logo" className="w-11 h-11 object-cover" />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-black text-sm leading-tight"
                style={{ background: "linear-gradient(90deg, #F9A825, #FFD54F, #F9A825)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "200%", animation: "shimmer 3s linear infinite" }}>
                ANNADATA AGRI & SEEDS
              </motion.div>
              <div className="text-white/45 text-[9px] flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#F9A825]" />
                Salamatpur, Raisen • Keshav Bhai
              </div>
            </div>
          </div>
          <motion.a
            href={waLink("नमस्ते Keshav Bhai! 🙏")}
            target="_blank" rel="noreferrer"
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "0 0 14px rgba(37,211,102,0.6)" }}>
            <FaWhatsapp className="w-5 h-5 text-white" />
          </motion.a>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F9A825]/50" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="💦 First Spray, दवाई, रोग और कीट सलाह खोजें..."
            className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none transition-colors"
            style={{ background: "rgba(249,168,37,0.07)", border: "1.5px solid rgba(249,168,37,0.2)" }}
            onFocus={e => (e.target.style.borderColor = "rgba(249,168,37,0.6)")}
            onBlur={e => (e.target.style.borderColor = "rgba(249,168,37,0.2)")}
          />
        </div>
      </div>

      <div className="px-4 pb-24 space-y-5 pt-4 relative z-10">

        {/* ── HERO BANNER ── Full-width stacked layout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-visible bg-white shadow-lg relative"
          style={{ border: "1.5px solid rgba(22,101,52,0.15)" }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full rounded-t-2xl" style={{ background: "linear-gradient(90deg, #15803d 0%, #F9A825 50%, #15803d 100%)" }} />

          {/* ── FULL-WIDTH IMAGE with overlays ── */}
          <div className="relative w-full overflow-hidden rounded-t-xl"
            style={{ background: "linear-gradient(160deg,#e8f5e9,#f1f8e9)" }}>
            <img
              src={shopImg1}
              alt="Keshav Meena — Annadata Agri Shop"
              className="w-full block"
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />


            {/* Top-left: crop tag */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-3 left-3 bg-green-700 text-white rounded-full px-3 py-1.5 text-[10px] font-black flex items-center gap-1.5 shadow-lg z-20">
              <Sprout className="w-3 h-3" />
              <span className="font-hindi">धान रोपाई • First Spray</span>
            </motion.div>

            {/* Bottom gradient with shop name */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10"
              style={{ background: "linear-gradient(to top, rgba(5,46,22,0.85) 0%, rgba(5,46,22,0.35) 60%, transparent 100%)" }}>
              <div className="font-black text-white text-xs tracking-widest uppercase drop-shadow">ANNADATA AGRI &amp; SEEDS</div>
              <div className="font-hindi text-white/75 text-[10px] mt-0.5">रायसेन रोड, सलामतपुर, जि. रायसेन</div>
            </div>
          </div>

          {/* ── TEXT + CTAs below image ── */}
          <div className="px-4 pt-4 pb-4 space-y-3 bg-white rounded-b-2xl">
            {/* Live season badge */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
              <span className="text-red-500 text-[9px] font-black uppercase tracking-widest">खरीफ 2026 LIVE</span>
            </div>

            {/* Heading */}
            <div>
              <div className="text-gray-800 font-black text-[17px] leading-tight font-hindi">
                धान रोपाई और<br />
                <span className="text-green-700">First Spray की सही सलाह</span>
              </div>
              <div className="text-gray-500 text-[11px] font-hindi mt-1 leading-snug">
                धान रोपाई • First Spray • रोग नियंत्रण • कीट नियंत्रण
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-1.5">
              <a href={`tel:${PHONE_SHORT}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-hindi font-black text-[11px] text-white"
                style={{ background: "#15803d", boxShadow: "0 3px 12px rgba(21,128,61,0.35)" }}>
                <Phone className="w-3.5 h-3.5" /> Call Now — {PHONE_SHORT}
              </a>
              <div className="grid grid-cols-2 gap-1.5">
                <a href={waLink("नमस्ते Keshav Bhai! धान में First Spray और दवाई की सलाह चाहिए।")}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-1 py-2 rounded-xl font-hindi font-black text-[10px] text-white"
                  style={{ background: "#25D366", boxShadow: "0 3px 10px rgba(37,211,102,0.35)" }}>
                  <FaWhatsapp className="w-3 h-3" /> WhatsApp
                </a>
                <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-1 py-2 rounded-xl font-hindi font-black text-[10px] text-yellow-700 border-2 border-yellow-400 bg-yellow-50">
                  <MapPin className="w-3 h-3" /> Google Map
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── LIVE STOCK ALERT ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative rounded-2xl overflow-hidden px-4 py-4"
          style={{ background: "linear-gradient(135deg, #0d3320 0%, #155a2e 50%, #0a2518 100%)" }}>
          <div
            className="absolute inset-0 rounded-2xl animate-pulse"
            style={{ border: "1.5px solid rgba(249,168,37,0.5)", pointerEvents: "none" }}
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 animate-pulse" />
                <span className="text-red-400 text-[10px] font-black uppercase tracking-wider">FIRST SPRAY GUIDANCE</span>
              </div>
              <div className="text-white font-black text-base leading-snug mb-1">
                धान First Spray<br />
                <span className="text-[#F9A825]">सलाह उपलब्ध है!!</span>
              </div>
             <div className="text-white/55 text-xs mb-3 flex flex-wrap gap-1">
              {["First Spray", "खरपतवार नियंत्रण", "कीट नियंत्रण", "फोटो भेजकर सलाह"].map(t => (
                <span key={t} className="bg-white/8 px-2 py-0.5 rounded-full text-[10px] font-bold">{t}</span>
               ))}
             </div>
              <a href={waLink("नमस्ते Keshav Bhai! 🌾 खरीफ सीजन 2026 का stock देखना है। बीज और दवाई की जानकारी दें।")}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-white text-xs font-black px-4 py-2.5 rounded-xl"
                style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.5)" }}>
                <FaWhatsapp className="w-3.5 h-3.5" /> सलाह लें
              </a>
            </div>
            <div className="text-4xl flex-shrink-0 mt-1">🌾</div>
          </div>
        </motion.div>

        {/* ── QUICK ACTION 4 BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-4 gap-2">
          {[
            { label: "Call", sub: "6261737388", emoji: "📞", color: "#16a34a", href: `tel:${PHONE_SHORT}` },
            { label: "WhatsApp", sub: "तुरंत जवाब", emoji: "💬", color: "#25D366", href: waLink("नमस्ते Keshav Bhai!") },
            { label: "Location", sub: "दुकान देखें", emoji: "📍", color: "#F9A825", href: MAPS_LINK },
            { label: "Gallery", sub: "Photos", emoji: "📸", color: "#e1306c", isTab: true, tab: "gallery" as Tab },
          ].map((btn, i) => (
            <motion.div key={btn.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.06 }}>
              {btn.isTab ? (
                <button onClick={() => onTabChange(btn.tab!)}
                  className="w-full flex flex-col items-center gap-1.5 py-3.5 rounded-2xl active:scale-90 transition-all"
                  style={{ background: `${btn.color}18`, border: `1.5px solid ${btn.color}35` }}>
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-white text-[9px] font-black leading-tight text-center">{btn.label}</span>
                  <span className="text-white/35 text-[8px] leading-none">{btn.sub}</span>
                </button>
              ) : (
                <a href={btn.href} target={btn.href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl active:scale-90 transition-all"
                  style={{ background: `${btn.color}18`, border: `1.5px solid ${btn.color}35` }}>
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-white text-[9px] font-black leading-tight text-center">{btn.label}</span>
                  <span className="text-white/35 text-[8px] leading-none text-center">{btn.sub}</span>
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ── CROP CATEGORY CARDS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-black text-sm">🌾 फसल चुनें</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange("products")}
              className="text-[#F9A825] text-xs font-bold flex items-center gap-0.5">
              सभी देखें <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[{ name: "धान रोपाई", emoji: "🌾", desc: "रोपाई की सही जानकारी", color: "#22c55e", badge: "LIVE", hot: true },
             { name: "First Spray", emoji: "💦", desc: "15-20 दिन बाद सही स्प्रे", color: "#38bdf8", badge: "NOW", hot: true },
             { name: "खरपतवार", emoji: "🌱", desc: "घास नियंत्रण सलाह", color: "#84cc16", badge: "GUIDE", hot: true },
             { name: "रोग/कीट", emoji: "🐛", desc: "फोटो भेजकर सलाह", color: "#f97316", badge: "HELP", hot: true },
            ].map((crop, i) => (
              <motion.button key={crop.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => onTabChange("products")}
                className="text-left p-4 rounded-2xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${crop.color}18 0%, ${crop.color}08 100%)`,
                  border: `1.5px solid ${crop.color}35`,
                  boxShadow: crop.hot ? `0 4px 20px ${crop.color}20` : "none",
                }}>
                {crop.hot && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
                    style={{ border: `1px solid ${crop.color}50` }}
                  />
                )}
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: crop.color }}>{crop.badge}</span>
                <div className="text-3xl mb-2">{crop.emoji}</div>
                <div className="text-white font-black text-sm">{crop.name}</div>
                <div className="text-white/45 text-[10px] mt-0.5 leading-tight">{crop.desc}</div>
                <div className="mt-2 text-[10px] font-bold flex items-center gap-1" style={{ color: crop.color }}>
                  देखें <ChevronRight className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── CROP CHIPS ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}>
          <div className="text-white font-black text-sm mb-3">💦 अपनी समस्या चुनें</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "First Spray", emoji: "💦", color: "#22c55e" },
              { label: "खरपतवार", emoji: "🌿", color: "#84cc16" },
              { label: "कीट रोग", emoji: "⸙", color: "#fb923c" },
              { label: "ग्रोथ", emoji: "🌾", color: "#f59e0b" },
            ].map((cat, i) => (
              <motion.button key={cat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.47 + i * 0.05 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => onTabChange("products")}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl"
                style={{ background: `${cat.color}14`, border: `1.5px solid ${cat.color}30` }}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[9px] font-black text-white/80 leading-tight text-center">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── FREE DELIVERY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #071a0e 0%, #0c2b17 100%)", border: "2px solid rgba(249,168,37,0.4)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(249,168,37,0.12)" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏠</span>
              <div>
                <div className="text-[#F9A825] font-black text-sm leading-tight">घर तक मँगाएं!</div>
                <div className="text-white/45 text-[10px]">FREE Delivery — WhatsApp Order</div>
              </div>
            </div>
            <div className="bg-[#F9A825] text-black text-[9px] font-black px-2.5 py-1 rounded-full">
              🚚 FREE
            </div>
          </div>
          <div className="grid grid-cols-3 px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { icon: "✅", text: "असली बीज\nगारंटी" },
              { icon: "⚡", text: "तुरंत\nConfirm" },
              { icon: "📦", text: "सुरक्षित\nPacking" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/55 text-[10px] leading-tight whitespace-pre-line font-bold">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 pt-3 flex gap-2">
            <a href={waLink("नमस्ते Keshav Bhai! 🏠 *घर तक Delivery* चाहिए। कृपया product और price बताएं।")}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-black text-sm rounded-2xl"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 6px 20px rgba(37,211,102,0.5)" }}>
              <FaWhatsapp className="w-4 h-4" /> Order on WhatsApp
            </a>
            <a href={`tel:${PHONE_SHORT}`}
              className="w-14 flex items-center justify-center rounded-2xl"
              style={{ background: "rgba(249,168,37,0.15)", border: "1.5px solid rgba(249,168,37,0.3)" }}>
              <Phone className="w-5 h-5 text-[#F9A825]" />
            </a>
          </div>
        </motion.div>

        {/* ── KESHAV BHAI ADVICE BUTTON ── */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onTabChange("advice")}
          className="w-full py-4 rounded-2xl flex items-center justify-between px-4"
          style={{ background: "linear-gradient(135deg, #112211 0%, #1a3a1a 50%, #0f2a0f 100%)", border: "1.5px solid rgba(249,168,37,0.35)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(249,168,37,0.18)", border: "1.5px solid rgba(249,168,37,0.4)" }}>
              <Lightbulb className="w-5 h-5 text-[#F9A825]" />
            </div>
            <div className="text-left">
              <div className="text-white font-black text-sm">Keshav Bhai से सलाह लो 🙏</div>
              <div className="text-white/45 text-[10px] mt-0.5">फसल • दवाई • बीज — Free Expert Guidance</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#F9A825]" />
        </motion.button>

        {/* ── STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2">
          {[
            { val: "200+", label: "किसान भाई", icon: "👨‍🌾", color: "#22c55e" },
            { val: "4.9★", label: "Google Rating", icon: "⭐", color: "#F9A825" },
            { val: "1", label: "साल अनुभव", icon: "🏆", color: "#a78bfa" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.62 + i * 0.07 }}
              className="rounded-2xl p-3 text-center"
              style={{ background: `${s.color}10`, border: `1.5px solid ${s.color}25` }}>
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="font-black text-base" style={{ color: s.color }}>{s.val}</div>
              <div className="text-white/45 text-[9px] leading-tight font-bold">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── SOCIAL MEDIA ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}>
          <div className="text-white/45 text-[10px] font-black uppercase tracking-widest text-center mb-3">📱 Social Media Follow करें</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "@lifeofkeshavmeena", sub: "45+ Followers", color: "#e1306c", icon: <FaInstagram className="w-4 h-4" />, href: "https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" },
              { label: "Facebook Page", sub: "31K+ Likes", color: "#1877f2", icon: <FaFacebook className="w-4 h-4" />, href: "https://www.facebook.com/share/1NNq1tBFvf/?mibextid=wwXIfr" },
              { label: "YouTube Channel", sub: "8.7K+ Subscribers", color: "#ff0000", icon: <FaYoutube className="w-4 h-4" />, href: "https://youtube.com/@keshavmeena2912?si=pB_hKbc32HgS1aWt" },
            ].map((s, i) => (
              <motion.a key={s.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.67 + i * 0.06 }}
                href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl active:scale-95 transition-all"
                style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}30` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[10px] font-black truncate">{s.label}</div>
                  <div className="text-white/40 text-[9px] font-bold">{s.sub}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── TRUST TAGLINE ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-center py-3 px-4 rounded-2xl"
          style={{ background: "rgba(249,168,37,0.06)", border: "1px solid rgba(249,168,37,0.15)" }}>
          <div className="text-[#F9A825] font-black text-sm">🌾 जय जवान जय किसान 🌾</div>
          <div className="text-white/35 text-[10px] mt-1">किसान की मुस्कान — हमारी पहचान</div>
        </motion.div>

        {/* Developed by */}
        <div className="pb-2 flex flex-col items-center gap-1">
          <div className="w-16 h-px bg-white/8 rounded-full mb-1" />
          <a href="https://www.instagram.com/priyamxmedia" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-white/25 text-[9px] hover:text-white/45 transition-colors">
            <span>⚡</span>
            <span>Developed by</span>
            <span className="text-[#e1306c]/50 font-bold">@priyamxmedia</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCTS TAB
═══════════════════════════════════════════════ */
function ProductsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [crop, setCrop] = useState("All");
  const [selected, setSelected] = useState<typeof PRODUCTS[0] | null>(null);

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    const matchCrop = crop === "All" || p.crop === crop || p.crop === "All";
    return matchSearch && matchCat && matchCrop;
  });

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1f0d] border-b border-white/8 px-4 pt-3 pb-3 space-y-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <div className="flex items-center gap-2">
          <div className="text-[#F9A825] font-bold text-lg">🌿 उत्पाद</div>
          <span className="ml-auto text-white/40 text-xs">{filtered.length} products</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="उत्पाद खोजें..."
            className="w-full bg-white/8 border border-white/12 rounded-2xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#F9A825]/50" />
        </div>
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${category === c ? "bg-[#16a34a] text-white" : "bg-white/8 text-white/50 border border-white/10"}`}>
              {c === "All" ? "सभी" : c}
            </button>
          ))}
        </div>
        {/* Crop Filter */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {CROPS.map(c => (
            <button key={c} onClick={() => setCrop(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${crop === c ? "bg-[#F9A825] text-black" : "bg-white/8 text-white/50 border border-white/10"}`}>
              {c === "All" ? "सभी फसल" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {filtered.map(p => (
          <button key={p.id} onClick={() => setSelected(p)}
            className="text-left p-3.5 rounded-2xl bg-white/5 border border-white/10 transition-all active:scale-95 relative overflow-hidden">
            {p.badge && (
              <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                style={{ background: p.badgeColor }}>{p.badge}</span>
            )}
            <div className="text-2xl mb-2">{p.emoji}</div>
            <div className="text-white font-bold text-xs leading-tight mb-1">{p.name}</div>
            <div className="text-white/40 text-[10px] leading-tight mb-2">{p.desc}</div>
            <div className="flex items-center justify-between">
              <span className="text-[#F9A825] text-[10px] font-bold">{p.price}</span>
              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{p.category}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-white/40 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            कोई उत्पाद नहीं मिला
          </div>
        )}
      </div>

      {/* Product Detail Bottom Sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
              style={{ background: "#0f2a0f", borderTop: "1px solid rgba(249,168,37,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/8 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    {selected.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg leading-tight">{selected.name}</div>
                    <div className="text-white/50 text-xs mt-0.5">{selected.nameEn}</div>
                    {selected.badge && (
                      <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: selected.badgeColor }}>{selected.badge}</span>
                    )}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/40 mt-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="text-white/70 text-sm leading-relaxed">{selected.desc}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                    <span className="bg-white/8 px-2 py-1 rounded-lg">{selected.category}</span>
                    <span className="bg-white/8 px-2 py-1 rounded-lg">{selected.crop}</span>
                  </div>
                </div>
                <a href={waLink(`नमस्ते Keshav Bhai! मुझे "${selected.name}" के बारे में जानकारी चाहिए। कीमत और उपलब्धता बताएं।`)}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold text-base rounded-2xl"
                  style={{ boxShadow: "0 6px 20px rgba(37,211,102,0.35)" }}>
                  <FaWhatsapp className="w-5 h-5" /> WhatsApp पर Enquiry करें
                </a>
                <a href={`tel:${PHONE_SHORT}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-white/8 text-white font-bold text-sm rounded-2xl border border-white/12">
                  <Phone className="w-4 h-4 text-[#F9A825]" /> Call: {PHONE_SHORT}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FASAL CALENDAR (shared component)
═══════════════════════════════════════════════ */
function FasalCalendar() {
  const currentMonth = new Date().getMonth();
  const months = [
    {
      name: "जून", emoji: "🌧️",
      items: [
        { label: "धान नर्सरी तैयारी", tip: "नर्सरी डालने का सही समय — बीज दर और मिट्टी तैयारी। Keshav Bhai से बीज उपचार सलाह लें।" },
        { label: "1886 / PB1 Variety बुकिंग", tip: "इस सीजन की टॉप variety — अभी बुक करें। सीमित स्टॉक है।" },
        { label: "सोयाबीन बुवाई तैयारी", tip: "जून अंत में JS-335, NRC-86 की बुवाई करें। बीज उपचार जरूर करें।" },
      ]
    },
    {
      name: "जुलाई", emoji: "🌱",
      items: [
        { label: "धान रोपाई (Transplanting)", tip: "रोपाई का सही समय और पौधे से पौधे की दूरी — Keshav Bhai से सलाह लें।" },
        { label: "सोयाबीन First Spray", tip: "बुवाई के 15–20 दिन बाद खरपतवार नाशक और पहला Spray करें।" },
        { label: "Growth Guidance", tip: "पौधे की बढ़वार के लिए सही बीज variety और उचित देखभाल।" },
      ]
    },
    {
      name: "अगस्त", emoji: "🔍",
      items: [
        { label: "रोग पहचान", tip: "पत्ता पीला, जड़ सड़न, कीट — WhatsApp पर फोटो भेजकर सलाह लें।" },
        { label: "धान Crop Health Check", tip: "ब्लास्ट, शीथ ब्लाइट से बचाव — Keshav Bhai से WhatsApp करें।" },
        { label: "सोयाबीन रोग नियंत्रण", tip: "पीला मोज़ेक, Circospora Leaf Spot — तुरंत Keshav Bhai से सलाह लें।" },
      ]
    },
    {
      name: "सितंबर", emoji: "🌾",
      items: [
        { label: "धान पकाव सुधार", tip: "दाना भराई और पकाव बढ़ाने के उपाय — सही समय पर सलाह जरूरी।" },
        { label: "सोयाबीन पकाव सलाह", tip: "सोयाबीन में दाना भरने के समय उचित देखभाल करें।" },
        { label: "Crop Health Check", tip: "WhatsApp पर फोटो भेजें — Keshav Bhai से निःशुल्क सलाह।" },
      ]
    },
    {
      name: "अक्टूबर-नवंबर", emoji: "🚜",
      items: [
        { label: "धान कटाई तैयारी", tip: "कटाई का सही समय और मशीन की व्यवस्था — Keshav Bhai से पूछें।" },
        { label: "रबी सीजन तैयारी", tip: "गेहूं-चना बीज की बुकिंग अभी से करें। सीमित स्टॉक।" },
        { label: "घर से धान उठवाई", tip: "Annadata की धान उठवाई सेवा — WhatsApp पर संपर्क करें।" },
      ]
    },
    {
      name: "रबी सीजन", emoji: "🫘",
      items: [
        { label: "गेहूं बीज बुकिंग", tip: "GW-322, HI-8498 — Keshav Bhai की पसंदीदा variety। अभी बुक करें।" },
        { label: "चना बीज", tip: "JG-14, Vikas — देसी व काबुली चना। अक्टूबर-नवंबर में बुवाई उत्तम।" },
        { label: "Spray Guidance", tip: "रबी फसल की उचित देखभाल — Keshav Bhai से पूरा guidance लें।" },
      ]
    },
  ];

  const defaultTab = currentMonth === 5 ? 0 : currentMonth === 6 ? 1 : currentMonth === 7 ? 2
    : currentMonth === 8 ? 3 : (currentMonth === 9 || currentMonth === 10) ? 4 : 5;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const changeTab = (idx: number) => { setActiveTab(idx); setExpandedItem(null); };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(249,168,37,0.2)" }}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📅</span>
          <span className="text-white font-black text-sm">फसल कैलेंडर 2026</span>
          <span className="text-white/40 text-[9px] ml-auto font-bold">महीना tap करें</span>
        </div>
        {/* Month tabs — horizontal scroll */}
        <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {months.map((m, i) => (
            <button key={i} onClick={() => changeTab(i)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black transition-all"
              style={activeTab === i
                ? { background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", boxShadow: "0 2px 12px rgba(34,197,94,0.4)" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
              }>
              <span>{m.emoji}</span>{m.name}
            </button>
          ))}
        </div>
      </div>
      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              if (diff > 0) changeTab(Math.min(activeTab + 1, months.length - 1));
              else changeTab(Math.max(activeTab - 1, 0));
            }
          }}
          className="px-4 pb-4 space-y-2">
          {months[activeTab].items.map((item, j) => (
            <div key={j} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setExpandedItem(expandedItem === j ? null : j)}
                className="w-full flex items-center justify-between px-3.5 py-3 text-left active:bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,197,94,0.15)" }}>
                    <span className="text-xs">🌱</span>
                  </div>
                  <span className="text-white text-xs font-bold">{item.label}</span>
                </div>
                <motion.div animate={{ rotate: expandedItem === j ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4 text-[#F9A825] flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedItem === j && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-3.5 pt-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-white/60 text-xs leading-relaxed mt-2.5 mb-3">{item.tip}</p>
                      <a href={waLink(`🌾 *Annadata — फसल कैलेंडर Enquiry*\n\n📅 महीना: ${months[activeTab].name}\n📌 विषय: ${item.label}\n\nKeshav Bhai, इस बारे में सलाह चाहिए।`)}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-white text-[10px] font-black px-3 py-1.5 rounded-full"
                        style={{ background: "#25D366", boxShadow: "0 2px 8px rgba(37,211,102,0.4)" }}>
                        <FaWhatsapp className="w-3 h-3" /> Keshav Bhai से पूछें
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {/* Swipe dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {months.map((_, i) => (
              <button key={i} onClick={() => changeTab(i)}
                className="rounded-full transition-all duration-300"
                style={activeTab === i
                  ? { width: 20, height: 6, background: "#22c55e" }
                  : { width: 6, height: 6, background: "rgba(255,255,255,0.2)" }
                } />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GALLERY TAB
═══════════════════════════════════════════════ */
function GalleryTab() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const shopPhotos = [
    { src: shopImg1, caption: "दुकान — अन्नदाता एग्री & सीड्स" },
    { src: shopImg2, caption: "बीज व दवाई का स्टॉक" },
    { src: shopImg3, caption: "Keshav Bhai की दुकान" },
    { src: shopImg4, caption: "किसान भाइयों के साथ" },
  ];

  const offers = [
    {
      title: "🔥 खरीफ 2026 — New Stock",
      items: ["1886 हाइब्रिड धान — नई लॉट", "PB1 धान बीज", "JS-335 सोयाबीन — ताज़ा स्टॉक", "JS-9305 सोयाबीन"],
      color: "#16a34a", badge: "NEW STOCK"
    },
    {
      title: "⭐ Best Sellers इस सीजन",
      items: ["1886 हाइब्रिड धान बीज", "गेहूं बीज — रबी सीजन", "चना बीज — JG-14 Vikas", "JS-335 सोयाबीन बीज"],
      color: "#F9A825", badge: "POPULAR"
    },
    {
      title: "🚀 Special Deals",
      items: ["घर तक FREE Delivery", "2+ पैकेट पर विशेष छूट", "धान बीज Early Booking Discount", "Keshav Bhai की Free Expert Guidance"],
      color: "#7c3aed", badge: "LIMITED"
    },
  ];

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      <div className="px-4 pt-4 pb-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">📸 गैलरी & ऑफर</div>
        <div className="text-white/40 text-xs">दुकान की Photos • आज के ऑफर</div>
      </div>

      <div className="px-4 pb-6 space-y-5">

        {/* Shop Photo Grid */}
        <div>
          <div className="text-white font-bold text-sm mb-3">🏪 हमारी दुकान</div>
          <div className="grid grid-cols-2 gap-2">
            {shopPhotos.map((photo, i) => (
              <motion.button key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setLightbox(photo.src)}
                className="relative rounded-2xl overflow-hidden aspect-square active:scale-95 transition-all"
                style={{ border: "1px solid rgba(249,168,37,0.2)" }}>
                <img src={photo.src} alt={photo.caption}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold leading-tight">
                  {photo.caption}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Instagram CTA — @lifeofkeshavmeena only */}
        <a href="https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #405de6, #833ab4, #c13584, #e1306c)", border: "none" }}>
          <FaInstagram className="w-7 h-7 text-white flex-shrink-0" />
          <div className="flex-1">
            <div className="text-white font-bold text-sm">45K+ Followers</div>
            <div className="text-white/80 text-xs">@lifeofkeshavmeena — Keshav Bhai की Life</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0" />
        </a>

        {/* Social Media Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Facebook", sub: "31K+", color: "#1877f2", icon: <FaFacebook className="w-5 h-5" />, href: "https://www.facebook.com/share/1NNq1tBFvf/?mibextid=wwXIfr" },
            { label: "YouTube", sub: "8.7K+", color: "#ff0000", icon: <FaYoutube className="w-5 h-5" />, href: "https://youtube.com/@keshavmeena2912?si=pB_hKbc32HgS1aWt" },
            { label: "WhatsApp", sub: "Order", color: "#25D366", icon: <FaWhatsapp className="w-5 h-5" />, href: waLink("नमस्ते Keshav Bhai! मुझे order करना है।") },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl active:scale-95 transition-all"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <div className="text-center">
                <div className="text-white text-[10px] font-bold">{s.label}</div>
                <div className="text-white/50 text-[9px]">{s.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Live Offer Banner */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #16532d, #0f3d1f)", border: "1px solid rgba(249,168,37,0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold">🔴 LIVE OFFER</span>
          </div>
          <div className="text-white font-bold text-base mb-1">🌾 खरीफ सीजन SALE चल रहा है!</div>
          <div className="text-white/60 text-xs mb-3">धान & सोयाबीन बीज पर विशेष छूट — आज ही Order करें</div>
          <a href={waLink("नमस्ते Keshav Bhai! खरीफ सीजन के best offers बताएं।")} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <FaWhatsapp className="w-3.5 h-3.5" /> ऑफर के बारे में पूछें
          </a>
        </div>

        {/* Offer Cards */}
        {offers.map((offer, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: `${offer.color}10`, border: `1px solid ${offer.color}25` }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${offer.color}15` }}>
              <div className="text-white font-bold text-sm">{offer.title}</div>
              <span className="text-[9px] font-black px-2 py-1 rounded-full text-white" style={{ background: offer.color }}>
                {offer.badge}
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {offer.items.map((item, j) => (
                <div key={j} className="flex items-center gap-2 text-white/70 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: offer.color }} />
                  {item}
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <a href={waLink(`नमस्ते Keshav Bhai! "${offer.title}" के बारे में जानना चाहता हूँ।`)}
                target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold"
                style={{ background: offer.color }}>
                <FaWhatsapp className="w-3.5 h-3.5" /> Enquiry करें
              </a>
            </div>
          </motion.div>
        ))}

        {/* Fasal Calendar — Interactive */}
        <FasalCalendar />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white">
              <X className="w-7 h-7" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={lightbox} alt="Photo"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADVICE TAB
═══════════════════════════════════════════════ */
function AdviceTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cropAdvice = [
    {
      crop: "🌾 धान (Dhan)", color: "#16a34a",
      tips: ["बुवाई से पहले बीज उपचार जरूर करें", "First Spray — 15-20 दिन बाद", "ब्लास्ट रोग: Fungicide Spray करें", "BPH कीट: Insecticide + पानी का छिड़काव"]
    },
    {
      crop: "🌿 सोयाबीन", color: "#a3e635",
      tips: ["बुवाई — जून मध्य के बाद करें", "Rhizobium Culture से उपज 20% बढ़ती है", "Yellow Mosaic Virus: रोगग्रस्त पौधे हटाएं", "Stem Fly: Systemic Insecticide लगाएं"]
    },
    {
      crop: "🌾 गेहूं (Gehu)", color: "#f59e0b",
      tips: ["अक्टूबर-नवंबर में बुवाई उत्तम", "पहली सिंचाई 20-25 दिन में", "गेरुआ रोग पर Fungicide जरूरी", "कटाई से पहले खेत सूखा रखें"]
    },
    {
      crop: "🫘 चना (Chana)", color: "#fb923c",
      tips: ["अक्टूबर-नवंबर में बुवाई", "JG-14 / Vikas variety चुनें", "उकठा रोग: Resistant Variety सबसे अच्छा", "कटाई — फलियां पक जाने पर"]
    },
  ];

  const faqs = [
    { q: "कौन सा धान बीज सबसे अच्छा है?", a: "1886 हाइब्रिड धान सबसे ज्यादा लोकप्रिय है — उच्च उपज, रोग प्रतिरोधी। PB1 भी अच्छा विकल्प है। अपने खेत की मिट्टी और पानी के हिसाब से Keshav Bhai से सलाह लें।" },
    { q: "First Spray कब और क्या दें?", a: "धान में रोपाई के 15-20 दिन बाद First Spray करें। Fungicide + Insecticide का Combo दें। सही दवाई और मात्रा के लिए WhatsApp करें।" },
    { q: "सोयाबीन में पीली पत्ती क्यों आती है?", a: "Yellow Mosaic Virus, आयरन की कमी, या Whitefly के कारण पत्तियां पीली होती हैं। तुरंत नमूना लेकर Keshav Bhai को दिखाएं।" },
    { q: "खाद कितनी डालें?", a: "DAP — 50 kg/एकड़ बुवाई पर। यूरिया — 25-30 kg/एकड़ दो बार में। फसल और मिट्टी के अनुसार मात्रा बदल सकती है।" },
    { q: "घर तक डिलीवरी मिलती है?", a: "हां! WhatsApp पर Order करें — Keshav Bhai आपके घर तक बीज, दवाई और खाद पहुंचाते हैं।" },
  ];

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">💡 कृषि सलाह</div>
        <div className="text-white/40 text-xs">Keshav Bhai की expert guidance</div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Photo Bhejo CTA */}
        <a href={waLink("नमस्ते Keshav Bhai! मेरी फसल में समस्या है। फोटो भेज रहा हूँ — कृपया सलाह दें।")}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #0f2a1a, #16532d)", border: "1px solid rgba(37,211,102,0.3)" }}>
          <div className="w-12 h-12 bg-[#25D366]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📸</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">फोटो भेजकर सलाह लो</div>
            <div className="text-white/50 text-xs mt-0.5">फसल की फोटो WhatsApp पर भेजें — तुरंत जवाब</div>
          </div>
          <FaWhatsapp className="w-6 h-6 text-[#25D366] flex-shrink-0" />
        </a>

        {/* Crop-wise Advice */}
        <div>
          <div className="text-white font-bold text-sm mb-3">🌱 फसल-वार सुझाव</div>
          <div className="space-y-3">
            {cropAdvice.map((ca, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: `${ca.color}10`, border: `1px solid ${ca.color}20` }}>
                <button className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setOpenFaq(openFaq === -i - 1 ? null : -i - 1)}>
                  <span className="text-white font-bold text-sm">{ca.crop}</span>
                  {openFaq === -i - 1
                    ? <ChevronUp className="w-4 h-4 text-white/40" />
                    : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {openFaq === -i - 1 && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div className="px-4 pb-3 space-y-2">
                        {ca.tips.map((tip, j) => (
                          <div key={j} className="flex items-start gap-2 text-white/70 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ca.color }} />
                            {tip}
                          </div>
                        ))}
                        <a href={waLink(`नमस्ते Keshav Bhai! ${ca.crop} के बारे में सलाह चाहिए।`)}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 mt-2 text-[#25D366] text-xs font-bold">
                          <FaWhatsapp className="w-3 h-3" /> और जानकारी के लिए WhatsApp करें
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-white font-bold text-sm mb-3">❓ अक्सर पूछे जाने वाले सवाल</div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white/80 text-xs font-bold flex-1">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div className="px-4 pb-3 text-white/60 text-xs leading-relaxed border-t border-white/8 pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="flex gap-2">
          <a href={waLink("नमस्ते Keshav Bhai! मुझे फसल की सलाह चाहिए।")} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold text-sm rounded-2xl">
            <FaWhatsapp className="w-4 h-4" /> WhatsApp सलाह
          </a>
          <a href={`tel:${PHONE_SHORT}`}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/8 text-white font-bold text-sm rounded-2xl border border-white/12">
            <Phone className="w-4 h-4 text-[#F9A825]" /> Call करें
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT TAB
═══════════════════════════════════════════════ */
function ContactTab() {
  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="px-4 pt-4 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">📞 संपर्क करें</div>
        <div className="text-white/40 text-xs">Keshav Bhai से सीधे बात करें</div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Call करें", sublabel: PHONE_SHORT, emoji: "📞", href: `tel:${PHONE_SHORT}`, bg: "#16a34a", textColor: "white" },
            { label: "WhatsApp", sublabel: "तुरंत जवाब", emoji: "💬", href: waLink("नमस्ते Keshav Bhai!"), bg: "#25D366", textColor: "white" },
            { label: "Google Maps", sublabel: "दुकान का रास्ता", emoji: "📍", href: MAPS_LINK, bg: "rgba(255,255,255,0.07)", textColor: "white", border: "rgba(255,255,255,0.12)" },
            { label: "Review दें", sublabel: "Google Rating", emoji: "⭐", href: GOOGLE_REVIEW_LINK, bg: "rgba(255,255,255,0.07)", textColor: "white", border: "rgba(255,255,255,0.12)" },
          ].map((btn) => (
            <a key={btn.label} href={btn.href} target={btn.href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer"
              className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all active:scale-95"
              style={{
                background: btn.bg,
                border: btn.border ? `1px solid ${btn.border}` : undefined,
              }}>
              <span className="text-2xl">{btn.emoji}</span>
              <div className="text-center">
                <div className="text-white font-bold text-sm">{btn.label}</div>
                <div className="text-white/50 text-[10px]">{btn.sublabel}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Shop Info Card */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-3">
          <div className="text-white font-bold text-sm">🏪 दुकान की जानकारी</div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#F9A825] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">Annadata Agri & Seeds</div>
              <div className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Raisen Road, Trimurti Chouraha<br />
                Salamatpur, Dist. Raisen, M.P.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#F9A825] flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">दुकान समय</div>
              <div className="text-white/60 text-xs">सोम–रवि: सुबह 8 बजे – शाम 8 बजे</div>
              <div className="text-white/40 text-[10px]">सातों दिन खुला रहता है</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-[#F9A825] flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">Google Rating: 4.9 ⭐</div>
              <div className="text-white/60 text-xs">200+ Happy Farmers</div>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(249,168,37,0.25)" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div className="text-white font-bold text-sm">📍 दुकान का Location</div>
              <div className="text-white/40 text-[10px]">Trimurti Chouraha, Salamatpur, Raisen</div>
            </div>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[#F9A825] text-[10px] font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(249,168,37,0.12)", border: "1px solid rgba(249,168,37,0.2)" }}>
              <MapPin className="w-3 h-3" /> Navigate
            </a>
          </div>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3665.3!2d77.7666!3d23.1099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c4287b5b5e4ef%3A0xd00f8d8a8b9215cf!2sAnnadata%20Agri%20%26%20Seeds!5e0!3m2!1sen!2sin!4v1686000000000!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Annadata Agri & Seeds Location"
            />
          </div>
          <a href={MAPS_LINK} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 text-white font-bold text-xs"
            style={{ background: "#4285F4" }}>
            <MapPin className="w-3.5 h-3.5" /> Google Maps पर खोलें — Directions लें
          </a>
        </div>

        {/* WhatsApp Enquiry Form */}
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <div className="bg-[#25D366]/15 px-4 py-3 border-b border-white/8">
            <div className="text-white font-bold text-sm">📝 Enquiry Form</div>
            <div className="text-white/50 text-xs">नाम • मोबाइल • गांव • फसल — सब भरें</div>
          </div>
          <EnquiryForm />
        </div>

        {/* Customer Reviews */}
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <div className="px-4 py-3 border-b border-white/8">
            <div className="text-white font-bold text-sm">⭐ किसान भाइयों के Review</div>
            <div className="text-white/40 text-[10px]">4.9 ★ Google Rating • 200+ Customers</div>
          </div>
          <div className="px-4 py-3 space-y-3">
            {[
              { name: "रामप्रसाद पटेल", village: "बरेली, रायसेन", text: "1886 धान बीज से इस बार बहुत अच्छी उपज हुई। Keshav Bhai ने सही समय पर सही सलाह दी। ✅", stars: 5 },
              { name: "महेश कुमार वर्मा", village: "सलामतपुर, रायसेन", text: "WhatsApp पर order किया और अगले दिन घर पर delivery मिल गई। बहुत अच्छी service है।", stars: 5 },
              { name: "सुरेश मीणा", village: "गौहरगंज, विदिशा", text: "असली बीज मिलते हैं यहाँ। JS-335 सोयाबीन से इस बार 18 क्विंटल/एकड़ उपज हुई। 🙏", stars: 5 },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(249,168,37,0.06)", border: "1px solid rgba(249,168,37,0.12)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#F9A825]/20 flex items-center justify-center text-xs font-black text-[#F9A825]">
                    {r.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-bold">{r.name}</div>
                    <div className="text-white/40 text-[9px]">{r.village}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, si) => (
                      <Star key={si} className="w-3 h-3 fill-[#F9A825] text-[#F9A825]" />
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-[10px] leading-relaxed">{r.text}</p>
              </div>
            ))}
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs w-full"
              style={{ background: "#4285F4" }}>
              <FaGoogle className="w-3.5 h-3.5" /> Google पर Review लिखें — 30 सेकंड में
            </a>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="text-white font-bold text-sm mb-3">📱 Social Media Follow करें</div>
          <div className="space-y-2">
            {[
              { label: "Instagram — Keshav Bhai", handle: "@lifeofkeshavmeena", followers: "45K+", icon: <FaInstagram className="w-4 h-4" />, color: "#c13584", href: "https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" },
              { label: "Facebook", handle: "Annadata Agri & Seeds", followers: "31K+", icon: <FaFacebook className="w-4 h-4" />, color: "#1877f2", href: "https://www.facebook.com/share/1NNq1tBFvf/?mibextid=wwXIfr" },
              { label: "YouTube", handle: "@keshavmeena2912", followers: "8.7K+", icon: <FaYoutube className="w-4 h-4" />, color: "#ff0000", href: "https://youtube.com/@keshavmeena2912?si=pB_hKbc32HgS1aWt" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <div className="flex-1">
                  <div className="text-white text-xs font-bold">{s.label}</div>
                  <div className="text-white/50 text-[10px]">{s.handle}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: s.color }}>
                  {s.followers}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnquiryForm() {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", crop: "", requirement: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof typeof form]) setErrors(err => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = "नाम जरूरी है";
    if (!form.mobile.trim()) newErrors.mobile = "मोबाइल नंबर जरूरी है";
    else if (!/^\d{10}$/.test(form.mobile.trim())) newErrors.mobile = "10 अंकों का नंबर डालें";
    if (!form.village.trim()) newErrors.village = "गांव का नाम जरूरी है";
    if (!form.crop) newErrors.crop = "फसल चुनें";
    return newErrors;
  };

  const send = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const msg = `🌾 *Annadata App — किसान Enquiry*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏘️ गांव: ${form.village}\n🌱 फसल: ${form.crop}\n📋 जरूरत: ${form.requirement || "-"}`;
    window.open(waLink(msg), "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", mobile: "", village: "", crop: "", requirement: "" }); }, 3000);
  };

  const fieldClass = (err?: string) =>
    `w-full bg-white/8 border rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 outline-none transition-colors ${err ? "border-red-400/60 focus:border-red-400" : "border-white/12 focus:border-[#F9A825]/60"}`;

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Name */}
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">आपका नाम *</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="जैसे: रामप्रसाद यादव"
          className={fieldClass(errors.name)} />
        {errors.name && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
      </div>
      {/* Mobile */}
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">मोबाइल नंबर *</label>
        <input name="mobile" type="tel" inputMode="numeric" maxLength={10} value={form.mobile} onChange={handleChange} placeholder="10 अंकों का नंबर"
          className={fieldClass(errors.mobile)} />
        {errors.mobile && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.mobile}</p>}
      </div>
      {/* Village */}
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">गांव / कस्बा *</label>
        <input name="village" value={form.village} onChange={handleChange} placeholder="जैसे: सलामतपुर, रायसेन"
          className={fieldClass(errors.village)} />
        {errors.village && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.village}</p>}
      </div>
      {/* Crop */}
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">फसल *</label>
        <select name="crop" value={form.crop} onChange={handleChange}
          className={fieldClass(errors.crop)}>
          <option value="" className="bg-gray-900">फसल चुनें</option>
          {["धान", "सोयाबीन", "गेहूं", "चना", "मक्का", "अन्य"].map(c => (
            <option key={c} value={c} className="bg-gray-900">{c}</option>
          ))}
        </select>
        {errors.crop && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.crop}</p>}
      </div>
      {/* Requirement */}
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">क्या चाहिए? (कौन सा बीज)</label>
        <textarea name="requirement" value={form.requirement} onChange={handleChange} rows={2}
          placeholder="जैसे: 1886 धान बीज 5 पैकेट, JS-335 सोयाबीन"
          className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 outline-none focus:border-[#F9A825]/60 transition-colors resize-none" />
      </div>
      <button onClick={send} disabled={sent}
        className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-sm rounded-xl transition-all active:scale-95"
        style={{
          background: sent ? "#16a34a" : "#25D366",
          boxShadow: "0 4px 16px rgba(37,211,102,0.3)"
        }}>
        {sent
          ? <><CheckCircle className="w-4 h-4 text-white" /> <span className="text-white">भेज दिया! ✅</span></>
          : <><FaWhatsapp className="w-4 h-4 text-white" /> <span className="text-white">WhatsApp पर भेजें</span></>
        }
      </button>
    </div>
  );
}
