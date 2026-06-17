import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import InstallAppButton from "@/components/InstallAppButton";
import MobileInstallNudge from "@/components/MobileInstallNudge";

const MobileApp = lazy(() => import("@/pages/MobileApp"));
import {
  Phone, MapPin, MessageCircle, Leaf, Droplets,
  Star, CheckCircle, Users, Heart, ShieldCheck, Truck, ThumbsUp, Clock,
  BadgeCheck, Sprout, X, Copy, ChevronLeft, ChevronRight, ExternalLink,
  CalendarDays, HelpCircle, Package, Zap, Bug, Scissors,
  TreePine, Wheat, FlaskConical, Tractor, CloudRain, SunMedium, Wind
} from "lucide-react";
import { FaWhatsapp, FaInstagram, FaYoutube, FaFacebook, FaGoogle } from "react-icons/fa";

import logoPath from "@assets/logo.webp";
import ownerPhotoPath from "@assets/2d15bd6ce2f040b69e7c52160dd6bba7FR_1779471098722.jpg";
import bannerWidePath from "@assets/banner-wide.webp";
import shopImg1 from "@assets/shop1.webp";
import shopImg2 from "@assets/shop2.webp";
import shopImg3 from "@assets/shop3.webp";
import shopImg4 from "@assets/shop4.webp";
import { generateCustomerReview, SERVICES as ENGINE_SERVICES, type Lang } from "../lib/reviewEngine";

const PHONE = "919691712455";
const PHONE_SHORT = "9691712455";

const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
const hw = (props: object) => (isTouch ? {} : props);
const GMAIL = "annadataagriandseeds@gmail.com";
const FACEBOOK_LINK = "https://www.facebook.com/share/1NNq1tBFvf/?mibextid=wwXIfr";
const MAPS_LINK = "https://maps.app.goo.gl/42WDXZz6qG67UkQY7?g_st=ic";
const GOOGLE_REVIEW_LINK = "https://g.page/r/Cc8Vg4qNog9QEBM/review";

function waLink(msg: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);
  useEffect(() => {
    const checkStandalone = () => {
      const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = (window.navigator as any).standalone === true;
      return standaloneMedia || iosStandalone;
    };
    setIsPWA(checkStandalone());
    const mql = window.matchMedia("(display-mode: standalone)");
    const handler = () => setIsPWA(checkStandalone());
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isPWA;
}

export default function HomePage() {
  const isPWA = useIsPWA();

  if (isPWA) {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-[#0d1f0d] flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
        <MobileApp />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col relative selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <FloatingWhatsApp />
      <InstallAppButton variant="banner" />
      <StickyMobileCTA />
      <MobileInstallNudge />

      <main className="flex-1 flex flex-col w-full">
        <TickerStrip />
        <HeroSection />
        <OnlineDhanBookingSection />
        <SmartFarmerHelpSection />
        <CropDoctorSection />
        <ProductsSection />
        <SeasonalCropCalendarSection />
        <DhanProjectSection />
        <DhanUthwaiSection />
        <WhyChooseSection />
        <BannerDivider />
        <StatsSection />
        <SecondTickerStrip />
        <ShopGallerySection />
        <OwnerSection />
        <KisanClubSection />
        <ContactSection />
        <GoogleMapSection />
      </main>

      <Footer />
    </div>
  );
}

/* ─── Sticky Mobile CTA ─── */
function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[998] md:hidden bg-foreground border-t-2 border-secondary shadow-2xl"
          >
            <div className="grid grid-cols-4 divide-x divide-white/10">
              <a href={`tel:${PHONE_SHORT}`}
                className="flex flex-col items-center gap-1 py-3 text-white active:bg-white/10 transition-colors">
                <Phone className="w-5 h-5 text-secondary" />
                <span className="text-[10px] font-bold font-hindi">Call</span>
              </a>
              <a href={waLink("नमस्ते Keshav Bhai! मुझे सहायता चाहिए।")} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-1 py-3 bg-[#25D366] active:opacity-90 transition-colors">
                <FaWhatsapp className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold text-white">WhatsApp</span>
              </a>
              <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-1 py-3 text-white active:bg-white/10 transition-colors">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-[10px] font-bold font-hindi">Maps</span>
              </a>
              <button onClick={() => setEnquiryOpen(true)}
                className="flex flex-col items-center gap-1 py-3 text-white active:bg-white/10 transition-colors">
                <HelpCircle className="w-5 h-5 text-secondary" />
                <span className="text-[10px] font-bold font-hindi">पूछें</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <QuickEnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} problem="अन्य समस्या" />
    </>
  );
}

