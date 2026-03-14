import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import TrialBanner from "./components/TrialBanner";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import BottomNav from "./components/BottomNav";
import FeatureGate from "./components/FeatureGate";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Bids from "./pages/Bids";
import BidDetail from "./pages/BidDetail";
import Contacts from "./pages/Contacts";
import Calculator from "./pages/Calculator";
import PublicCalculator from "./pages/PublicCalculator";
import References from "./pages/References";
import CompanyInfo from "./pages/CompanyInfo";
import Settings from "./pages/Settings";
import "./index.css";

/* ─── Auth Guard ─── */
function ProtectedRoute() {
  const { user, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading xiriOS…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;

  return (
    <div className="app-layout">
      {/* Mobile top bar — logo only */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <span className="sidebar-logo-dot" />
          <span>xiri<span style={{ color: "#00d4aa" }}>OS</span></span>
        </div>
      </div>

      <Sidebar />
      <div className="app-content-wrapper">
        <TrialBanner />
        <PwaInstallPrompt />
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomNav />
    </div>
  );
}

/* ─── Gated Page Wrapper ─── */
function GatedPage({ feature, children }: { feature: string; children: React.ReactNode }) {
  return (
    <FeatureGate feature={feature as import("./lib/rbac").Feature}>
      {children}
    </FeatureGate>
  );
}

/* ─── Placeholder Pages for gated features ─── */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#e8eaf0", fontWeight: 700, fontSize: "1.5rem" }}>{title}</h1>
    </div>
  );
}

/* ─── App ─── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/app">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1d2e",
              color: "#e8eaf0",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.8125rem",
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route path="/calculator" element={<PublicCalculator />} />

          <Route element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="bids" element={<Bids />} />
            <Route path="bids/new" element={<Calculator />} />
            <Route path="bids/:bidId" element={<BidDetail />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="references" element={<References />} />
            <Route path="company" element={<CompanyInfo />} />
            <Route path="settings" element={<Settings />} />

            {/* Gated routes — show UpgradePrompt if tier is too low */}
            <Route path="invoicing" element={<GatedPage feature="invoicing"><PlaceholderPage title="Invoicing" /></GatedPage>} />
            <Route path="scheduling" element={<GatedPage feature="scheduling"><PlaceholderPage title="Scheduling" /></GatedPage>} />
            <Route path="timekeeping" element={<GatedPage feature="timekeeping"><PlaceholderPage title="Timekeeping" /></GatedPage>} />
            <Route path="checklists" element={<GatedPage feature="checklists"><PlaceholderPage title="Checklists" /></GatedPage>} />
            <Route path="inspections" element={<GatedPage feature="inspections"><PlaceholderPage title="Inspections" /></GatedPage>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/* ─── Login route guard (redirect if already logged in) ─── */
function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

/* ─── Onboarding route guard ─── */
function OnboardingRoute() {
  const { user, loading, needsOnboarding } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!needsOnboarding) return <Navigate to="/" replace />;
  return <Onboarding />;
}
