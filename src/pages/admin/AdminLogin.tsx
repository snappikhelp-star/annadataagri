import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Eye, EyeOff, Leaf, LogIn, AlertTriangle } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";

export default function AdminLogin() {
  const { signIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      if (error.toLowerCase().includes("invalid login") || error.toLowerCase().includes("invalid credentials")) {
        setError("गलत Email या Password है। Supabase Auth में user बनाएं और दोबारा कोशिश करें।");
      } else if (error.toLowerCase().includes("email not confirmed")) {
        setError("Email confirm नहीं है। Supabase → Authentication → Users में email confirm करें।");
      } else if (error.toLowerCase().includes("network") || error.toLowerCase().includes("fetch")) {
        setError("Supabase से connection नहीं हो पाया। VITE_SUPABASE_URL सही है?");
      } else {
        setError(`Login error: ${error}`);
      }
    } else {
      setLocation("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-hindi">अन्नदाता स्मार्ट दुकान</h1>
            <p className="text-green-200 mt-1 font-hindi text-sm">Admin Panel — केशव भाई</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-base transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 font-hindi mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-base transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-hindi">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl text-lg font-hindi flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}
            </button>

            <p className="text-center text-xs text-gray-400 font-hindi pt-2">
              केवल अधिकृत उपयोगकर्ता ही प्रवेश कर सकते हैं
            </p>

            <div className="pt-1">
              <InstallAppButton variant="admin" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
