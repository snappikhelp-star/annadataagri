import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, ArrowLeft, MessageCircle, Copy } from "lucide-react";
import { FaWhatsapp, FaGoogle } from "react-icons/fa";

import logoPath from "@assets/f0d776c4-6a98-4584-9d3a-7186ca49bf22_1781029871797.png";
import {
  generateCustomerReview,
  LOCAL_BUSINESS_SCHEMA,
  FAQ_SCHEMA,
  SERVICES as ENGINE_SERVICES,
  type Lang,
} from "../lib/reviewEngine";

const GOOGLE_REVIEW_LINK = "https://g.page/r/Cc8Vg4qNog9QEBM/review";

const testimonials = [
  { name: "रामप्रशाद मीणा", text: "बहुत अच्छी दुकान है। बीज की गुणवत्ता शानदार है, दाम भी सही हैं। दिल से धन्यवाद केशव भाई।", rating: 5 },
  { name: "Suresh Yadav", text: "Keshav bhai ka saman hamesha asli hota hai. Crop ka result bahut achha aaya is baar. Highly recommended!", rating: 5 },
  { name: "महेश कुमार वर्मा", text: "कीटनाशक दवाई से फसल पूरी तरह ठीक हो गई। नई दुकान है पर सेवा पुरानों से बेहतर है।", rating: 5 },
  { name: "गोविंद सिंह राजपूत", text: "पूरे रायसेन जिले में इतनी अच्छी कृषि दुकान नहीं मिलेगी। असली माल, सही दाम, और बढ़िया सलाह।", rating: 5 },
  { name: "Mohan Lal Meena", text: "Weed killer bahut effective tha. Ek hi spray mein khet saaf ho gaya. Aage bhi yahi aaunga.", rating: 5 },
  { name: "विजय कुमार पटेल", text: "हाइब्रिड बीज की क्वालिटी लाजवाब है। अंकुरण 95% से ऊपर था। अन्नदाता दुकान पर पूरा भरोसा है।", rating: 5 },
];

