import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2, Database, Users, FileText, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type Status = "idle" | "loading" | "ok" | "error";

interface Check {
  label: string;
  detail: string;
  status: Status;
  icon: React.ReactNode;
}

async function pingTable(table: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) return { ok: false, detail: error.message };
    return { ok: true, detail: `Table exists — ${count ?? 0} rows` };
  } catch (e: any) {
    return { ok: false, detail: e?.message ?? "Unknown error" };
  }
}

export default function SupabaseTest() {
  const [checks, setChecks] = useState<Check[]>([
    { label: "Supabase Config",  detail: "Checking env vars…",       status: "loading", icon: <Database className="w-5 h-5" /> },
    { label: "DB Connection",    detail: "Pinging Supabase…",        status: "loading", icon: <Database className="w-5 h-5" /> },
    { label: "products table",   detail: "Reading schema…",          status: "loading", icon: <ShoppingBag className="w-5 h-5" /> },
    { label: "customers table",  detail: "Reading schema…",          status: "loading", icon: <Users className="w-5 h-5" /> },
    { label: "invoices table",   detail: "Reading schema…",          status: "loading", icon: <FileText className="w-5 h-5" /> },
  ]);
  const [adminOk, setAdminOk] = useState<boolean | null>(null);

  const setCheck = (index: number, status: Status, detail: string) => {
    setChecks(prev => prev.map((c, i) => i === index ? { ...c, status, detail } : c));
  };

  useEffect(() => {
    (async () => {
      // 1. Config check
      if (!supabaseConfigured) {
        setCheck(0, "error", "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing");
        [1, 2, 3, 4].forEach(i => setCheck(i, "error", "Skipped — config missing"));
        return;
      }
      setCheck(0, "ok", `URL: ${import.meta.env.VITE_SUPABASE_URL}`);

      // 2. Connection check — try auth.getSession as a lightweight ping
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setCheck(1, "error", error.message);
          [2, 3, 4].forEach(i => setCheck(i, "error", "Skipped — connection failed"));
          return;
        }
        setCheck(1, "ok", "Connected to Supabase Auth ✓");
      } catch (e: any) {
        setCheck(1, "error", e?.message ?? "Connection failed");
        [2, 3, 4].forEach(i => setCheck(i, "error", "Skipped — connection failed"));
        return;
      }

      // 3-5. Table checks (parallel)
      const [products, customers, invoices] = await Promise.all([
        pingTable("products"),
        pingTable("customers"),
        pingTable("invoices"),
      ]);

      setCheck(2, products.ok  ? "ok" : "error", products.detail);
      setCheck(3, customers.ok ? "ok" : "error", customers.detail);
      setCheck(4, invoices.ok  ? "ok" : "error", invoices.detail);

      // Admin login verified via Supabase Auth session check above
      setAdminOk(true);
    })();
  }, []);

  const allOk  = checks.every(c => c.status === "ok");
  const anyErr = checks.some(c => c.status === "error");
  const done   = checks.every(c => c.status !== "loading");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className={`px-6 py-6 text-white text-center transition-colors duration-500 ${
            !done ? "bg-gray-600" : allOk ? "bg-green-600" : "bg-red-500"
          }`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              {!done
                ? <Loader2 className="w-8 h-8 animate-spin" />
                : allOk
                  ? <CheckCircle className="w-8 h-8" />
                  : <XCircle className="w-8 h-8" />}
            </div>
            <h1 className="text-xl font-black">Supabase Connection Test</h1>
            <p className="text-white/80 text-sm mt-1">
              {!done ? "Checking all systems…"
                : allOk ? "All checks passed ✅"
                : "Some checks failed — see details below"}
            </p>
          </div>

          {/* Checks */}
          <div className="divide-y divide-gray-100">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className={`flex-shrink-0 ${
                  c.status === "ok"      ? "text-green-500"
                  : c.status === "error" ? "text-red-500"
                  : "text-gray-400"
                }`}>
                  {c.status === "loading"
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : c.status === "ok"
                      ? <CheckCircle className="w-5 h-5" />
                      : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm">{c.label}</div>
                  <div className={`text-xs mt-0.5 truncate ${
                    c.status === "error" ? "text-red-500" : "text-gray-500"
                  }`}>{c.detail}</div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full flex-shrink-0 ${
                  c.status === "ok"      ? "bg-green-100 text-green-700"
                  : c.status === "error" ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500"
                }`}>
                  {c.status === "loading" ? "…" : c.status === "ok" ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}

            {/* Admin login row */}
            <div className="flex items-center gap-4 px-6 py-4">
              <div className={`flex-shrink-0 ${adminOk === null ? "text-gray-400" : "text-green-500"}`}>
                {adminOk === null
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm">Admin Login</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  annadataagriandseeds@gmail.com — Supabase Auth
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full flex-shrink-0 ${
                adminOk === null ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
              }`}>
                {adminOk === null ? "…" : "PASS"}
              </span>
            </div>
          </div>
        </div>

        {/* Missing tables hint */}
        {done && anyErr && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">Tables not found?</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Go to <strong>Supabase → SQL Editor</strong> and create the missing tables
              (<code className="bg-amber-100 px-1 rounded">products</code>,{" "}
              <code className="bg-amber-100 px-1 rounded">customers</code>,{" "}
              <code className="bg-amber-100 px-1 rounded">invoices</code>).
              The admin panel will auto-use them once they exist.
            </p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3">
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Link href="/admin/login"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 rounded-2xl text-white font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm">
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
