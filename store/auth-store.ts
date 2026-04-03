import { create } from "zustand";
import { AppUser, AuthStatus } from "@/types/auth";
import { PasswordChangeInput } from "@/lib/validators/auth";

export interface AuthState {
    user: AppUser | null;
    status: AuthStatus;
    setUser: (user: AppUser | null) => void;
    setStatus: (status: AuthStatus) => void;

    // Actions
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    register: (
        email: string,
        pass: string,
        confirmPass: string,
        displayName?: string,
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    changePassword: (data: PasswordChangeInput) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",

    setUser: (user) => set({ user }),
    setStatus: (status) => set({ status }),

    refreshUser: async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            set({ user: data.user, status: data.status });
        } catch (error) {
            console.error("Failed to refresh user:", error);
            set({ status: "unauthenticated" });
        }
    },

    login: async (email: string, pass: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password: pass }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (data.success) {
                set({ user: data.user, status: "authenticated" });
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Erreur réseau" };
        }
    },

    register: async (email, pass, confirmPass, displayName) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password: pass,
                    confirmPassword: confirmPass,
                    displayName,
                }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (data.success) {
                if (data.user) {
                    set({ user: data.user, status: "authenticated" });
                }
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Erreur réseau" };
        }
    },

    logout: async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            set({ user: null, status: "unauthenticated" });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    changePassword: async (data) => {
        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || "Une erreur est survenue" };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: "Erreur réseau ou serveur" };
        }
    },
}));
