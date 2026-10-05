import { useEffect } from "react";
import { Component } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import "@/App.css";
import "@/index.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import CSRPage from "@/pages/CSRPage";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error(error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink text-paper"
          data-testid="error-boundary"
        >
          <p className="font-display text-3xl">Something went wrong.</p>
          <button
            className="px-6 py-2 bg-gold text-ink font-semibold"
            onClick={() => this.setState({ error: null })}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LenisSetup() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminRoute() {
  const { token } = useAuth();
  return token ? <AdminDashboard /> : <AdminLogin />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <LenisSetup />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/csr" element={<CSRPage />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" theme="dark" />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
