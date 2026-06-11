import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Plus, LayoutGrid, ChevronRight } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import logoPath from "@assets/f0d776c4-6a98-4584-9d3a-7186ca49bf22_1781029871797.png";

const STORAGE_KEY = "annadata_install_nudge_dismissed";

function IOSStepsSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: <Share2 className="w-5 h-5 text-white" />, bg: "#007AFF", title: "Safari में Share दबाएं", sub: "नीचे toolbar में" },
    { icon: <Plus className="w-5 h-5 text-gray-700" />,  bg: "#f0f0f0", title: "\"Add to Home Screen\" चुनें", sub: "List में scroll करें" },
    { icon: <LayoutGrid className="w-5 h-5 text-white" />, bg: "#34C759", title: "\"Add\" दबाएं", sub: "ऊपर-दाएं कोने में" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="w-full bg-white rounded-t-3xl p-5 pb-8"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-5">
          <img src={logoPath} alt="App" className="w-12 h-12 rounded-2xl shadow-sm" />
          <div>
            <div className="font-bold text-gray-900 text-base">App Install करें</div>
            <div className="text-gray-500 text-xs">Annadata Agri & Seeds</div>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 p-1"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-600 font-hindi mb-4 leading-relaxed">
          iPhone पर App Install करने के लिए ये steps follow करें:
        </p>
        <div className="space-y-2.5 mb-5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm font-hindi">{s.title}</div>
                <div className="text-gray-500 text-xs font-hindi">{s.sub}</div>
              </div>
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose}
          className="w-full py-3.5 bg-green-600 text-white font-hindi font-bold rounded-2xl text-base active:scale-95 transition-all">
          समझ गया ✅
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function MobileInstallNudge() {
  const { isInstallable, isInstalled, install, platform } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const isIOS = platform === "ios";
  const isMobileDevice = platform === "android" || platform === "ios";

  useEffect(() => {
    if (platform === "standalone") return;
    if (!isMobileDevice) return;
    const alreadyDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyDismissed) return;
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, [platform, isMobileDevice]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const handleInstall = async () => {
    if (isIOS) { setShowIOS(true); return; }
    if (isInstallable) {
      setInstalling(true);
      const ok = await install();
      setInstalling(false);
      if (ok) { setInstalled(true); setTimeout(() => setVisible(false), 2000); }
    }
  };

  if (isInstalled || dismissed || platform === "standalone" || !isMobileDevice) return null;

  return (
    <>
      <AnimatePresence>
        {visible && !showIOS && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9990] px-3 pb-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(160deg, #0d1f0d 0%, #162d16 100%)", border: "1.5px solid rgba(249,168,37,0.4)" }}>

              {/* Top glow line */}
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #F9A825, transparent)" }} />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <img src={logoPath} alt="Annadata App" className="w-14 h-14 rounded-2xl shadow-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="text-white font-black text-base leading-tight">Annadata Agri App</div>
                      <span className="bg-[#F9A825] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0">FREE</span>
                    </div>
                    <div className="text-white/50 text-xs font-hindi">किसान का असली साथी — Home Screen पर</div>
                  </div>
                  <button onClick={dismiss} className="text-white/30 p-1 flex-shrink-0 -mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { icon: "⚡", text: "Super Fast\nApp Speed" },
                    { icon: "📦", text: "Product\nCatalog देखें" },
                    { icon: "🏠", text: "घर तक\nOrder करें" },
                    { icon: "💡", text: "Free Kheti\nAdvice" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/8">
                      <span className="text-lg flex-shrink-0">{b.icon}</span>
                      <span className="text-white/70 text-[10px] font-bold leading-tight whitespace-pre-line">{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA row */}
                {installed ? (
                  <div className="flex items-center justify-center gap-2 py-3.5 bg-green-600/20 rounded-2xl border border-green-500/30">
                    <span className="text-green-400 text-base">✅</span>
                    <span className="text-green-300 font-bold text-sm font-hindi">App Install हो गया!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleInstall} disabled={installing}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #F9A825 0%, #f5b014 100%)", color: "#0d1f0d", boxShadow: "0 6px 20px rgba(249,168,37,0.45)" }}>
                      {installing ? (
                        <span className="font-hindi">Installing...</span>
                      ) : isIOS ? (
                        <><Share2 className="w-4 h-4" /><span className="font-hindi">iPhone पर Install करें</span></>
                      ) : (
                        <><Download className="w-4 h-4" /><span className="font-hindi">App Install करें</span></>
                      )}
                    </button>
                    <button onClick={dismiss}
                      className="px-4 rounded-2xl text-white/40 text-xs font-hindi bg-white/5 border border-white/10 flex items-center gap-1">
                      बाद में
                    </button>
                  </div>
                )}

                {/* Reassurance */}
                <p className="text-center text-white/25 text-[10px] mt-2.5 font-hindi">
                  🔒 कोई data नहीं लेता • No login required • 100% Free
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOS && <IOSStepsSheet onClose={() => setShowIOS(false)} />}
      </AnimatePresence>
    </>
  );
}
