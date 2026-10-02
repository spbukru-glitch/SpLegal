import { createContext, useContext, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("spl_admin_token"));

  const value = useMemo(
    () => ({
      token,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("spl_admin_token", data.access_token);
        setToken(data.access_token);
        return data.user;
      },
      async logout() {
        try {
          await api.post("/auth/logout");
        } catch (e) {
          /* ignore network errors on logout */
        }
        localStorage.removeItem("spl_admin_token");
        setToken(null);
      },
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
