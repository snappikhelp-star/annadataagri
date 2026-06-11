import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-hindi text-lg">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