export default function ReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [service, setService] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [review, setReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [genCount, setGenCount] = useState(0);

  useEffect(() => {
    const s1 = document.createElement("script");
    s1.type = "application/ld+json";
    s1.id = "schema-local-business";
    s1.textContent = JSON.stringify(LOCAL_BUSINESS_SCHEMA);
    document.head.appendChild(s1);
    const s2 = document.createElement("script");
    s2.type = "application/ld+json";
    s2.id = "schema-faq";
    s2.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s2);
    return () => {
      document.head.removeChild(s1);
      document.head.removeChild(s2);
    };
  }, []);

  const langLabels: Record<Lang, string> = {
    hi: "🇮🇳 हिंदी",
    hi_en: "🌀 Hinglish",
    en: "🇬🇧 English",
  };

  const handleGenerate = () => {
    if (!rating || !service) return;
    setReview(generateCustomerReview(rating, service, lang));
    setGenCount(c => c + 1);
    setCopied(false);
  };

  const copyReview = () => {
    navigator.clipboard.writeText(review).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyAndOpenGoogle = () => {
    navigator.clipboard.writeText(review).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    window.open(GOOGLE_REVIEW_LINK, "_blank");
  };

  const charCount = review.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-primary py-2 text-center text-white text-sm font-hindi font-medium">
        <span className="text-secondary font-bold">|| श्री गणेशाय नमः ||</span>
        <span className="mx-4 opacity-50">•</span>
        जय जवान जय किसान
      </div>

      {/* Header */}
      <header className="bg-primary shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" data-testid="back-to-home" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-hindi">← वापस जाएं</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Logo" className="w-10 h-10 rounded-full border-2 border-secondary/60 bg-white object-contain" />
            <div>
              <p className="font-serif font-bold text-white text-sm leading-tight">ANNADATA AGRI</p>
              <p className="text-secondary text-xs font-hindi">Google Review</p>
            </div>
          </div>
          <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-secondary/90 transition-colors shadow-lg">
            <Star className="w-4 h-4 fill-current" /> Rate Us
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Rating hero card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-3xl p-8 text-white text-center mb-10 relative overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(27,94,32,0.3)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,168,37,0.2)_0%,transparent_60%)]" />
          <div className="relative z-10">
            <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-1">Google Rating</p>
            <div className="text-6xl font-black text-white mb-2">4.9</div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-secondary fill-current" />)}
            </div>
            <p className="text-white/60 text-sm">200+ किसान भाइयों का भरोसा</p>
          </div>
        </motion.div>

        {/* Section heading — same as home page */}
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-secondary/15 text-secondary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <Star className="w-4 h-4 fill-secondary" /> Review सहायक
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-hindi font-black text-foreground">
            Google Review लिखने में मदद
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground font-hindi mt-2 text-base max-w-xl mx-auto">
            Rating, भाषा और service चुनें — हर बार unique SEO-friendly review तैयार होगा। Edit करके Google पर Post करें।
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        {/* Review Assistant card — identical to home page */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden mb-12">
          <div className="bg-primary p-5">
            <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-1">SEO Review Assistant</p>
            <h3 className="text-white font-hindi font-bold text-lg">Annadata Agri &amp; Seeds — Google Review Generator</h3>
            <p className="text-white/60 text-xs mt-1 font-hindi">हर बार अलग, natural और SEO-friendly review — 4,800+ unique combinations</p>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Language Tabs */}
            <div>
              <label className="text-sm font-bold text-foreground/70 font-hindi mb-2 block">🌐 भाषा चुनें</label>
              <div className="flex gap-2">
                {(["hi", "hi_en", "en"] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${lang === l ? "bg-primary text-white shadow-md" : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10 border border-border"}`}>
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-bold text-foreground/70 font-hindi mb-2 block">⭐ Rating दें (1 से 5)</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)}
                    onMouseEnter={() => setHoveredRating(s)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-125">
                    <Star className={`w-9 h-9 transition-colors ${s <= (hoveredRating || rating) ? "fill-secondary text-secondary" : "text-border"}`} />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="self-center text-sm font-hindi text-muted-foreground ml-1">
                    {rating === 5 ? "⭐ बहुत अच्छा!" : rating === 4 ? "👍 अच्छा" : rating === 3 ? "🙂 ठीक-ठाक" : rating === 2 ? "😐 औसत" : "😞 निराशाजनक"}
                  </span>
                )}
              </div>
            </div>

            {/* Service chips */}
            <div>
              <label className="text-sm font-bold text-foreground/70 font-hindi mb-2 block">📦 किस चीज़ के लिए?</label>
              <div className="flex flex-wrap gap-2">
                {ENGINE_SERVICES.map(s => (
                  <button key={s} onClick={() => setService(s)}
                    className={`px-3 py-2 rounded-full text-xs font-bold font-hindi border transition-all ${service === s ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary/50"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex gap-3">
              <button onClick={handleGenerate} disabled={!rating || !service}
                className="flex-1 py-3 bg-primary text-white font-hindi font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all hover:scale-[1.01] flex items-center justify-center gap-2">
                ✨ {genCount === 0 ? "Review Generate करें" : "नया Review Generate करें"}
              </button>
              {review && (
                <button onClick={handleGenerate}
                  className="px-4 py-3 rounded-xl border-2 border-primary/40 text-primary font-bold text-sm hover:bg-primary/5 transition-all"
                  title="फिर से — अलग review मिलेगा">
                  🔄
                </button>
              )}
            </div>

            {/* Generated review + action buttons */}
            {review && (
              <motion.div key={genCount} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-foreground/70 font-hindi">✏️ आपका Review (Edit कर सकते हैं)</label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${charCount > 230 ? "bg-red-100 text-red-600" : charCount > 200 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {charCount}/250
                  </span>
                </div>
                <textarea value={review} onChange={e => setReview(e.target.value)} rows={4}
                  className="w-full border-2 border-primary/30 rounded-xl px-4 py-3 text-sm font-hindi outline-none focus:border-primary transition-colors resize-none" />
                <p className="text-xs text-muted-foreground font-hindi mt-1">💡 यह unique SEO-friendly suggestion है — 🔄 से अलग version पाएं या खुद edit करें।</p>
                <div className="flex gap-3 mt-3">
                  <button onClick={copyReview}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${copied ? "bg-green-500 text-white" : "bg-foreground text-white hover:bg-foreground/80"}`}>
                    <Copy className="w-4 h-4" /> {copied ? "✅ Copied!" : "Copy करें"}
                  </button>
                  <button onClick={copyAndOpenGoogle}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#4285F4] text-white hover:bg-[#3367d6] transition-all">
                    <FaGoogle className="w-4 h-4" /> {copied ? "✅ Paste करें Google पर" : "Google पर Post करें"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-hindi text-center mt-1.5">
                  👆 "Google पर Post करें" दबाते ही Review copy होगा → Google खुलेगा → Paste (📋) करके Post करें
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="mb-10">
          <h3 className="font-hindi font-black text-2xl text-foreground mb-5">किसान भाइयों के अनुभव</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-card rounded-2xl p-5 border border-border relative"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <MessageCircle className="absolute top-4 right-4 w-7 h-7 text-primary/8" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <p className="font-bold text-foreground text-sm font-hindi">{t.name}</p>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-secondary fill-current" />)}
                </div>
                <p className="text-foreground/75 text-xs font-hindi leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="rounded-2xl bg-[#F4F1EB] p-8 text-center border border-border">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2 font-hindi">आपका अनुभव हमारे लिए अनमोल है</h3>
          <p className="text-muted-foreground mb-6">Your review helps other farmers find us and trust us</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg">
              <FaGoogle className="w-5 h-5" /> Google Review दें
            </a>
            <a href={`https://wa.me/916261737388?text=${encodeURIComponent("नमस्ते Keshav Bhai!")}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#1ebe5d] transition-all shadow-lg">
              <FaWhatsapp className="w-5 h-5" /> WhatsApp करें
            </a>
          </div>
          <p className="text-muted-foreground text-xs mt-5">Review देने के बाद दुकान पर phone दिखाएं और पाएं विशेष डिस्काउंट</p>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-6 text-center mt-10 border-t-4 border-secondary">
        <p className="text-secondary font-hindi font-bold text-base mb-1">|| श्री गणेशाय नमः || जय जवान जय किसान</p>
        <p className="text-white/40 text-xs mt-1.5">© 2026 Annadata Agri &amp; Seeds. All Rights Reserved.</p>
        <p className="text-white/25 text-xs mt-1">Designed &amp; Developed by{" "}
          <a href="https://www.instagram.com/priyamxmedia" target="_blank" rel="noreferrer"
            className="font-black tracking-widest text-secondary/60 hover:text-secondary transition-all">PRIYAMX MEDIA</a>
        </p>
      </footer>
    </div>
  );
}