/* ─── Floating WhatsApp ─── */
function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.a
      href={waLink("नमस्ते Keshav Bhai! मुझे जानकारी चाहिए।")}
      target="_blank" rel="noreferrer"
      data-testid="button-floating-whatsapp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-20 right-4 z-[999] hidden md:flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#1ebe5d] transition-colors px-5 py-4"
      style={{ boxShadow: "0 6px 28px rgba(37,211,102,0.5)" }}
    >
      <FaWhatsapp className="w-6 h-6 flex-shrink-0" />
      <span className="font-bold text-sm whitespace-nowrap">WhatsApp करें</span>
    </motion.a>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[60] bg-foreground/95 backdrop-blur-sm py-2.5 text-center">
        <span className="text-secondary font-bold font-hindi tracking-widest text-base md:text-lg relative z-10">
          🙏 श्री गणेशाय नमः 🙏
        </span>
        <span className="text-white/30 mx-3 relative z-10">✦</span>
        <span className="text-white/90 font-hindi text-sm md:text-base font-semibold relative z-10">
          जय जवान जय किसान 🌾
        </span>
      </div>
      <header className={`fixed top-[46px] left-0 w-full z-50 transition-all duration-300 ${scrolled ? "py-2 glass-dark shadow-lg" : "py-3 bg-transparent"}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img src={logoPath} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full border-2 border-secondary/60 shadow-lg bg-white" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm md:text-lg text-secondary tracking-wide leading-tight drop-shadow-sm">ANNADATA AGRI AND SEEDS</span>
              <span className="font-hindi text-[10px] md:text-xs text-secondary font-semibold">Salamatpur, Raisen</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/reviews" data-testid="nav-reviews" className="glass px-3 py-2 rounded-full text-white font-medium text-sm flex items-center gap-1.5 hover:bg-white/20 transition-colors border border-secondary/30">
              <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />Reviews
            </Link>
            <a href={`tel:${PHONE_SHORT}`} data-testid="nav-call" className="glass px-3 py-2 rounded-full text-white font-medium text-sm flex items-center gap-1.5 hover:bg-white/20 transition-colors">
              <Phone className="w-3.5 h-3.5 text-secondary" />{PHONE_SHORT}
            </a>
            <InstallAppButton variant="button" />
            <a href={waLink("नमस्ते Keshav Bhai!")} target="_blank" rel="noreferrer" data-testid="nav-whatsapp" className="bg-[#25D366] text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 hover:bg-[#1ebe5d] transition-colors shadow-lg">
              <FaWhatsapp className="w-3.5 h-3.5" />WhatsApp
            </a>
          </div>
          <a href={waLink("नमस्ते Keshav Bhai!")} target="_blank" rel="noreferrer" className="md:hidden bg-[#25D366] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <FaWhatsapp className="w-5 h-5" />
          </a>
        </div>
      </header>
    </>
  );
}

/* ─── Ticker Strip ─── */
function TickerStrip() {
  const items = [
    "💦 धान First Spray और दवाई सलाह उपलब्ध है",
    "🧴 फसल दवाइयों पर विशेष सुविधा — अभी जानकारी लें",
    "🌾 धान रोपाई • First Spray • खरपतवार नियंत्रण • कीट रोग सलाह",
    "📞 Keshav Bhai से बात करें: 9691712455",
    "✅ सही दवाई, सही मात्रा और भरोसेमंद सलाह",
    "⭐ Google Rating 4.9 — 200+ किसान भाइयों का भरोसा",
    "💬 WhatsApp पर सीधे पूछें — जल्द जवाब मिलेगा",
    "🌿 फसल की समस्या हो तो बेझिझक संपर्क करें",
    "📍 रायसेन रोड, त्रिमूर्ति चौराहा, सलामतपुर",
    "🙏 किसान भाई की सेवा में — Annadata Agri & Seeds",
  ];
  const allItems = [...items, ...items];
  return (
    <div className="fixed z-[45] w-full overflow-hidden bg-secondary border-b-2 border-secondary/60 shadow-md" style={{ top: "82px" }}>
      <div className="flex items-center h-9">
        <div className="flex-shrink-0 bg-foreground text-secondary font-bold text-xs px-4 h-full flex items-center gap-1.5 z-10 border-r border-black/20">
          <span className="animate-pulse">🔴</span>
          <span className="uppercase tracking-widest hidden sm:block">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />
          <div className="animate-ticker flex gap-0 whitespace-nowrap">
            {allItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-foreground font-hindi font-semibold text-sm px-6">
                {item}<span className="text-foreground/40 ml-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const trustBadges = [
    { icon: <Sprout className="w-4 h-4" />, label: "धान सलाह" },
    { icon: <FlaskConical className="w-4 h-4" />, label: "फसल दवाई" },
    { icon: <Users className="w-4 h-4" />, label: "किसान सहायता" },
    { icon: <FaGoogle className="w-4 h-4" />, label: "Google Reviews" },
  ];

  return (
    <section className="w-full pt-[118px] bg-white relative overflow-x-hidden min-h-[100svh]">
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      {/* Main hero content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* ── LEFT CONTENT ── */}
          <div className="flex-1 flex flex-col gap-5 text-center lg:text-left order-2 lg:order-1">

            {/* Live season badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-red-500 font-hindi">
                धान First Spray Guidance LIVE
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-hindi font-black text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.2rem] leading-[1.25] text-gray-900"
            >
              धान रोपाई और{" "}
              <span className="relative inline-block text-green-700">
                First Spray
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-yellow-400 origin-left"
                />
              </span>{" "}
             की सही सलाह
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="font-hindi text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Annadata Agri and Seeds में धान रोपाई, First Spray, खरपतवार नियंत्रण, कीट/रोग और फसल दवाई की सही सलाह मिलती है।
            </motion.p>

            {/* Owner message card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="inline-flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 max-w-md mx-auto lg:mx-0"
            >
              <img
                src={ownerPhotoPath}
                alt="Keshav Meena"
                className="w-10 h-10 rounded-full object-cover border-2 border-green-400 flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-hindi text-green-800 font-bold text-sm leading-snug">
                  "किसान भाइयों को सही सलाह देना हमारी प्राथमिकता है।"
                </span>
                <span className="text-green-600 text-xs font-semibold mt-0.5">— केशव मीणा, Annadata Agri</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <motion.a
                href={`tel:${PHONE_SHORT}`}
                data-testid="button-call-now"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-hindi font-black text-base bg-green-700 hover:bg-green-800 text-white shadow-lg transition-colors"
                style={{ boxShadow: "0 6px 20px rgba(21,128,61,0.35)" }}
              >
                <Phone className="w-5 h-5" /> Call Now
              </motion.a>
              <motion.a
                href={waLink("नमस्ते Keshav Bhai! मुझे धान First Spray और दवाई की सलाह चाहिए। खेत की फोटो भेज रहा हूँ।")}
                target="_blank" rel="noreferrer"
                data-testid="button-whatsapp-hero"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-hindi font-black text-base bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg transition-colors"
                style={{ boxShadow: "0 6px 20px rgba(37,211,102,0.35)" }}
              >
                <FaWhatsapp className="w-5 h-5" /> WhatsApp करें
              </motion.a>
              <motion.a
                href={MAPS_LINK}
                target="_blank" rel="noreferrer"
                data-testid="button-directions"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-hindi font-black text-base border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
              >
                <MapPin className="w-5 h-5" /> Google Map देखें
              </motion.a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {trustBadges.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm"
                >
                  <span className="text-green-600">{b.icon}</span>
                  <span className="font-hindi">{b.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT IMAGE CARD ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 w-full max-w-[95%] sm:max-w-[500px] lg:max-w-[560px] order-1 lg:order-2"
          >
            <div className="relative">
              {/* Decorative glow rings — static for performance */}
              <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(21,128,61,0.15) 0%, transparent 70%)" }}
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(249,168,37,0.15) 0%, transparent 70%)" }}
              />
              {/* Static border ring */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                style={{ border: "2px solid rgba(21,128,61,0.25)", borderRadius: "1.5rem" }}
              />

              {/* Main shop image — full portrait, no crop */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 100%)" }}
              >
                <img
                  src={shopImg1}
                  alt="Keshav Meena — Annadata Agri and Seeds"
                  className="w-full object-contain"
                  style={{ display: "block" }}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  width={900}
                  height={1200}
                />


                {/* Bottom gradient with info */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-5"
                  style={{ background: "linear-gradient(to top, rgba(5,46,22,0.85) 0%, rgba(5,46,22,0.4) 60%, transparent 100%)" }}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="font-black text-white text-sm tracking-wide uppercase drop-shadow">Annadata Agri & Seeds</div>
                    <div className="font-hindi text-white/80 text-xs mt-0.5">रायसेन रोड, सलामतपुर, जि. रायसेन</div>
                  </motion.div>
                </div>

                {/* Live badge top-left */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 flex-shrink-0 animate-pulse" />
                </motion.div>
              </div>

              {/* Floating crop tag — static for performance */}
              <div className="absolute -top-4 left-4 bg-green-700 text-white rounded-full px-3 py-1.5 text-xs font-black shadow-lg flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5" />
                <span className="font-hindi">धान रोपाई • First Spray</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom strip — stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="border-t border-gray-100 bg-green-50 mt-8"
      >
        <div className="container mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-center md:justify-between gap-4">
          {[
            { icon: <Users className="w-4 h-4 text-green-700" />, val: "200+", label: "Farmers Trusted" },
            { icon: <ShieldCheck className="w-4 h-4 text-green-700" />, val: "100%", label: "असली माल" },
            { icon: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />, val: "4.9★", label: "Google Rating" },
            { icon: <Clock className="w-4 h-4 text-green-700" />, val: "1 वर्ष", label: "अनुभव (Since July 2025)" },
            { icon: <Leaf className="w-4 h-4 text-green-700" />, val: "24/7", label: "फसल सलाह" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.07 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-green-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                {s.icon}
              </div>
              <div>
                <div className="font-black text-gray-800 text-sm leading-none">{s.val}</div>
                <div className="font-hindi text-gray-500 text-[10px] leading-tight mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Quick Enquiry Modal ─── */
interface ModalProps { open: boolean; onClose: () => void; problem: string; }
function QuickEnquiryModal({ open, onClose, problem }: ModalProps) {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", crop: "", acres: "", message: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const sendWA = () => {
    const msg = `🌾 *Annadata Agri — किसान Enquiry*\n\n📌 समस्या: ${problem}\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏘️ गांव: ${form.village}\n🌱 फसल: ${form.crop}\n📐 एकड़: ${form.acres}\n💬 विवरण: ${form.message || "-"}`;
    window.open(waLink(msg), "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="bg-primary p-5 rounded-t-3xl sm:rounded-t-3xl flex items-start justify-between">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-1">Annadata Agri — Enquiry</p>
                <h3 className="text-white font-hindi font-bold text-lg leading-tight">📌 {problem}</h3>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white mt-1 flex-shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {[
                { name: "name", label: "आपका नाम *", placeholder: "जैसे: रामप्रसाद यादव", type: "text" },
                { name: "mobile", label: "मोबाइल नंबर *", placeholder: "10 अंकों का नंबर", type: "tel" },
                { name: "village", label: "गांव / कस्बा *", placeholder: "जैसे: सलामतपुर", type: "text" },
                { name: "crop", label: "फसल", placeholder: "जैसे: धान, गेहूं, सोयाबीन", type: "text" },
                { name: "acres", label: "कितने एकड़", placeholder: "जैसे: 5", type: "number" },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-foreground/70 font-hindi mb-1 block">{f.label}</label>
                  <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors font-hindi" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-foreground/70 font-hindi mb-1 block">अतिरिक्त जानकारी</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="कोई और बात बताना हो तो यहाँ लिखें..."
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none font-hindi" />
              </div>
              <button onClick={sendWA}
                className="w-full py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.02] shadow-lg mt-1">
                <FaWhatsapp className="w-5 h-5" /> WhatsApp पर Keshav Bhai को भेजें
              </button>
              <p className="text-center text-xs text-muted-foreground font-hindi">आपकी जानकारी पूरी तरह सुरक्षित है।</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Smart Farmer Help Section ─── */
function SmartFarmerHelpSection() {
  const [selected, setSelected] = useState<string | null>(null);

  const problems = [
    { emoji: "💦", label: "धान First Spray सलाह", color: "#22c55e" },
    { emoji: "🗒️", label: "धान का प्रोजेक्ट कराना है", color: "#F9A825" },
    { emoji: "🌿", label: "धान की दवाई चाहिए", color: "#00897B" },
    { emoji: "💦", label: "First Spray Guidance", color: "#26A69A" },
    { emoji: "🍂", label: "फसल में रोग लग गया", color: "#ef4444" },
    { emoji: "🌱", label: "खरपतवार नाशक चाहिए", color: "#84cc16" },
    { emoji: "🚜", label: "घर से धान उठवाई", color: "#f97316" },
    { emoji: "📸", label: "खेत की फोटो भेजकर सलाह", color: "#eab308" },
    { emoji: "🧑‍🌾", label: "किसान सलाह चाहिए", color: "#8b5cf6" },
    { emoji: "🌻", label: "अन्य समस्या", color: "#6b7280" },
  ];

  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <HelpCircle className="w-4 h-4" /> किसान सहायता केंद्र
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-hindi font-black text-foreground leading-tight">
            आपकी खेती की समस्या<br />
            <span className="text-primary">क्या है?</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-muted-foreground font-hindi mt-3 text-base md:text-lg">
            नीचे अपनी समस्या चुनें — Keshav Bhai तुरंत WhatsApp पर जवाब देंगे
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.button key={i} onClick={() => setSelected(p.label)}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileHover={hw({ scale: 1.04 })} whileTap={{ scale: 0.96 }}
              className="group relative rounded-2xl p-4 md:p-5 text-center border-2 bg-white transition-all cursor-pointer btn-glow"
              style={{ borderColor: `${p.color}50` }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${p.color}0d` }} />
              <div className="text-3xl md:text-4xl mb-2">{p.emoji}</div>
              <p className="font-hindi font-bold text-sm md:text-base text-foreground leading-tight">{p.label}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: p.color }}>
                पूछें <ChevronRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center mt-10">
          <a href={waLink("नमस्ते Keshav Bhai! मुझे खेती से जुड़ी सलाह चाहिए।")} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#1ebe5d] transition-all hover:scale-105 font-hindi text-base">
            <FaWhatsapp className="w-5 h-5" /> सीधे WhatsApp पर पूछें
          </a>
        </motion.div>
      </div>

      <QuickEnquiryModal open={!!selected} onClose={() => setSelected(null)} problem={selected || ""} />
    </section>
  );
}

