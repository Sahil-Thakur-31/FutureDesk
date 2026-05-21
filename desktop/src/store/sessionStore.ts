import { create } from "zustand";
import type { AuthResponse, User } from "@futuredesk/shared";
import { apiClient } from "../lib/api";

type SessionState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: (() => {
    const raw = window.localStorage.getItem("futuredesk.user");
    return raw ? (JSON.parse(raw) as User) : null;
  })(),
  token: window.localStorage.getItem("futuredesk.token"),
  isLoading: false,
  error: null,
  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem("futuredesk.user", JSON.stringify(response.user));
      window.localStorage.setItem("futuredesk.token", response.tokens.accessToken);
      set({ user: response.user, token: response.tokens.accessToken, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : "Sign-in failed" });
    }
  },
  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem("futuredesk.user", JSON.stringify(response.user));
      window.localStorage.setItem("futuredesk.token", response.tokens.accessToken);
      set({ user: response.user, token: response.tokens.accessToken, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : "Registration failed" });
    }
  },
  logout() {
    window.localStorage.removeItem("futuredesk.user");
    window.localStorage.removeItem("futuredesk.token");
    set({ user: null, token: null, isLoading: false, error: null });
  },
  clearError() {
    set({ error: null });
  }
}));
