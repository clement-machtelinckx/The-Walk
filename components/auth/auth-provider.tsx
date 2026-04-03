"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppUser, AuthSession, AuthStatus } from "@/types/auth";
import { useRouter } from "next/navigation";

interface AuthContextType extends AuthSession {
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    register: (
        email: string,
        pass: string,
        confirmPass: string,
        displayName?: string,
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");
    const router = useRouter();

    const fetchMe = useCallback(async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            setUser(data.user);
            setStatus(data.status);
        } catch (error) {
            console.error("Failed to fetch auth state:", error);
            setStatus("unauthenticated");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMe();
    }, [fetchMe]);

    const login = async (email: string, pass: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password: pass }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                setStatus("authenticated");
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Erreur réseau" };
        }
    };

    const register = async (
        email: string,
        pass: string,
        confirmPass: string,
        displayName?: string,
    ) => {
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
                    setUser(data.user);
                    setStatus("authenticated");
                }
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Erreur réseau" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            setStatus("unauthenticated");
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, status, login, register, logout, refresh: fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new AuthError("useAuth must be used within an AuthProvider");
    }
    return context;
};

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}