/* ─── Crop Doctor Section ─── */
function CropDoctorSection() {
  const [selected, setSelected] = useState<number | null>(null);
  const problems = [
    { emoji: "🍂", label: "पत्ते पीले पड़ रहे हैं", tip: "💡 पोषक तत्वों की कमी या पत्ता पीलापन रोग हो सकता है। Zinc या Urea Spray + Fungicide की जरूरत है।" },
    { emoji: "🌱", label: "फसल की ग्रोथ रुक गई है", tip: "💡 जड़ कमज़ोर हो सकती है या मिट्टी में NPK की कमी है। Growth Booster + Root Strengthener की जरूरत है।" },
    { emoji: "🐛", label: "कीड़े लग रहे हैं।", tip: "💡 रस चूसक कीट (BPH) या इल्ली हो सकती है। सही कीटनाशक की Spray जरूरी है — Keshav Bhai से पूछें।" },
    { emoji: "🍃", label: "रोग लग गया है", tip: "💡 Blast, Sheath Blight या Bacterial Blight हो सकता है। तुरंत Fungicide Spray करें।" },
    { emoji: "🌿", label: "धान खरपतवार नाशक", tip: "💡 धान में खरपतवार से फसल की पैदावार 30–50% कम हो सकती है। सही खरपतवार नाशक जल्दी डालें।" },
    { emoji: "🌾", label: "जड़ सड़न", tip: "💡 अधिक पानी या Sheath Rot रोग हो सकता है। Carbendazim या Tricyclazole Spray लें।" },
    { emoji: "💦", label: "धान First Spray पूछना है", tip: "💡 रोपाई के 15–20 दिन बाद First Spray जरूरी है। Keshav Bhai से सही Spray Schedule लें।" },
    { emoji: "🌾", label: "धान कल्ले नहीं कर रही", tip: "💡 कल्ले न फूटना जिंक या नाइट्रोजन की कमी का संकेत है। Zinc Sulphate + Urea Spray तुरंत करें।" },
    { emoji: "🧪", label: "कौन सी दवाई डालें?", tip: "💡 फसल की अवस्था और समस्या देखकर सही दवाई चुनें। WhatsApp पर फोटो भेजें — निःशुल्क सलाह पाएं।" },
  ];

  const handleProblemClick = (i: number) => {
    setSelected(selected === i ? null : i);
  };

  const openWhatsApp = (p: typeof problems[0]) => {
    const msg = `नमस्ते Keshav Bhai! 🙏\n\nमेरी फसल में समस्या है: *${p.label}*\n\n${p.tip}\n\nकृपया सही दवाई/सलाह बताएं।\n\n📍 अन्नदाता एग्री & सीड्स`;
    window.open(`https://wa.me/919691712455?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="py-14 md:py-20 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4CAF50 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            🩺 Crop Doctor
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-hindi font-black text-white">
            फसल में क्या समस्या है?
          </motion.h2>
          <p className="text-white/60 font-hindi mt-2">समस्या चुनें — पहले सलाह पढ़ें, फिर WhatsApp पर पूछें 📲</p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto mb-4">
          {problems.map((p, i) => (
            <motion.button key={i}
              onClick={() => handleProblemClick(i)}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={hw({ scale: 1.03 })} whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all cursor-pointer font-hindi text-sm font-semibold relative overflow-hidden ${
                selected === i
                  ? "bg-secondary text-foreground border-secondary shadow-xl"
                  : "bg-white/5 text-white border-white/10 hover:border-secondary/60 hover:bg-white/10 btn-glow"
              }`}>
              <span className="text-2xl">{p.emoji}</span>
              <span className="leading-tight">{p.label}</span>
              <span className={`text-[10px] flex items-center gap-1 ${selected === i ? "opacity-80" : "opacity-50"}`}>
                {selected === i ? "✅ सलाह देखें ↓" : "👆 टैप करें"}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Inline answer panel */}
        {selected !== null && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto mb-6 bg-white/10 border border-secondary/40 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{problems[selected].emoji}</span>
              <div>
                <p className="font-hindi font-bold text-secondary text-base leading-tight mb-1">
                  {problems[selected].label}
                </p>
                <p className="font-hindi text-white/90 text-sm leading-relaxed">
                  {problems[selected].tip}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openWhatsApp(problems[selected])}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-hindi font-bold py-3 rounded-xl text-sm hover:bg-[#1ebe5d] transition-colors active:scale-95"
              >
                <FaWhatsapp className="w-4 h-4" />
                Keshav Bhai से पूछें — WhatsApp
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-3 rounded-xl border border-white/20 text-white/60 font-hindi text-sm hover:bg-white/10 transition-colors"
              >
                बंद करें
              </button>
            </div>
          </motion.div>
        )}

        <p className="text-center text-white/40 font-hindi text-xs">
          👆 किसी भी समस्या पर टैप करें — सलाह पढ़ें, फिर WhatsApp पर संपर्क करें
        </p>
      </div>
    </section>
  );
}

