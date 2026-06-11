import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LangProvider } from "@/contexts/LangContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminStock from "@/pages/admin/AdminStock";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminKhata from "@/pages/admin/AdminKhata";
import AdminReports from "@/pages/admin/AdminReports";
import AdminToday from "@/pages/admin/AdminToday";
import AdminQuickSale from "@/pages/admin/AdminQuickSale";
import AdminQuickStock from "@/pages/admin/AdminQuickStock";
import AdminBillPhoto from "@/pages/admin/AdminBillPhoto";
import AdminPurchase from "@/pages/admin/AdminPurchase";
import AdminFollowup from "@/pages/admin/AdminFollowup";
import AdminCompanyPayments from "@/pages/admin/AdminCompanyPayments";
import AdminUdhaar from "@/pages/admin/AdminUdhaar";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ReviewsPage from "@/pages/reviews";
import SupabaseTest from "@/pages/SupabaseTest";

const queryClient = new QueryClient();

function AdminRoutes() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/today" component={AdminToday} />
          <Route path="/admin/quick-sale" component={AdminQuickSale} />
          <Route path="/admin/quick-stock" component={AdminQuickStock} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/products/add" component={AdminProducts} />
          <Route path="/admin/stock" component={AdminStock} />
          <Route path="/admin/billing" component={AdminBilling} />
          <Route path="/admin/billing/new" component={AdminBilling} />
          <Route path="/admin/customers" component={AdminCustomers} />
          <Route path="/admin/khata" component={AdminKhata} />
          <Route path="/admin/bill-photo" component={AdminBillPhoto} />
          <Route path="/admin/purchase" component={AdminPurchase} />
          <Route path="/admin/followup" component={AdminFollowup} />
          <Route path="/admin/company-payments" component={AdminCompanyPayments} />
          <Route path="/admin/udhaar" component={AdminUdhaar} />
          <Route path="/admin/reports" component={AdminReports} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/supabase-test" component={SupabaseTest} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminRoutes} />
      <Route path="/admin/:rest*" component={AdminRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LangProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </LangProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
