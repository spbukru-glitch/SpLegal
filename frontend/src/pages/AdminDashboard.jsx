import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Download, ImagePlus, LogOut, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUSES = ["new", "contacted", "scheduled", "completed", "cancelled"];
const STATUS_STYLE = {
  new: "bg-gold/15 text-gold border-gold/40",
  contacted: "bg-blue-500/15 text-blue-300 border-blue-400/40",
  scheduled: "bg-violet-500/15 text-violet-300 border-violet-400/40",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  cancelled: "bg-red-500/15 text-red-300 border-red-400/40",
};
const CSR_TYPES = [
  { value: "photo", label: "Photo (upload image)" },
  { value: "video", label: "Video (link)" },
  { value: "blog", label: "Blog (link)" },
  { value: "article", label: "Article (link)" },
  { value: "social", label: "Social media (link)" },
];

const emptyService = { name: "", fee: "", category: "" };
const emptyCsr = { title: "", caption: "", media_type: "photo", url: "" };

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [csrMedia, setCsrMedia] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [svcForm, setSvcForm] = useState(emptyService);
  const [csrForm, setCsrForm] = useState(emptyCsr);
  const [csrFile, setCsrFile] = useState(null);
  const [csrBusy, setCsrBusy] = useState(false);
  const csrFileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [b, s, c] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/services"),
        api.get("/admin/csr/media"),
      ]);
      setBookings(b.data);
      setServices(s.data);
      setCsrMedia(c.data);
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

  const downloadAttachment = async (b) => {
    try {
      const res = await api.get(`/admin/bookings/${b._id}/attachment`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = b.attachment.original_filename || "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not download attachment");
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
        toast.success("Service updated — price list is now live");
      } else {
        const { data } = await api.post("/admin/services", svcForm);
        setServices((sv) => [...sv, data]);
        toast.success("Service added — price list is now live");
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

  const uploadCsr = async () => {
    if (csrForm.title.trim().length < 2) {
      toast.error("Title is required");
      return;
    }
    if (csrForm.media_type === "photo" && !csrFile) {
      toast.error("Choose a photo to upload");
      return;
    }
    if (csrForm.media_type !== "photo" && !csrForm.url.trim()) {
      toast.error("Paste the link URL");
      return;
    }
    setCsrBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", csrForm.title);
      fd.append("caption", csrForm.caption);
      fd.append("media_type", csrForm.media_type);
      fd.append("url", csrForm.url);
      if (csrFile) fd.append("file", csrFile);
      const { data } = await api.post("/admin/csr/media", fd);
      setCsrMedia((m) => [data, ...m]);
      setCsrForm(emptyCsr);
      setCsrFile(null);
      if (csrFileRef.current) csrFileRef.current.value = "";
      toast.success("Published to the CSR page");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setCsrBusy(false);
    }
  };

  const deleteCsr = async (id) => {
    if (!window.confirm("Remove this from the CSR page?")) return;
    try {
      await api.delete(`/admin/csr/media/${id}`);
      setCsrMedia((m) => m.filter((x) => x._id !== id));
      toast.success("Removed from CSR page");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const newCount = bookings.filter((b) => b.status === "new").length;
  const visibleCsr = csrMedia.filter((m) => m.published);

  const tabBtn = (id, label, extra) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      data-testid={`admin-tab-${id}`}
      className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
        tab === id ? "border-gold text-gold" : "border-transparent text-paper/50 hover:text-paper"
      }`}
    >
      {label}
      {extra}
    </button>
  );

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
          {tabBtn(
            "bookings",
            "Bookings",
            newCount > 0 && (
              <span className="ml-2 bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink" data-testid="admin-new-bookings-badge">
                {newCount} new
              </span>
            )
          )}
          {tabBtn("services", "Services", <span className="ml-2 text-xs opacity-60">{services.length}</span>)}
          {tabBtn("csr", "CSR Media", <span className="ml-2 text-xs opacity-60">{visibleCsr.length}</span>)}
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
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-paper/50" data-testid="admin-bookings-empty">
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
                      {b.attachment ? (
                        <button
                          onClick={() => downloadAttachment(b)}
                          className="flex items-center gap-2 border border-gold/40 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold hover:text-ink"
                          data-testid={`booking-attachment-download-${b._id}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="max-w-[120px] truncate">{b.attachment.original_filename}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-paper/30">—</span>
                      )}
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
              <p className="text-sm text-paper/60">Edits appear on the public price list immediately — the website shows live pricing from here.</p>
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

        {tab === "csr" && (
          <div data-testid="admin-csr-tab">
            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
              <div className="h-fit border border-gold/25 bg-ink-800/70 p-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <ImagePlus className="h-4 w-4" /> Publish to CSR Page
                </p>
                <div className="mt-5 grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-xs text-paper/60">Type</span>
                    <Select value={csrForm.media_type} onValueChange={(v) => setCsrForm((f) => ({ ...f, media_type: v }))}>
                      <SelectTrigger className="border-gold/25 bg-ink-800 text-paper" data-testid="csr-media-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-ink-800 border-gold/30 text-paper">
                        {CSR_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs text-paper/60">Title</span>
                    <Input
                      value={csrForm.title}
                      onChange={(e) => setCsrForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Plantation drive at Ranchi"
                      className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                      data-testid="csr-media-title-input"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs text-paper/60">Caption (optional)</span>
                    <Input
                      value={csrForm.caption}
                      onChange={(e) => setCsrForm((f) => ({ ...f, caption: e.target.value }))}
                      placeholder="Short description"
                      className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                      data-testid="csr-media-caption-input"
                    />
                  </label>
                  {csrForm.media_type === "photo" ? (
                    <label className="grid gap-1.5">
                      <span className="text-xs text-paper/60">Photo (JPG/PNG/WebP · max 10 MB)</span>
                      <input
                        ref={csrFileRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => setCsrFile(e.target.files?.[0] || null)}
                        className="w-full border border-dashed border-gold/40 bg-ink-900/60 px-3 py-2 text-xs text-paper/70 file:mr-3 file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                        data-testid="csr-media-file-input"
                      />
                    </label>
                  ) : (
                    <label className="grid gap-1.5">
                      <span className="text-xs text-paper/60">Link URL (video / blog / article / social)</span>
                      <Input
                        value={csrForm.url}
                        onChange={(e) => setCsrForm((f) => ({ ...f, url: e.target.value }))}
                        placeholder="https://…"
                        className="border-gold/25 bg-ink-800 text-paper focus-visible:ring-gold"
                        data-testid="csr-media-url-input"
                      />
                    </label>
                  )}
                  <Button onClick={uploadCsr} disabled={csrBusy} className="bg-gold text-ink hover:bg-gold-400" data-testid="csr-media-publish-button">
                    {csrBusy ? "Publishing…" : "Publish"}
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm text-paper/60">
                  Live on the CSR page: <span className="font-semibold text-paper">{visibleCsr.length}</span> item(s).
                </p>
                {visibleCsr.length === 0 ? (
                  <p className="border border-dashed border-gold/25 p-8 text-sm text-paper/45" data-testid="admin-csr-empty">
                    Nothing published yet — upload your first photo using the form.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2" data-testid="admin-csr-grid">
                    {visibleCsr.map((m) => (
                      <div key={m._id} className="border border-gold/20 bg-ink-800/60 p-3" data-testid="admin-csr-card">
                        {m.media_type === "photo" && m.storage_path ? (
                          <img src={`${API}/csr/media/${m._id}/file`} alt={m.title} className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <a href={m.url} target="_blank" rel="noreferrer" className="flex aspect-[4/3] w-full items-center justify-center border border-gold/25 text-xs uppercase tracking-[0.2em] text-gold hover:border-gold">
                            {m.media_type} link ↗
                          </a>
                        )}
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-paper">{m.title}</p>
                            {m.caption && <p className="mt-0.5 text-xs text-paper/55">{m.caption}</p>}
                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-paper/35">
                              {m.media_type} · {dayjs(m.created_at).format("DD MMM")}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteCsr(m._id)}
                            className="p-2 text-paper/40 transition-colors hover:text-red-400"
                            aria-label="Remove media"
                            data-testid={`csr-media-delete-${m._id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
