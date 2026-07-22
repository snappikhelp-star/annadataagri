// AUTO-BILINGUAL UPDATE: Hardcoded Hindi UI labels converted to English where possible.
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BookOpen,
  BarChart3, Boxes, LogOut, Menu, X, Leaf, ChevronRight,
  Zap, CalendarDays, Camera, Truck, Bell, Globe, Layers, Building2, Wallet, Inbox, Info
} from "lucide-react";

const fullNavItems = [
  { path: "/admin/today", key: "today", icon: CalendarDays, simple: true },
  { path: "/admin/quick-sale", key: "quickSale", icon: Zap, simple: true },
  { path: "/admin/quick-stock", key: "quickStock", icon: Boxes, simple: true },
  { path: "/admin/khata", key: "khata", icon: BookOpen, simple: true },
  { path: "/admin", key: "dashboard", icon: LayoutDashboard, exact: true, simple: false },
  { path: "/admin/billing", key: "billing", icon: ShoppingCart, simple: false },
  { path: "/admin/products", key: "products", icon: Package, simple: false },
  { path: "/admin/stock", key: "stock", icon: Boxes, simple: false },
  { path: "/admin/customers", key: "customers", icon: Users, simple: false },
  { path: "/admin/bill-photo", key: "billPhoto", icon: Camera, simple: false },
  { path: "/admin/purchase", key: "purchase", icon: Truck, simple: false },
  { path: "/admin/company-payments", key: "companyPayments", icon: Building2, simple: false },
  { path: "/admin/udhaar", key: "udhaarCollection", icon: Wallet, simple: true },
  { path: "/admin/enquiries", key: "enquiries", icon: Inbox, simple: true },
  { path: "/admin/kisan-info", key: "kisanInfo", icon: Info, simple: false },
  { path: "/admin/followup", key: "followup", icon: Bell, simple: false },
  { path: "/admin/reports", key: "reports", icon: BarChart3, simple: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { lang, setLang, simpleMode, setSimpleMode, t } = useLang();

  const navItems = simpleMode ? fullNavItems.filter(n => n.simple) : fullNavItems;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location === path;
    return location.startsWith(path);
  };

  const currentPage = fullNavItems.find(n => isActive(n.path, n.exact));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-green-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-900" />
              </div>
              <div>
                <h1 className="text-white font-bold font-hindi text-base leading-tight">अन्नदाता</h1>
                <p className="text-green-300 text-xs font-hindi">स्मार्ट Shop</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setLang("hi")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === "hi" ? "bg-yellow-400 text-green-900" : "bg-green-700 text-green-300 hover:bg-green-600"}`}>
                हिंदी
              </button>
              <button onClick={() => setLang("en")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === "en" ? "bg-yellow-400 text-green-900" : "bg-green-700 text-green-300 hover:bg-green-600"}`}>
                English
              </button>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-green-700">
            <button onClick={() => setSimpleMode(!simpleMode)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${simpleMode ? "bg-yellow-400 text-green-900" : "bg-green-700/50 text-green-200 hover:bg-green-700"}`}>
              <Layers className="w-4 h-4 flex-shrink-0" />
              <span className="font-hindi text-sm font-bold">{simpleMode ? t("simpleMode") + " ON" : t("fullMode")}</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${simpleMode ? "bg-green-900 text-yellow-400" : "bg-green-600 text-green-300"}`}>
                {simpleMode ? "सरल" : "पूरा"}
              </span>
            </button>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {!simpleMode && (
              <p className="text-green-500 text-xs font-hindi px-2 py-1 uppercase tracking-wide">त्वरित</p>
            )}
            {navItems.filter(n => n.simple).map(item => (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path, item.exact)
                    ? "bg-yellow-400 text-green-900 font-bold shadow-md"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                }`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-hindi text-sm">{t(item.key as any)}</span>
                {isActive(item.path, item.exact) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            ))}

            {!simpleMode && (
              <>
                <p className="text-green-500 text-xs font-hindi px-2 py-1 mt-2 uppercase tracking-wide">प्रबंधन</p>
                {navItems.filter(n => !n.simple).map(item => (
                  <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path, item.exact)
                        ? "bg-yellow-400 text-green-900 font-bold shadow-md"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-hindi text-sm">{t(item.key as any)}</span>
                    {isActive(item.path, item.exact) && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="px-3 py-4 border-t border-green-700">
            <div className="px-4 py-3 bg-green-700/50 rounded-xl mb-3">
              <p className="text-green-200 text-xs font-hindi">लॉगिन:</p>
              <p className="text-white text-sm font-medium truncate">{user?.email}</p>
            </div>
            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-hindi text-sm">{t("logout")}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-bold text-gray-800 font-hindi text-lg">
                {currentPage ? t(currentPage.key as any) : "Admin"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${lang === "hi" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>
                हि
              </button>
              <button onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${lang === "en" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>
                En
              </button>
            </div>
            <button onClick={() => setSimpleMode(!simpleMode)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hindi font-bold transition-all border ${simpleMode ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}>
              <Layers className="w-3.5 h-3.5" />
              {simpleMode ? "सरल मोड" : "पूरा मोड"}
            </button>
            <Link href="/" target="_blank" className="text-xs text-green-600 font-hindi hover:underline hidden md:block">
              → {t("viewWebsite")}
            </Link>
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
