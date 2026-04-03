"use client";

import React, { createContext, useContext, useEffect } from "react";
import { AuthSession } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthState } from "@/store/auth-store";

interface AuthContextType extends AuthSession {
    login: AuthState["login"];
    register: AuthState["register"];
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    changePassword: AuthState["changePassword"];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider acts as a bridge between the initial server state/refresh
 * and the Zustand store. It keeps the same API as before for compatibility.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const store = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Initial hydration
        store.refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = async () => {
        await store.logout();
        router.push("/login");
        router.refresh();
    };

    return (
        <AuthContext.Provider
            value={{
                user: store.user,
                status: store.status,
                login: store.login,
                register: store.register,
                logout,
                refresh: store.refreshUser,
                changePassword: store.changePassword,
            }}
        >
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
