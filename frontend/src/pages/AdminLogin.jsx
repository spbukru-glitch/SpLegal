import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const inputCls =
  "w-full border border-gold/25 bg-ink-800/60 px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition-colors duration-200 focus:border-gold focus:outline-none";

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      toast.success("Welcome back, Admin.");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain flex min-h-screen items-center justify-center bg-ink px-5 py-16" data-testid="admin-login-page">
      <div className="relative z-10 w-full max-w-md">
        <div className="border border-gold/25 bg-ink-800/70 p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <img src="/brand/seal.png" alt="SpLegalMart seal" className="h-16 w-16 rounded-full ring-1 ring-gold/50" />
            <h1 className="mt-5 font-display text-3xl font-medium text-paper">Admin Panel</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-gold">SpLegalMart · Manage in real time</p>
          </div>
          <form onSubmit={submit} className="mt-8 grid gap-5" data-testid="admin-login-form">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@splegalmart.com"
                className={inputCls}
                data-testid="admin-email-input"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                data-testid="admin-password-input"
              />
            </label>
            {error && (
              <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" data-testid="admin-login-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex items-center justify-center gap-2 bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:bg-gold-400 disabled:opacity-60"
              data-testid="admin-login-button"
            >
              <Lock className="h-4 w-4" />
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-paper/60 transition-colors hover:text-gold"
          data-testid="admin-back-to-site"
        >
          <ArrowLeft className="h-4 w-4" /> Back to website
        </a>
      </div>
    </div>
  );
}
