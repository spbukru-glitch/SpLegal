import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { LogOut, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUSES = ["new", "contacted", "scheduled", "completed", "cancelled"];
const STATUS_STYLE = {
  new: "bg-gold/15 text-gold border-gold/40",
  contacted: "bg-blue-500/15 text-blue-300 border-blue-400/40",
  scheduled: "bg-violet-500/15 text-violet-300 border-violet-400/40",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  cancelled: "bg-red-500/15 text-red-300 border-red-400/40",
};

const emptyService = { name: "", fee: "", category: "" };

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [svcForm, setSvcForm] = useState(emptyService);

  const load = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([api.get("/admin/bookings"), api.get("/services")]);
      setBookings(b.data);
      setServices(s.data);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/bookings/${id}`, { status });
      setBookings((bs) => bs.map((b) => (b._id === id ? data : b)));
      toast.success(`Booking marked ${status}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      setBookings((bs) => bs.filter((b) => b._id !== id));
      toast.success("Booking deleted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const openServiceDialog = (svc) => {
    setEditing(svc || null);
    setSvcForm(svc ? { name: svc.name, fee: svc.fee, category: svc.category } : emptyService);
    setDialogOpen(true);
  };

  const saveService = async () => {
    if (!svcForm.name.trim() || !svcForm.fee.trim()) {
      toast.error("Name and fee are required");
      return;
    }
    try {
      if (editing) {
        const { data } = await api.patch(`/admin/services/${editing._id}`, svcForm);
        setServices((sv) => sv.map((s) => (s._id === editing._id ? data : s)));
        toast.success("Service updated");
      } else {
        const { data } = await api.post("/admin/services", svcForm);
        setServices((sv) => [...sv, data]);
        toast.success("Service added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service? It will disappear from the website price list.")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      setServices((sv) => sv.filter((s) => s._id !== id));
      toast.success("Service deleted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const newCount = bookings.filter((b) => b.status === "new").length;

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-paper" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/brand/seal.png" alt="Seal" className="h-10 w-10 rounded-full ring-1 ring-gold/50" />
            <div>
              <p className="font-display text-xl leading-none text-paper">SpLegalMart · Admin</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-gold">Real-time management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 border border-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink"
              data-testid="admin-refresh-button"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 border border-paper/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-paper/70 transition-colors hover:border-red-400/60 hover:text-red-300"
              data-testid="admin-logout-button"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-1 px-5 sm:px-8">
          {[
            { id: "bookings", label: "Bookings", count: bookings.length },
            { id: "services", label: "Services", count: services.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                tab === t.id ? "border-gold text-gold" : "border-transparent text-paper/50 hover:text-paper"
              }`}
            >
              {t.label}
              {t.id === "bookings" && newCount > 0 && (
                <span className="ml-2 bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink" data-testid="admin-new-bookings-badge">
                  {newCount} new
                </span>
              )}
              {t.id === "services" && <span className="ml-2 text-xs opacity-60">{t.count}</span>}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {tab === "bookings" && (
          <div className="overflow-x-auto border border-gold/20" data-testid="admin-bookings-table-wrap">
            <table className="w-full min-w-[1080px] text-left text-sm" data-testid="admin-bookings-table">
              <thead>
                <tr className="bg-ink-800 text-[11px] uppercase tracking-[0.16em] text-gold">
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Preferred</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-paper/50" data-testid="admin-bookings-empty">
                      No bookings yet — new consultation requests will appear here instantly.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t border-white/5 align-top transition-colors hover:bg-white/[0.03]" data-testid="admin-booking-row">
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-paper/60">
                      {dayjs(b.created_at).format("DD MMM · HH:mm")}
                    </td>
                    <td className="px-4 py-4 font-medium text-paper">{b.full_name}</td>
                    <td className="px-4 py-4 text-xs leading-relaxed text-paper/70">
                      {b.mobile}
                      <br />
                      <span className="text-paper/45">{b.email || "—"}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-paper/70">{b.mode}</td>
                    <td className="px-4 py-4 text-xs text-paper/70">{b.preferred_time || "—"}</td>
                    <td className="max-w-[280px] px-4 py-4 text-xs leading-relaxed text-paper/70">
                      <span className="line-clamp-3">{b.issue}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Select value={b.status} onValueChange={(v) => setStatus(b._id, v)}>
                        <SelectTrigger
                          className={`h-8 w-32 border text-xs font-semibold capitalize ${STATUS_STYLE[b.status] || "bg-ink-800 text-paper"}`}
                          data-testid={`booking-status-select-${b._id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-ink-800 border-gold/30 text-paper">
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => deleteBooking(b._id)}
                        className="p-2 text-paper/40 transition-colors hover:text-red-400"
                        aria-label="Delete booking"
                        data-testid={`booking-delete-button-${b._id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "services" && (
          <div data-testid="admin-services-tab">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-paper/60">Edits appear on the public price list immediately.</p>
              <Button onClick={() => openServiceDialog(null)} className="bg-gold text-ink hover:bg-gold-400" data-testid="admin-add-service-button">
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </div>
            <div className="overflow-x-auto border border-gold/20" data-testid="admin-services-table-wrap">
              <table className="w-full min-w-[720px] text-left text-sm" data-testid="admin-services-table">
                <thead>
                  <tr className="bg-ink-800 text-[11px] uppercase tracking-[0.16em] text-gold">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Fee (₹)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s._id} className="border-t border-white/5 transition-colors hover:bg-white/[0.03]" data-testid="admin-service-row">
                      <td className="px-4 py-3 font-display italic text-paper/40">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-4 py-3 text-paper">{s.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-gold/40 bg-gold/10 text-xs text-gold">
                          {s.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-gold">{s.fee}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openServiceDialog(s)} className="p-2 text-paper/50 transition-colors hover:text-gold" aria-label="Edit service" data-testid={`service-edit-button-${s._id}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteService(s._id)} className="p-2 text-paper/40 transition-colors hover:text-red-400" aria-label="Delete service" data-testid={`service-delete-button-${s._id}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-gold/30 bg-ink-900 text-paper" data-testid="service-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Service Name</span>
              <Input
                value={svcForm.name}
                onChange={(e) => setSvcForm((f) => ({ ...f, name: e.target.value }))}
                className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                data-testid="service-dialog-name-input"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Fee (as displayed)</span>
              <Input
                value={svcForm.fee}
                onChange={(e) => setSvcForm((f) => ({ ...f, fee: e.target.value }))}
                placeholder="e.g. 4,999 or 0.5% of cost"
                className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                data-testid="service-dialog-fee-input"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Category</span>
              <Input
                value={svcForm.category}
                onChange={(e) => setSvcForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Litigation"
                className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                data-testid="service-dialog-category-input"
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} data-testid="service-dialog-cancel">
              Cancel
            </Button>
            <Button onClick={saveService} className="bg-gold text-ink hover:bg-gold-400" data-testid="service-dialog-save">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
