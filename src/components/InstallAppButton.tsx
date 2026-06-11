import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X, Share2, Plus, LayoutGrid } from "lucide-react";

interface Props {
  variant?: "banner" | "button" | "admin";
}

function IOSInstallModal({ onClose }: { onClose: () => void }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      icon: <Share2 className="w-5 h-5 text-white" />,
      bg: "bg-blue-500",
      title: "Share button दबाएं",
      subtitle: "Safari toolbar में नीचे",
      label: "Share",
    },
    {
      icon: <Plus className="w-5 h-5 text-gray-600" />,
      bg: "bg-gray-100 border border-gray-200",
      textColor: "text-gray-600",
      title: "Add to Home Screen दबाएं",
      subtitle: "List में scroll करें",
      label: "Add to Home Screen",
    },
    {
      icon: <LayoutGrid className="w-5 h-5 text-white" />,
      bg: "bg-blue-500",
      title: "Add दबाएं",
      subtitle: "ऊपर-दाएं कोने में",
      label: "Add",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="Annadata Agri & Seeds"
              className="w-12 h-12 rounded-xl shadow-sm"
            />
            <div>
              <h3 className="font-hindi font-bold text-gray-800 text-base leading-tight">
                ऐप इंस्टॉल करें
              </h3>
              <p className="text-xs text-gray-500 font-hindi">Annadata Agri & Seeds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 font-hindi mb-4 leading-relaxed">
          iPhone me app install karne ke liye neeche diye steps follow karein:
        </p>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <button
              key={i}
              onPointerDown={() => setActiveStep(i)}
              onPointerUp={() => setActiveStep(null)}
              onPointerLeave={() => setActiveStep(null)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all select-none text-left
                ${activeStep === i
                  ? "border-green-500 bg-green-50 scale-[0.97]"
                  : "border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-green-50/50"
                }`}
            >
              <div className={`w-11 h-11 ${step.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-hindi font-semibold text-gray-800 text-sm leading-tight">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 font-hindi mt-0.5">{step.subtitle}</p>
              </div>
              <span className="bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-green-600 text-white font-hindi font-bold py-3 rounded-xl hover:bg-green-700 transition-colors active:scale-95"
        >
          समझ गया
        </button>
      </div>
    </div>
  );
}

export default function InstallAppButton({ variant = "banner" }: Props) {
  const { isInstallable, isInstalled, install, platform } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled || dismissed || platform === "standalone") return null;

  const isIOS = platform === "ios";
  const isDesktop = platform === "desktop";

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    }
  };

  const buttonLabel = isIOS ? "Get" : installing ? "..." : "Install";

  if (variant === "button") {
    if (isDesktop && !isInstallable) return null;

    return (
      <>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/30 text-white font-hindi font-semibold text-sm hover:bg-white/25 transition-all active:scale-95 disabled:opacity-60"
        >
          <Download className="w-4 h-4 flex-shrink-0" />
          <span>ऐप इंस्टॉल करें</span>
        </button>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  if (variant === "admin") {
    if (isDesktop && !isInstallable) return null;

    return (
      <>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 font-hindi font-semibold py-3 rounded-xl hover:bg-green-100 transition-colors text-sm active:scale-95 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {installing ? "Installing..." : "ऐप इंस्टॉल करें"}
        </button>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  if (isDesktop && !isInstallable) return null;

  return (
    <>
      <div className="fixed bottom-[64px] left-0 right-0 z-[990] md:bottom-4 md:left-auto md:right-4 md:max-w-sm px-3 md:px-0">
        <div className="bg-white rounded-2xl shadow-2xl border border-green-100 p-3 flex items-center gap-3">
          <img
            src="/apple-touch-icon.png"
            alt="Annadata Agri & Seeds"
            className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-hindi font-bold text-gray-800 text-sm leading-tight">
              Annadata Agri & Seeds
            </p>
            <p className="text-gray-500 text-xs font-hindi">
              {isIOS ? "iPhone Home Screen पर जोड़ें" : "Home Screen पर जोड़ें — मुफ्त"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="bg-green-600 text-white font-hindi font-bold text-xs px-3 py-2 rounded-xl hover:bg-green-700 transition-colors active:scale-95 disabled:opacity-60 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              {buttonLabel}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
    </>
  );
}
