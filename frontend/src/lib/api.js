import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("spl_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (
      err.response?.status === 401 &&
      localStorage.getItem("spl_admin_token") &&
      !err.config?.url?.includes("/auth/login")
    ) {
      localStorage.removeItem("spl_admin_token");
      if (window.location.pathname.startsWith("/admin")) window.location.reload();
    }
    return Promise.reject(err);
  }
);

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" · ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function scrollToId(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (window.lenis) window.lenis.scrollTo(el, { offset: -76 });
  else el.scrollIntoView({ behavior: "smooth" });
}