/* ─── Products Section (Upgraded — clickable with sub-categories) ─── */
function ProductsSection() {
  const [activeProduct, setActiveProduct] = useState<number | null>(null);

  const products = [
    {
      icon: <Leaf className="w-7 h-7" />, nameHi: "धान First Spray", nameEn: "First Spray",
      desc: "धान रोपाई के बाद First Spray, खरपतवार नियंत्रण और शुरुआती रोग से बचाव की सही सलाह।",
      accent: "#4CAF50", bg: "from-[#1B5E20] to-[#2E7D32]",
      subs: ["First Spray", "खरपतवार नियंत्रण", "धान की दवाई", "कीट नियंत्रण", "Growth Spray", "फोटो भेजकर सलाह"],
    },
    {
      icon: <Bug className="w-7 h-7" />, nameHi: "कीटनाशक", nameEn: "Pesticides",
      desc: "फसल को कीड़े-मकौड़ों और बीमारियों से बचाने के लिए विश्वसनीय ब्रांड्स।",
      accent: "#00897B", bg: "from-[#004D40] to-[#00695C]",
      subs: ["कीट नियंत्रण", "रस चूसक कीट", "इल्ली नाशक", "फंगीसाइड", "बैक्टीरीसाइड", "अन्य"],
    },
    {
      icon: <Droplets className="w-7 h-7" />, nameHi: "फसल दवाइयां", nameEn: "Crop Medicines",
      desc: "जड़ सड़न, झुलसा, धब्बा रोग जैसी सभी फसल बीमारियों के लिए सटीक दवाइयां।",
      accent: "#26A69A", bg: "from-[#00695C] to-[#00796B]",
      subs: ["पत्ता पीला रोग", "जड़ सड़न", "झुलसा रोग", "धब्बा रोग", "Growth Booster", "अन्य"],
    },
    {
      icon: <TreePine className="w-7 h-7" />, nameHi: "खाद", nameEn: "Fertilizers",
      desc: "फसल की ताकत और उत्पादन बढ़ाने के लिए श्रेष्ठ खाद और माइक्रोन्यूट्रिएंट्स।",
      accent: "#8D6E63", bg: "from-[#4E342E] to-[#6D4C41]",
      subs: ["यूरिया", "DAP", "Zinc", "Boron", "Micronutrient", "अन्य"],
    },
    {
      icon: <Zap className="w-7 h-7" />, nameHi: "Growth Booster", nameEn: "Growth Booster",
      desc: "फसल की बढ़वार और उत्पादन को अधिकतम करने वाले ग्रोथ बूस्टर और स्टिमुलेंट।",
      accent: "#7E57C2", bg: "from-[#311B92] to-[#4527A0]",
      subs: ["Humic Acid", "Seaweed Extract", "Amino Acid", "फूल झड़ना रोकें", "पकाव सुधारें", "अन्य"],
    },
    {
      icon: <Sprout className="w-7 h-7" />, nameHi: "धान रोग/कीट सलाह", nameEn: "Crop Doctor",
      desc: "धान में पीलापन, कीट, ब्लास्ट, जड़ सड़न और ग्रोथ रुकने पर सही दवाई की सलाह।",
      accent: "#43A047", bg: "from-[#1B5E20] to-[#388E3C]",
      subs: ["पत्ते पीले", "कीट लगना", "ब्लास्ट रोग", "जड़ सड़न", "ग्रोथ रुकना", "फोटो भेजकर सलाह"],
    },
    {
      icon: <Users className="w-7 h-7" />, nameHi: "किसान सहायता", nameEn: "Farmer Support",
      desc: "फसल सलाह, स्प्रे गाइडेंस, रोग पहचान — Keshav Bhai हमेशा तैयार।",
      accent: "#F57C00", bg: "from-[#BF360C] to-[#D84315]",
      subs: ["Spray Schedule", "रोग पहचान", "खरीदी सलाह", "धान उठवाई", "फसल बीमा", "अन्य"],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(249,168,37,0.3)_0%,transparent_70%)]" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-secondary font-bold mb-3 uppercase tracking-wider text-sm">
            <Star className="w-4 h-4 fill-secondary text-secondary" />हमारे उत्पाद और सेवाएं
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-hindi font-black text-white">
            क्या चाहिए? — चुनें और पूछें
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-white/50 font-hindi mt-2 text-sm md:text-base">Product पर Click करें → Sub-category चुनें → WhatsApp Enquiry</motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.map((product, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={hw({ scale: 1.02 })}
                onClick={() => setActiveProduct(activeProduct === i ? null : i)}
                className={`bg-gradient-to-br ${product.bg} rounded-2xl p-5 md:p-6 relative overflow-hidden group cursor-pointer transition-all ${activeProduct !== i ? "btn-glow" : ""}`}
                style={{ boxShadow: activeProduct === i ? `0 0 0 3px ${product.accent}, 0 16px 40px rgba(0,0,0,0.4)` : undefined }}
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-25 group-hover:opacity-45 transition-opacity"
                  style={{ background: product.accent }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative"
                  style={{ background: `${product.accent}30`, border: `1.5px solid ${product.accent}55` }}>
                  <span style={{ color: product.accent }}>{product.icon}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white font-hindi leading-tight">{product.nameHi}</h3>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: product.accent }}>{product.nameEn}</p>
                <p className="text-white/70 text-xs leading-relaxed font-hindi">{product.desc}</p>
                <div className="mt-3 flex items-center gap-1" style={{ color: product.accent }}>
                  <span className="text-xs font-bold font-hindi">Enquiry करें</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeProduct === i ? "rotate-90" : ""}`} />
                </div>
              </motion.div>

              <AnimatePresence>
                {activeProduct === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="mt-2 bg-white rounded-2xl p-3 border-2 shadow-xl" style={{ borderColor: `${product.accent}40` }}>
                      <p className="text-xs font-bold text-foreground/60 font-hindi mb-2 px-1">कौन सी जरूरत है? चुनें:</p>
                      <div className="flex flex-col gap-1.5">
                        {product.subs.map((sub, j) => (
                          <a key={j} href={waLink(`🌾 *Annadata Agri — Enquiry*\n\n📌 Category: ${product.nameHi}\n📋 जरूरत: ${sub}\n\nKeshav Bhai, इस बारे में बताएं।`)}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-hindi font-medium text-foreground hover:text-white transition-all"
                            style={{ background: `${product.accent}12` }}
                            onMouseEnter={e => (e.currentTarget.style.background = product.accent)}
                            onMouseLeave={e => (e.currentTarget.style.background = `${product.accent}12`)}>
                            <FaWhatsapp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#25D366" }} />
                            {sub}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Seasonal Crop Calendar ─── */
function SeasonalCropCalendarSection() {
  const currentMonth = new Date().getMonth();
  const months = [
    {
      name: "जून", en: "June", emoji: "🌧️",
      items: [
        { label: "धान नर्सरी तैयारी", tip: "नर्सरी डालने का सही समय — बीज दर और मिट्टी तैयारी" },
        { label: "1886 / PB1 Variety बुकिंग", tip: "इस सीजन की टॉप variety — अभी बुक करें" },
        { label: "धान बीज उपचार", tip: "बीज को फफूंदनाशक से उपचारित करें" },
        { label: "धान प्रोजेक्ट Enquiry", tip: "Annadata का धान प्रोजेक्ट क्या है — जानें" },
        { label: "🌱 सोयाबीन बुवाई तैयारी", tip: "जून अंत में सोयाबीन की बुवाई करें — JS-335, NRC-86 variety। बीज उपचार करें और सही दूरी रखें।" },
      ]
    },
    {
      name: "जुलाई", en: "July", emoji: "🌱",
      items: [
        { label: "रोपाई (Transplanting)", tip: "रोपाई का सही समय और पौधे से पौधे की दूरी" },
        { label: "First Spray Guidance", tip: "रोपाई के बाद पहला Spray — कब और क्या?" },
        { label: "धान की दवाई", tip: "शुरुआती रोग से बचाव — Keshav Bhai से पूछें" },
        { label: "Growth Guidance", tip: "पौधे की बढ़वार के लिए सही खाद और दवाई" },
        { label: "🌱 सोयाबीन First Spray", tip: "सोयाबीन में बुवाई के 15–20 दिन बाद खरपतवार नाशक और पहला Fungicide Spray करें — Keshav Bhai से Spray Schedule लें।" },
      ]
    },
    {
      name: "अगस्त", en: "August", emoji: "🔍",
      items: [
        { label: "रोग पहचान", tip: "पत्ता पीला, जड़ सड़न, कीट — फोटो भेजें WhatsApp पर" },
        { label: "कीट नियंत्रण", tip: "तना छेदक, पत्ता लपेटक कीट से बचाव" },
        { label: "Growth Booster Spray", tip: "फसल को ताकत देने वाले ग्रोथ बूस्टर" },
        { label: "Spray Schedule", tip: "महीने भर का पूरा Spray Schedule" },
        { label: "🌱 सोयाबीन रोग नियंत्रण", tip: "सोयाबीन में पीला मोज़ेक, सर्कोस्पोरा Leaf Spot से बचाव करें। Fungicide + Insecticide Spray तुरंत करें — Keshav Bhai से सलाह लें।" },
      ]
    },
    {
      name: "सितंबर", en: "September", emoji: "🌾",
      items: [
        { label: "Fertilizer Guidance", tip: "पकाव से पहले सही खाद और उचित मात्रा" },
        { label: "Disease Control", tip: "ब्लास्ट, शीथ ब्लाइट से बचाव" },
        { label: "Crop Health Check", tip: "WhatsApp पर फोटो भेजें — निःशुल्क सलाह" },
        { label: "पकाव में सुधार", tip: "दाना भराई और पकाव बढ़ाने के उपाय" },
        { label: "🌱 सोयाबीन पकाव सलाह", tip: "सोयाबीन में दाना भरने के समय पोटाश + Boron Spray करें। पीलापन आने पर कटाई की तैयारी करें।" },
      ]
    },
    {
      name: "अक्टूबर-नवंबर", en: "Oct-Nov", emoji: "🚜",
      items: [
        { label: "कटाई तैयारी", tip: "कटाई का सही समय और मशीन की व्यवस्था" },
        { label: "धान खरीदी जानकारी", tip: "समर्थन मूल्य और खरीदी केंद्र की जानकारी" },
        { label: "घर से धान उठवाई", tip: "Annadata की धान उठवाई सेवा — संपर्क करें" },
        { label: "रबी सीजन तैयारी", tip: "गेहूं-चना बीज की बुकिंग — अभी से करें" },
      ]
    },
    {
      name: "रबी सीजन", en: "Rabi", emoji: "🌽",
      items: [
        { label: "गेहूं बीज बुकिंग", tip: "GW-322, HI-8498, Shatabdi — टॉप variety" },
        { label: "चना बीज", tip: "JG-14, Vikas — Keshav Bhai की पसंदीदा variety" },
        { label: "गेहूं खाद सलाह", tip: "DAP, Zinc, Boron — सही मात्रा और समय" },
        { label: "Spray Guidance", tip: "रबी फसल का पूरा Spray Schedule" },
      ]
    },
  ];

  const defaultTab = currentMonth >= 5 && currentMonth <= 5 ? 0
    : currentMonth === 6 ? 1
    : currentMonth === 7 ? 2
    : currentMonth === 8 ? 3
    : (currentMonth === 9 || currentMonth === 10) ? 4
    : 5;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);

  const changeTab = (idx: number) => {
    setActiveTab(idx);
    setExpandedItem(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) changeTab(Math.min(activeTab + 1, months.length - 1));
      else changeTab(Math.max(activeTab - 1, 0));
    }
  };

  return (
    <section className="py-14 md:py-20 bg-[#F4F1EB] relative border-y border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <CalendarDays className="w-4 h-4" /> फसल कैलेंडर
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-hindi font-black text-foreground">
            इस महीने किसान क्या करें?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-muted-foreground font-hindi mt-2 text-base">
            महीना चुनें — heading tap करें, details खुलेंगी
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        {/* Month Tabs — horizontal scroll + swipe hint on mobile */}
        <div className="relative mb-1">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide justify-start md:justify-center">
            {months.map((m, i) => (
              <button key={i} onClick={() => changeTab(i)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-hindi font-bold text-sm transition-all ${activeTab === i ? "bg-primary text-white shadow-lg scale-105" : "bg-white text-foreground border border-border hover:border-primary/40"}`}>
                <span>{m.emoji}</span>{m.name}
              </button>
            ))}
          </div>
          {/* Swipe hint — mobile only */}
          <p className="text-center text-[11px] text-muted-foreground font-hindi mb-4 md:hidden flex items-center justify-center gap-1">
            <span>←</span> स्वाइप करके महीना बदलें <span>→</span>
          </p>
        </div>

        {/* Tab Content — swipeable on mobile */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col gap-3">
            {months[activeTab].items.map((item, j) => (
              <motion.div key={j} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: j * 0.05 }}
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Heading row — always visible, tap to expand */}
                <button
                  onClick={() => setExpandedItem(expandedItem === j ? null : j)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-primary/5 active:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Sprout className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-hindi font-bold text-foreground text-base leading-tight">{item.label}</h4>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${expandedItem === j ? "rotate-90" : ""}`} />
                </button>

                {/* Expandable details */}
                <AnimatePresence>
                  {expandedItem === j && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-border/50 pt-3">
                        <p className="text-muted-foreground text-sm font-hindi leading-relaxed mb-4">{item.tip}</p>
                        <a href={waLink(`🌾 *Annadata Agri — फसल कैलेंडर Enquiry*\n\n📅 महीना: ${months[activeTab].name}\n📌 विषय: ${item.label}\n\nKeshav Bhai, इस बारे में सलाह चाहिए।`)}
                          target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#25D366] px-4 py-2.5 rounded-full hover:bg-[#1ebe5d] transition-colors font-hindi">
                          <FaWhatsapp className="w-3.5 h-3.5" /> इस बारे में सलाह लें
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Swipe indicator dots — mobile */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {months.map((_, i) => (
            <button key={i} onClick={() => changeTab(i)}
              className={`rounded-full transition-all duration-300 ${activeTab === i ? "w-6 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-border"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dhan Project Section ─── */
function DhanProjectSection() {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", acres: "", variety: "", date: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `🌾 *धान Project Enquiry — अन्नदाता*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏡 गांव: ${form.village}\n📐 एकड़: ${form.acres}\n🌱 Variety: ${form.variety}\n📅 कब लगाना है: ${form.date}\n\nकृपया Project की जानकारी दें।`;
    window.open(waLink(msg), "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };
  return (
    <section className="py-10 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #F9A825 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="container mx-auto px-4 md:px-6 max-w-2xl relative z-10">
        <div className="text-center mb-5 md:mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/20 text-primary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            🌾 Dhan Project
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-hindi font-black text-foreground">
            धान का Project कराना है?
          </motion.h2>
          <p className="text-foreground/60 font-hindi mt-1.5 text-sm md:text-base">Keshav Bhai WhatsApp पर Project की पूरी जानकारी देंगे</p>
        </div>

        {/* Mobile CTA tap-to-expand */}
        {!open && (
          <motion.button onClick={() => setOpen(true)} whileTap={{ scale: 0.97 }}
            className="md:hidden w-full py-4 bg-primary text-white font-hindi font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl mb-2"
            style={{ boxShadow: "0 6px 24px rgba(27,94,32,0.35)" }}>
            🌾 Enquiry Form खोलें <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}

        <AnimatePresence>
          {(open || true) && (
            <motion.div className={open ? "block" : "hidden md:block"}
              initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-foreground rounded-3xl p-5 md:p-8 border border-secondary/20 shadow-2xl space-y-4"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {[
                    { name: "name", label: "नाम *", placeholder: "रामलाल पटेल", type: "text" },
                    { name: "mobile", label: "WhatsApp नंबर *", placeholder: "10 अंकों का नंबर", type: "tel" },
                    { name: "village", label: "गांव *", placeholder: "बरेली गांव", type: "text" },
                    { name: "acres", label: "एकड़ *", placeholder: "5 एकड़", type: "text" },
                    { name: "date", label: "कब लगाना है *", placeholder: "15 जुलाई", type: "text" },
                  ].map(f => (
                    <div key={f.name} className={f.name === "date" ? "sm:col-span-2" : ""}>
                      <label className="block text-white/60 font-hindi text-xs mb-1">{f.label}</label>
                      <input name={f.name} type={f.type} placeholder={f.placeholder} value={(form as any)[f.name]} onChange={handleChange} required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white font-hindi placeholder-white/30 focus:outline-none focus:border-secondary transition-colors text-sm" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 font-hindi text-xs mb-1">Variety *</label>
                    <select name="variety" value={form.variety} onChange={handleChange} required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white font-hindi focus:outline-none focus:border-secondary transition-colors text-sm">
                      <option value="" className="bg-gray-800">Variety चुनें</option>
                      {["1886 हाइब्रिड", "PB1 धान", "अन्य हाइब्रिड", "बासमती", "लोकल Variety"].map(v => (
                        <option key={v} value={v} className="bg-gray-800">{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-hindi font-black text-lg rounded-2xl hover:bg-[#1ebe5d] transition-all shadow-xl"
                  style={{ boxShadow: "0 6px 24px rgba(37,211,102,0.4)" }}>
                  {sent ? "✅ WhatsApp खुल रहा है..." : <><FaWhatsapp className="w-6 h-6" /> Project Enquiry भेजें</>}
                </motion.button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Dhan Uthwai Section ─── */
function DhanUthwaiSection() {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", qty: "", harvest: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `🚜 *धान घर से उठवाई Request — अन्नदाता*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏡 गांव: ${form.village}\n⚖️ अनुमानित Quantity: ${form.qty}\n🗓️ कटाई कब होगी: ${form.harvest}\n\nकृपया उठवाई की व्यवस्था करें।`;
    window.open(waLink(msg), "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };
  return (
    <section className="py-10 md:py-20 bg-foreground relative overflow-hidden border-t border-secondary/10">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4CAF50 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="container mx-auto px-4 md:px-6 max-w-2xl relative z-10">
        <div className="text-center mb-5 md:mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            🚜 धान घर से उठवाई
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-hindi font-black text-white">
            घर से धान उठवाना है
          </motion.h2>
          <p className="text-white/60 font-hindi mt-1.5 text-sm">Request भेजें — Keshav Bhai खुद व्यवस्था करेंगे</p>
        </div>

        {!open && (
          <motion.button onClick={() => setOpen(true)} whileTap={{ scale: 0.97 }}
            className="md:hidden w-full py-4 bg-orange-500 text-white font-hindi font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl mb-2"
            style={{ boxShadow: "0 6px 24px rgba(249,115,22,0.4)" }}>
            🚜 धान uthwai Request Form खोलें <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}

        <div className={open ? "block" : "hidden md:block"}>
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-3xl p-5 md:p-8 border border-orange-400/20 shadow-2xl space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { name: "name", label: "नाम *", placeholder: "रामलाल पटेल" },
                { name: "mobile", label: "WhatsApp नंबर *", placeholder: "10 अंकों का नंबर" },
                { name: "village", label: "गांव *", placeholder: "बरेली गांव" },
                { name: "qty", label: "Quantity *", placeholder: "50 बोरी / 2 टन" },
                { name: "harvest", label: "कटाई कब? *", placeholder: "अक्टूबर अंत" },
              ].map((f, i) => (
                <div key={f.name} className={i === 4 ? "sm:col-span-2" : ""}>
                  <label className="block text-white/60 font-hindi text-xs mb-1">{f.label}</label>
                  <input name={f.name} placeholder={f.placeholder} value={(form as any)[f.name]} onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white font-hindi placeholder-white/30 focus:outline-none focus:border-orange-400 transition-colors text-sm" />
                </div>
              ))}
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 text-white font-hindi font-black text-lg rounded-2xl hover:bg-orange-600 transition-all shadow-xl"
              style={{ boxShadow: "0 6px 24px rgba(249,115,22,0.4)" }}>
              {sent ? "✅ WhatsApp खुल रहा है..." : <><FaWhatsapp className="w-6 h-6" /> धान Uthwai Request भेजें</>}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ─── Online Dhan Booking Section ─── */
function OnlineDhanBookingSection() {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", variety: "", qty: "", delivery: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = (variety?: string) => {
    setOpen(true);
    if (variety) setForm(f => ({ ...f, variety }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `🌾 *Online Booking — अन्नदाता*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏡 गांव: ${form.village}\n💊 जरूरत / समस्या: ${form.variety}\n📦 मात्रा: ${form.qty}\n🚜 डिलीवरी: ${form.delivery}\n\nकृपया सामान घर तक पहुँचाने की व्यवस्था करें। धन्यवाद!`;
    window.open(waLink(msg), "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const features = [
  { emoji: "💦", text: "First Spray सलाह" },
  { emoji: "🌱", text: "खरपतवार नियंत्रण" },
  { emoji: "🐛", text: "कीट रोग समाधान" },
  { emoji: "💊", text: "फसल दवाई" },
  { emoji: "📸", text: "फोटो भेजकर सलाह" },
  { emoji: "💬", text: "WhatsApp Confirm" },
];

const kharifVarieties = [
  "── 💦 धान First Spray / Guidance ──",
  "धान First Spray",
  "धान खरपतवार नियंत्रण",
  "धान की दवाई",
  "धान Growth Spray",
  "धान रोग/कीट सलाह",
  "── 💊 फसल दवाई ──",
  "Fungicide",
  "Insecticide",
  "खरपतवार नाशक",
  "Growth Booster",
  "Micronutrient",
  "── 📸 फोटो से सलाह ──",
  "खेत की फोटो भेजकर सलाह",
  "पत्ते पीले पड़ रहे हैं",
  "कीड़े लग रहे हैं",
  "ग्रोथ रुक गई है",
];

  return (
    <section className="py-14 md:py-20 bg-foreground relative overflow-hidden"
      style={{ boxShadow: "inset 0 0 120px rgba(249,168,37,0.08)" }}>
      {/* Animated golden dot grid */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #F9A825 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      {/* Top + bottom border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-70" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/60 to-transparent opacity-50" />

      {/* Radial glow blobs */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(249,168,37,0.12) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(249,168,37,0.07) 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">

        {/* HOT badge row */}
        <div className="flex justify-center mb-5">
          <div
            className="inline-flex items-center gap-2 bg-secondary text-foreground font-black px-5 py-2 rounded-full text-sm font-hindi"
            style={{ boxShadow: "0 0 20px rgba(249,168,37,0.5)" }}>
            💦 धान First Spray • फसल दवाई • घर तक सुविधा
          </div>
        </div>

        <div className="text-center mb-6">
          {/* LIVE badge + Online Booking */}
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <button onClick={() => scrollToForm()} className="flex items-center gap-1.5 bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-full text-xs border border-red-500/30 cursor-pointer hover:bg-red-500/30 active:scale-95 transition-all">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
              LIVE Booking
            </button>
            <button onClick={() => scrollToForm()} className="inline-flex items-center gap-1.5 bg-secondary/20 text-secondary font-bold px-3 py-1 rounded-full text-xs font-hindi border border-secondary/30 cursor-pointer hover:bg-secondary/30 active:scale-95 transition-all">
              🏠 Online Order
            </button>
            <button onClick={() => scrollToForm("1886 हाइब्रिड धान")} className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 font-bold px-3 py-1 rounded-full text-xs font-hindi border border-green-500/30 cursor-pointer hover:bg-green-500/30 active:scale-95 transition-all">
              💦 धान First Spray
            </button>
            <button onClick={() => scrollToForm("JS-335 सोयाबीन")} className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 font-bold px-3 py-1 rounded-full text-xs font-hindi border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30 active:scale-95 transition-all">
              🌱 खरपतवार नियंत्रण
            </button>
            <button onClick={() => scrollToForm()} className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full text-xs font-hindi border border-blue-500/30 cursor-pointer hover:bg-blue-500/30 active:scale-95 transition-all">
              🏠 घर तक सुविधा
            </button>
          </div>

          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-hindi font-black leading-snug"
            style={{ background: "linear-gradient(135deg, #fff 0%, #F9A825 50%, #FFD54F 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            धान First Spray • फसल दवाई<br />सही सलाह पाएं!
          </motion.h2>
          <p className="text-white/60 font-hindi mt-2 max-w-xl mx-auto text-sm md:text-base">
            खेत की समस्या बताएं — Keshav Bhai से सही दवाई, सही मात्रा और Spray Guidance पाएं
          </p>

          {/* Urgency strip */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-4 inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 font-bold px-4 py-2 rounded-xl text-sm font-hindi">
            ⚡ धान में First Spray और खरपतवार नियंत्रण का सही समय — अभी सलाह लें!
          </motion.div>
        </div>

        {/* Seasonal crop cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => scrollToForm("धान First Spray")
            className="bg-white/5 border border-green-400/40 rounded-2xl p-4 text-center relative overflow-hidden cursor-pointer hover:bg-white/10 active:scale-95 transition-all w-full"
            style={{ boxShadow: "0 0 20px rgba(34,197,94,0.1), inset 0 0 20px rgba(34,197,94,0.04)" }}>
            <div className="absolute top-2 right-2 text-[9px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded-full">HOT</div>
            <div className="text-3xl mb-1">🌾</div>
            <p className="text-white font-hindi font-bold text-sm">धान First Spray</p>
            <p className="text-white/50 font-hindi text-xs mt-0.5">रोपाई के बाद सही Spray Guidance</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {["Fungicide", "Insecticide", "खरपतवार नाशक"].map(t => (
                <span key={t} className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">{t}</span>
              ))}
            </div>
            <p className="mt-2 text-green-300 font-hindi text-[10px] font-bold">👆 टैप करके Order करें</p>
          </button>
          <button onClick={() => scrollToForm("खरपतवार नियंत्रण")
            className="bg-white/5 border border-yellow-400/40 rounded-2xl p-4 text-center relative overflow-hidden cursor-pointer hover:bg-white/10 active:scale-95 transition-all w-full"
            style={{ boxShadow: "0 0 20px rgba(234,179,8,0.1), inset 0 0 20px rgba(234,179,8,0.04)" }}>
            <div className="absolute top-2 right-2 text-[9px] bg-yellow-500 text-white font-black px-1.5 py-0.5 rounded-full">NEW</div>
            <div className="text-3xl mb-1">🌿</div>
            <p className="text-white font-hindi font-bold text-sm">खरपतवार नियंत्रण</p>
            <p className="text-white/50 font-hindi text-xs mt-0.5">घास रोकथाम और सही दवाई सलाह</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {["Fungicide", "Insecticide", "खरपतवार नाशक"].map(t => (
                <span key={t} className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">{t}</span>
              ))}
            </div>
            <p className="mt-2 text-yellow-300 font-hindi text-[10px] font-bold">👆 टैप करके Order करें</p>
          </button>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {features.map((f, i) => (
            <motion.button key={i}
              onClick={() => scrollToForm()}
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={hw({ scale: 1.05 })} whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 bg-secondary/10 border border-secondary/25 rounded-2xl py-3 px-2 text-center cursor-pointer hover:bg-secondary/20 active:bg-secondary/30 transition-colors btn-glow-gold">
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-secondary/90 font-hindi text-xs font-bold leading-tight">{f.text}</span>
            </motion.button>
          ))}
        </div>

        {!open && (
          <button onClick={() => setOpen(true)}
            className="md:hidden w-full py-5 bg-secondary text-foreground font-hindi font-black text-xl rounded-2xl flex items-center justify-center gap-3 mb-4 active:scale-[0.97] transition-transform"
            style={{ boxShadow: "0 6px 24px rgba(249,168,37,0.45)" }}>
            🏠 अभी Booking करें — घर पर मिलेगा! <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div ref={formRef} className={open ? "block" : "hidden md:block"}>
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-white/5 rounded-3xl p-5 md:p-8 border-2 border-secondary/30 shadow-2xl space-y-4"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,168,37,0.1)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "name", label: "आपका नाम *", placeholder: "जैसे: रामलाल पटेल", type: "text" },
              { name: "mobile", label: "WhatsApp नंबर *", placeholder: "10 अंकों का नंबर", type: "tel" },
              { name: "village", label: "गांव / पता *", placeholder: "जैसे: बरेली गांव, तहसील सलामतपुर", type: "text" },
              { name: "qty", label: "कितने पैकेट / kg *", placeholder: "जैसे: 2 पैकेट / 5 kg", type: "text" },
              { name: "delivery", label: "डिलीवरी कब चाहिए? *", placeholder: "जैसे: कल तक / इस हफ्ते", type: "text" },
            ].map((f) => (
              <div key={f.name} className={f.name === "village" || f.name === "delivery" ? "sm:col-span-2" : ""}>
                <label className="block text-white/70 font-hindi text-sm mb-1.5">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} value={(form as any)[f.name]}
                  onChange={handleChange} required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-hindi placeholder-white/30 focus:outline-none focus:border-secondary transition-colors" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-white/70 font-hindi text-sm mb-1.5">दवाई / समस्या चुनें *</label>
              <select name="variety" value={form.variety} onChange={handleChange} required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-hindi focus:outline-none focus:border-secondary transition-colors">
                <option value="" className="bg-gray-800">— दवाई / समस्या चुनें —</option>
                {kharifVarieties.map(v => (
                  <option key={v} value={v} disabled={v.startsWith("──")} className="bg-gray-800 disabled:text-white/30">{v}</option>
                ))}
              </select>
            </div>
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-foreground font-hindi font-black text-lg rounded-2xl hover:bg-secondary/90 transition-all shadow-xl"
            style={{ boxShadow: "0 6px 24px rgba(249,168,37,0.45)" }}>
            {sent ? "✅ Booking WhatsApp पर भेजी गई!" : <><FaWhatsapp className="w-6 h-6" /> WhatsApp पर सलाह लें</>}
          </motion.button>
          <p className="text-center text-white/30 text-xs font-hindi">📞 Keshav Bhai Booking Confirm करने के बाद WhatsApp करेंगे</p>
        </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ─── Why Choose Us ─── */
function WhyChooseSection() {
  const reasons = [
    { icon: <BadgeCheck className="w-7 h-7" />, title: "100% असली सामान", titleEn: "Genuine Products", desc: "केवल प्रमाणित और लाइसेंस प्राप्त ब्रांड्स का सामान — कोई मिलावट नहीं।", color: "#4CAF50" },
    { icon: <ShieldCheck className="w-7 h-7" />, title: "विशेषज्ञ सलाह", titleEn: "Expert Guidance", desc: "कौन सी दवाई, कितनी मात्रा — हर फसल के लिए व्यक्तिगत सलाह बिल्कुल निःशुल्क।", color: "#F9A825" },
    { icon: <ThumbsUp className="w-7 h-7" />, title: "किसान का भरोसा", titleEn: "Farmer's Trust", desc: "1 साल में 200+ किसान भाइयों ने हम पर भरोसा किया और परिणाम पाए।", color: "#00897B" },
    { icon: <Clock className="w-7 h-7" />, title: "समय पर उपलब्धता", titleEn: "Always Available", desc: "बुवाई के सीजन में भी स्टॉक हमेशा तैयार रहता है — आप हमेशा सही समय पर सही बीज पाएं।", color: "#7E57C2" },
    { icon: <Sprout className="w-7 h-7" />, title: "हाइब्रिड बीज", titleEn: "Hybrid Seeds", desc: "धान, सोयाबीन, गेहूं, चना सहित सभी प्रमुख फसलों के उच्च उत्पादन बीज।", color: "#EF6C00" },
    { icon: <Truck className="w-7 h-7" />, title: "आसान पहुंच", titleEn: "Easy Access", desc: "रायसेन रोड, त्रिमूर्ति चौराहा, सलामतपुर — सालों में सबसे सुविधाजनक स्थान।", color: "#0288D1" },
  ];

  return (
    <section className="hidden md:block py-16 md:py-24 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,168,37,0.06)_0%,transparent_70%)]" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-secondary font-bold mb-3 uppercase tracking-wider text-sm">
            <Star className="w-4 h-4 fill-secondary" /> हमें क्यों चुनें?
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold text-white font-hindi">
            अन्नदाता की खासियत
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-5 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {reasons.map((r, i) => (
            <motion.a key={i} href={waLink(`नमस्ते Keshav Bhai! मैं अन्नदाता की खासियत "${r.title}" के बारे में अधिक जानना चाहता हूँ।`)}
              target="_blank" rel="noreferrer"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={hw({ scale: 1.02 })} whileTap={{ scale: 0.97 }}
              className="relative rounded-2xl p-6 md:p-7 border border-white/8 group overflow-hidden cursor-pointer block"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(4px)" }}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity duration-500" style={{ background: r.color }} />
              <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: r.color }} />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1.5px ${r.color}60` }} />
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${r.color}18`, border: `1.5px solid ${r.color}40`, boxShadow: `0 4px 20px ${r.color}20` }}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent" />
                <span style={{ color: r.color }} className="relative z-10">{r.icon}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white font-hindi mb-0.5 leading-tight">{r.title}</h3>
              <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: r.color }}>{r.titleEn}</p>
              <p className="text-white/60 text-sm leading-relaxed font-hindi">{r.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="text-[#25D366] text-xs font-hindi font-semibold">WhatsApp पर पूछें</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Second Animated Ticker Strip ─── */
function SecondTickerStrip() {
  const items = [
    "🏆 1886 हाइब्रिड धान — रायसेन का नंबर 1 बीज",
    "🌾 PB1 धान — ज्यादा पैदावार, कम लागत",
    "🚜 घर से धान उठवाई — अन्नदाता की खास सेवा",
    "🌿 फसल में रोग? — WhatsApp पर फोटो भेजें, फ्री सलाह पाएं",
    "⭐ Google Rating 4.9 ★ — 200+ किसान खुश",
    "💦 First Spray Guidance — बिल्कुल मुफ्त",
    "🌱 खरपतवार नाशक — एक Spray में खेत साफ",
    "📍 Trimurti Chouraha, Salamatpur — आसान पहुंच",
    "🧑‍🌾 Keshav Bhai — किसान का असली साथी",
    "🌻 धान • गेहूं • सोयाबीन • चना — सब यहाँ मिलेगा",
  ];
  const allItems = [...items, ...items];
  return (
    <div className="w-full overflow-hidden bg-primary border-y-2 border-primary/60 py-0">
      <div className="flex items-center h-10">
        <div className="flex-shrink-0 bg-secondary text-foreground font-black text-xs px-4 h-full flex items-center gap-1.5 z-10 border-r border-black/20 tracking-widest uppercase">
          🌾 अन्नदाता
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />
          <div className="animate-ticker-fast flex whitespace-nowrap">
            {allItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-white font-hindi font-semibold text-sm px-6">
                {item}<span className="text-white/30 ml-2">◇</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Strip ─── */
function StatsSection() {
  const stats = [
    { val: "200+", label: "किसान ग्राहक", sub: "Happy Farmers" },
    { val: "45K+", label: "इंस्टाग्राम", sub: "Followers" },
    { val: "32K+", label: "फेसबुक", sub: "Followers" },
    { val: "8K+", label: "यूट्यूब", sub: "Subscribers" },
    { val: "4.9★", label: "गूगल रेटिंग", sub: "Google Rating" },
    { val: "1 Yr", label: "अनुभव", sub: "Since July 2025" },
  ];
  return (
    <section className="bg-secondary relative overflow-hidden py-10 md:py-14">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-16">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-foreground leading-none drop-shadow">{s.val}</span>
              <span className="text-foreground/90 font-hindi font-bold text-base md:text-lg mt-1">{s.label}</span>
              <span className="text-foreground/60 text-xs uppercase tracking-wider mt-0.5">{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Banner Divider ─── */
function BannerDivider() {
  return (
    <div className="w-full relative overflow-hidden hidden md:block">
      <motion.img src={bannerWidePath} alt="Annadata Agri & Seeds Products"
        initial={{ opacity: 0, scale: 1.03 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="w-full h-auto block" />
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full md:w-[45%] flex flex-col items-center md:items-end gap-3 px-4 md:px-10 text-center md:text-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-hindi font-bold text-xs md:text-sm text-white"
            style={{ background: "rgba(249,168,37,0.25)", border: "1.5px solid rgba(249,168,37,0.6)" }}>
            🌾 मुख्य उत्पाद — धान की खेती
          </div>
          <h3 className="font-hindi font-black text-xl md:text-4xl lg:text-5xl text-white leading-tight text-center md:text-right max-w-[90%] md:max-w-full mx-auto md:mx-0"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.95)" }}>
            धान • गेहूं • सोयाबीन
            <span className="block mt-2 text-[#F9A825] bg-black/35 px-2 py-1 rounded-lg inline-block">हर फसल के लिए तैयार</span>
          </h3>
          <p className="text-white/90 font-hindi text-sm md:text-base font-medium leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.95)" }}>
            रायसेन जिले के किसानों का भरोसेमंद साथी<br />असली बीज • सही दवाई • मुफ्त सलाह
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end pointer-events-auto mt-4">
            <a href={`tel:${PHONE_SHORT}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "#F9A825", boxShadow: "0 4px 16px rgba(249,168,37,0.5)" }}>
              <Phone className="w-4 h-4" /> {PHONE_SHORT}
            </a>
            <a href={waLink("नमस्ते Keshav Bhai!")} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.5)" }}>
              <FaWhatsapp className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
}


/* ─── Shop Photo Gallery ─── */
function ShopGallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = [
    { src: shopImg1, caption: "Keshav Bhai — अन्नदाता दुकान में", tag: "🏪 Shop" },
    { src: shopImg2, caption: "किसानों का स्वागत है! — Keshav Bhai", tag: "🧑‍🌾 Welcome" },
    { src: shopImg3, caption: "सभी कृषि उत्पाद एक ही जगह", tag: "🌿 Products" },
    { src: shopImg4, caption: "टीम अन्नदाता — आपकी सेवा में हमेशा तैयार", tag: "⭐ Team" },
  ];

  return (
    <section className="py-14 md:py-20 bg-background relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-secondary/15 text-secondary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <Star className="w-4 h-4 fill-secondary text-secondary" /> दुकान गैलरी
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-hindi font-black text-foreground">
            हमारी दुकान और उपलब्ध उत्पाद
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-muted-foreground font-hindi mt-2 text-base">
            फोटो पर Click करें — बड़ा देखें
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos.map((p, i) => (
            <motion.button key={i} onClick={() => setLightbox(i)}
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={hw({ scale: 1.02 })}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "16/10" : "4/3" }}>
              <img src={p.src} alt={p.caption} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs font-bold text-secondary bg-black/50 px-2 py-1 rounded-full">{p.tag}</span>
                <p className="text-white text-xs font-hindi mt-1 leading-tight">{p.caption}</p>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center hidden group-hover:flex transition-all">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center mt-8">
          <a href="https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg"
            style={{ background: "linear-gradient(135deg, #405DE6, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45)" }}>
            <FaInstagram className="w-4 h-4" /> @lifeofkeshavmeena — 45K+ Followers
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <img src={photos[lightbox].src} alt={photos[lightbox].caption} className="w-full h-auto rounded-2xl max-h-[80vh] object-contain" />
              <div className="text-center mt-3">
                <span className="text-secondary font-bold text-sm">{photos[lightbox].tag}</span>
                <p className="text-white/80 font-hindi text-sm mt-1">{photos[lightbox].caption}</p>
              </div>
              <button onClick={() => setLightbox(null)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl text-foreground hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
              {lightbox > 0 && (
                <button onClick={() => setLightbox(l => (l! - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {lightbox < photos.length - 1 && (
                <button onClick={() => setLightbox(l => (l! + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Owner (Upgraded Trust Section) ─── */
function OwnerSection() {
  return (
    <section className="py-16 md:py-24 bg-foreground text-background relative overflow-hidden border-t-4 border-secondary">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(249,168,37,0.15)_0%,transparent_70%)]" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-8">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 font-hindi">किसान भाइयों का भरोसा</p>
          <h2 className="text-3xl md:text-5xl font-hindi font-black text-white">Keshav Bhai — आपका साथी</h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-20">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-secondary rounded-full opacity-15 scale-110" />
            <div className="w-60 h-60 md:w-80 md:h-80 rounded-full p-1.5 relative z-10"
              style={{ background: "conic-gradient(from 0deg, #F9A825, #1B5E20, #F9A825, #1B5E20, #F9A825)", boxShadow: "0 0 60px 10px rgba(249,168,37,0.3)" }}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-foreground">
                <img src={ownerPhotoPath} alt="Keshav Meena" className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-xl font-bold text-sm z-20 shadow-xl border-2 border-foreground">
              Proprietor
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
            className="flex-1 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-1 font-hindi">प्रो. केशव मीणा</h3>
            <p className="text-lg text-secondary/90 font-medium mb-5">Keshav Meena • Annadata Agri & Seeds</p>

            <p className="text-base md:text-lg text-background/75 leading-relaxed mb-6 font-hindi border-l-4 border-secondary pl-5 italic">
              "Keshav Bhai किसानों को सिर्फ product नहीं, सही समय पर सही सलाह देने की कोशिश करते हैं। किसान भाई की मुस्कान ही हमारी असली कमाई है।"
            </p>

            <div className="flex flex-wrap gap-5 justify-center md:justify-start mb-7">
              {[
                { val: "1 Year", label: "In Business" },
                { val: "45K+", label: "Instagram" },
                { val: "32K+", label: "Facebook" },
                { val: "8K+", label: "YouTube" },
                { val: "200+", label: "Farmers" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-secondary">{s.val}</div>
                  <div className="text-white/60 text-xs uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Trust CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href={waLink("नमस्ते Keshav Bhai! मुझे खेती से जुड़ी सलाह चाहिए।")} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm transition-all hover:scale-105 shadow-lg">
                <FaWhatsapp className="w-4 h-4" /> WhatsApp पर पूछें
              </a>
              <a href="https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors text-white text-sm font-semibold">
                <FaInstagram className="w-4 h-4 text-pink-400" /> @lifeofkeshavmeena Follow करें
              </a>
              <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors text-white text-sm font-semibold">
                <MapPin className="w-4 h-4 text-secondary" /> Google Maps पर देखें
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Farmer Review Assistant ─── */
function ReviewAssistantSection() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [service, setService] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [review, setReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [genCount, setGenCount] = useState(0);

  const langLabels: Record<Lang, string> = {
    hi: "🇮🇳 हिंदी",
    hi_en: "🌀 Hinglish",
    en: "🇬🇧 English",
  };

  const handleGenerate = () => {
    if (!rating || !service) return;
    setReview(generateCustomerReview(rating, service, lang));
    setGenCount(c => c + 1);
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
    <section className="py-14 md:py-20 bg-[#F4F1EB] border-y border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-secondary/15 text-secondary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <Star className="w-4 h-4 fill-secondary" /> Review सहायक
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-hindi font-black text-foreground">
            Google Review लिखने में मदद
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-muted-foreground font-hindi mt-2 text-base max-w-xl mx-auto">
            Rating, भाषा और service चुनें — हर बार unique SEO-friendly review तैयार होगा। Edit करके Google पर Post करें।
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="bg-primary p-5">
            <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-1">SEO Review Assistant</p>
            <h3 className="text-white font-hindi font-bold text-lg">Annadata Agri & Seeds — Google Review Generator</h3>
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
                  <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoveredRating(s)} onMouseLeave={() => setHoveredRating(0)}
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

            {/* Service */}
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
        </div>
      </div>
    </section>
  );
}

/* ─── Kisan Club Section ─── */
function KisanClubSection() {
  const [form, setForm] = useState({ name: "", mobile: "", village: "", crop: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `🌾 *Annadata Kisan Club — Join Request*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n🏡 गांव: ${form.village}\n🌱 मुख्य फसल: ${form.crop}\n\nमुझे Annadata Kisan WhatsApp Club में जोड़ें। धन्यवाद!`;
    window.open(waLink(msg), "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };
  const perks = [
    { emoji: "💦", text: "Seasonal Spray Alert" },
    { emoji: "🌾", text: "New Variety Update" },
    { emoji: "📋", text: "Dhan Project Update" },
    { emoji: "🧑‍🌾", text: "Free Kheti Advice" },
    { emoji: "⭐", text: "Special Offers" },
    { emoji: "🌡️", text: "Weather Alert" },
  ];
  return (
    <section className="hidden md:block py-14 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #25D366, transparent)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #4CAF50, transparent)" }} />
      </div>
      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#25D366]/20 text-[#25D366] font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <FaWhatsapp className="w-4 h-4" /> Kisan Club
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-hindi font-black text-foreground">
            Annadata Kisan Club Join करें
          </motion.h2>
          <p className="text-foreground/60 font-hindi mt-2 max-w-xl mx-auto">
            Seasonal spray alert, new variety update, dhan project update और खेती की useful जानकारी WhatsApp पर पाएं — बिल्कुल मुफ्त
          </p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-1 bg-[#25D366] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {perks.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1.5 bg-foreground/5 border border-foreground/10 rounded-2xl p-3 text-center">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-foreground/70 font-hindi text-xs leading-tight">{p.text}</span>
            </motion.div>
          ))}
        </div>

        {!open && (
          <motion.button onClick={() => setOpen(true)} whileTap={{ scale: 0.97 }}
            className="md:hidden w-full py-4 bg-[#25D366] text-white font-hindi font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl mb-4"
            style={{ boxShadow: "0 6px 24px rgba(37,211,102,0.4)" }}>
            <FaWhatsapp className="w-5 h-5" /> Club Join Form खोलें <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}

        <div className={open ? "block" : "hidden md:block"}>
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-foreground rounded-3xl p-5 md:p-8 border-2 border-[#25D366]/30 shadow-2xl space-y-3 md:space-y-4"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(37,211,102,0.1)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { name: "name", label: "नाम *", placeholder: "रामलाल पटेल", type: "text" },
                { name: "mobile", label: "WhatsApp नंबर *", placeholder: "10 अंकों का नंबर", type: "tel" },
                { name: "village", label: "गांव *", placeholder: "बरेली गांव", type: "text" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-white/60 font-hindi text-xs mb-1">{f.label}</label>
                  <input name={f.name} type={f.type} placeholder={f.placeholder} value={(form as any)[f.name]}
                    onChange={handleChange} required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white font-hindi placeholder-white/30 focus:outline-none focus:border-[#25D366] transition-colors text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-white/60 font-hindi text-xs mb-1">मुख्य फसल *</label>
                <select name="crop" value={form.crop} onChange={handleChange} required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white font-hindi focus:outline-none focus:border-[#25D366] transition-colors text-sm">
                  <option value="" className="bg-gray-800">फसल चुनें</option>
                  {["धान", "गेहूं", "सोयाबीन", "चना", "मक्का", "अन्य"].map(c => (
                    <option key={c} value={c} className="bg-gray-800">{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-hindi font-black text-lg rounded-2xl hover:bg-[#1ebe5d] transition-all shadow-xl"
              style={{ boxShadow: "0 6px 24px rgba(37,211,102,0.4)" }}>
              {sent
                ? "✅ Request भेजी गई! Keshav Bhai जल्द जोड़ेंगे..."
                : <><FaWhatsapp className="w-6 h-6" /> Join WhatsApp Club — मुफ्त</>}
            </motion.button>
            <p className="text-center text-white/30 text-xs font-hindi">🔒 आपकी जानकारी सुरक्षित है। Spam नहीं।</p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact Section ─── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", mobile: "", problem: "", message: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const sendToWhatsApp = () => {
    const msg = `🌾 *Annadata Agri — संपर्क Form*\n\n👤 नाम: ${form.name}\n📱 मोबाइल: ${form.mobile}\n📌 समस्या: ${form.problem}\n💬 विवरण: ${form.message}`;
    window.open(waLink(msg), "_blank");
  };

  const problems = ["धान का बीज (1886 / PB1 / सभी Variety)", "धान प्रोजेक्ट", "धान की दवाई", "First Spray", "फसल रोग", "धान खरपतवार नाशक", "घर तक डिलीवरी", "गेहूं बीज", "किसान सलाह", "अन्य"];

  return (
    <section className="py-16 md:py-24 bg-background relative z-10 border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <Phone className="w-4 h-4" /> संपर्क करें
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-xl md:text-5xl font-hindi font-black text-foreground mb-2">
            सीधे Keshav Bhai से बात करें
          </motion.h2>
          <p className="text-muted-foreground font-hindi text-sm md:text-lg">हर समस्या का समाधान — WhatsApp, Call या Visit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <a href={`tel:${PHONE_SHORT}`} data-testid="contact-call"
              className="bg-card hover:bg-card/70 p-6 rounded-2xl border border-border flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-0.5">Call करें</h4>
                <p className="text-muted-foreground text-sm mb-1">सुबह से शाम तक उपलब्ध</p>
                <span className="text-2xl font-black text-primary">{PHONE_SHORT}</span>
              </div>
            </a>

            <a href={waLink("नमस्ते Keshav Bhai! मुझे मदद चाहिए।")} target="_blank" rel="noreferrer"
              className="bg-[#25D366] text-white p-6 rounded-2xl flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <FaWhatsapp className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold">WhatsApp पर पूछें</h4>
                <p className="text-white/80 text-sm">तुरंत जवाब — हिंदी में</p>
                <span className="font-bold text-white/90 text-sm font-hindi">wa.me/919691712455</span>
              </div>
            </a>

            <a href={`mailto:${GMAIL}`}
              className="bg-card hover:bg-card/70 p-6 rounded-2xl border border-border flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform flex-shrink-0">
                <FaGoogle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-0.5">Email करें</h4>
                <p className="text-muted-foreground text-sm mb-1">Enquiry / Complaint / Feedback</p>
                <span className="text-sm font-bold text-red-500 break-all">{GMAIL}</span>
              </div>
            </a>

            <a href={MAPS_LINK} target="_blank" rel="noreferrer" data-testid="contact-maps"
              className="bg-card hover:bg-card/70 p-6 rounded-2xl border border-border flex items-start gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-1">दुकान पर आएं</h4>
                <p className="text-foreground/70 text-base font-hindi leading-relaxed">Raisen Road, Trimurti Chouraha,<br />Salamatpur, Dist. Raisen, M.P.</p>
              </div>
            </a>
          </div>

          {/* Quick Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-card rounded-2xl border border-border p-6 md:p-8 hidden md:block">
            <h3 className="text-xl font-hindi font-bold text-foreground mb-1">WhatsApp Enquiry Form</h3>
            <p className="text-muted-foreground text-sm font-hindi mb-5">Details भरें — Keshav Bhai को तुरंत भेजें</p>
            <div className="flex flex-col gap-3">
              {[
                { name: "name", label: "आपका नाम", placeholder: "जैसे: रामप्रसाद यादव", type: "text" },
                { name: "mobile", label: "मोबाइल नंबर", placeholder: "10 अंकों का नंबर", type: "tel" },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-foreground/60 font-hindi mb-1 block">{f.label}</label>
                  <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors font-hindi" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-foreground/60 font-hindi mb-1 block">समस्या / जरूरत</label>
                <select name="problem" value={form.problem} onChange={handleChange}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors font-hindi bg-white">
                  <option value="">समस्या चुनें...</option>
                  {problems.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/60 font-hindi mb-1 block">अतिरिक्त जानकारी</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="कोई और बात बताना हो तो यहाँ लिखें..."
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none font-hindi" />
              </div>
              <button type="button" onClick={sendToWhatsApp}
                className="w-full py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.02] shadow-lg mt-1">
                <FaWhatsapp className="w-5 h-5" /> WhatsApp पर भेजें
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Google Map Section ─── */
function GoogleMapSection() {
  return (
    <section className="bg-foreground py-14 md:py-20 border-t-4 border-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-secondary/20 text-secondary font-bold px-4 py-2 rounded-full mb-3 text-sm font-hindi">
            <MapPin className="w-4 h-4" /> दुकान का पता
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-hindi font-black text-white">
            हमारी दुकान कहाँ है?
          </motion.h2>
          <p className="text-white/60 font-hindi mt-2 text-base">Raisen Road, Trimurti Chouraha, Salamatpur, Dist. Raisen, M.P.</p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden border-4 border-secondary/40 shadow-2xl max-w-5xl mx-auto"
          style={{ boxShadow: "0 20px 60px rgba(249,168,37,0.2)" }}>
          <iframe
            title="Annadata Agri & Seeds Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3662.5!2d77.7814!3d23.3248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c60b1e8e2d1a1%3A0x0!2sTrimurti+Chouraha%2C+Salamatpur%2C+Raisen%2C+Madhya+Pradesh!5e0!3m2!1shi!2sin!4v1717000000000!5m2!1shi!2sin"
            width="100%"
            height="220"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full md:h-[420px]"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-7">
          <a href={MAPS_LINK} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-secondary text-foreground font-bold rounded-2xl hover:bg-secondary/90 transition-all hover:scale-105 shadow-xl font-hindi text-base"
            style={{ boxShadow: "0 6px 24px rgba(249,168,37,0.4)" }}>
            <MapPin className="w-5 h-5" /> Google Maps पर खोलें
          </a>
          <a href={`tel:${PHONE_SHORT}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 border border-white/20 transition-all hover:scale-105 font-hindi text-base">
            <Phone className="w-5 h-5 text-secondary" /> {PHONE_SHORT} — Call करें
          </a>
          <a href={waLink("नमस्ते Keshav Bhai! मुझे दुकान का रास्ता चाहिए।")} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#1ebe5d] transition-all hover:scale-105 font-hindi text-base">
            <FaWhatsapp className="w-5 h-5" /> रास्ता पूछें WhatsApp पर
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-foreground text-background pt-14 pb-24 md:pb-8 border-t-[6px] border-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="text-secondary font-bold text-xl mb-5 tracking-widest font-hindi">|| श्री गणेशाय नमः ||</div>
          <img src={logoPath} alt="Logo" className="w-20 h-20 rounded-full border-2 border-secondary/60 mb-5 bg-white object-contain shadow-xl" />
          <h2 className="text-3xl font-serif font-bold text-white mb-1">ANNADATA AGRI & SEEDS</h2>
          <p className="text-secondary text-xl font-hindi font-semibold mb-2">जय जवान जय किसान</p>
          <p className="text-white/50 text-sm mb-6">Raisen Road, Trimurti Chouraha, Salamatpur, Dist. Raisen</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ==" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-secondary hover:text-foreground transition-all border border-white/10 text-sm font-medium text-white">
              <FaInstagram className="w-4 h-4 text-pink-400" />@lifeofkeshavmeena 45K+
            </a>
            <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-[#1877F2] transition-all border border-white/10 text-sm font-medium text-white">
              <FaFacebook className="w-4 h-4 text-[#1877F2]" />Facebook 32K+
            </a>
            <a href={waLink("नमस्ते Keshav Bhai!")} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-[#25D366] transition-all border border-white/10 text-sm font-medium text-white">
              <FaWhatsapp className="w-4 h-4 text-[#25D366]" />WhatsApp
            </a>
            <a href={`mailto:${GMAIL}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-red-600 transition-all border border-white/10 text-sm font-medium text-white">
              <FaGoogle className="w-4 h-4 text-red-400" />Email Us
            </a>
            <a href="https://youtube.com/@keshavmeena2912?si=pB_hKbc32HgS1aWt" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-red-600 transition-all border border-white/10 text-sm font-medium text-white">
              <FaYoutube className="w-4 h-4 text-red-500" />YouTube 8K+
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-background/50 text-sm">© 2026 Annadata Agri & Seeds. All Rights Reserved.</p>
          <p className="text-background/40 text-xs flex items-center justify-center gap-2 flex-wrap">
            Designed &amp; Developed by{" "}
            <a href="https://www.instagram.com/priyamxmedia" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-black tracking-widest text-secondary/80 hover:text-secondary transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(249,168,37,0.8)] group"
              style={{ fontFamily: "serif", letterSpacing: "0.1em" }}>
              <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 text-[8px] font-black text-white btn-glow group-hover:scale-110 transition-transform"
                style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", boxShadow: "0 0 6px 2px rgba(220,39,67,0.5)" }}>
                <FaInstagram className="w-3 h-3" />
              </span>
              PRIYAMX MEDIA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
