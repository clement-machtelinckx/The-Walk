"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect } from "react";
import { AuthSession, PublicUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthState } from "@/store/auth-store";

interface AuthContextType extends AuthSession {
    login: AuthState["login"];
    register: AuthState["register"];
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    updateProfile: AuthState["updateProfile"];
    changePassword: AuthState["changePassword"];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = Readonly<{
    children: React.ReactNode;
    initialUser?: PublicUser | null;
}>;

/**
 * Bridges the server-authenticated user and the Zustand auth store.
 * Public routes without an initial user keep the /api/me fallback.
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
    const store = useAuthStore();
    const router = useRouter();
    const hasServerState = initialUser !== undefined;

    useLayoutEffect(() => {
        if (!hasServerState) return;

        useAuthStore.setState({
            user: initialUser,
            status: initialUser ? "authenticated" : "unauthenticated",
        });
    }, [hasServerState, initialUser]);

    useEffect(() => {
        if (hasServerState || useAuthStore.getState().status !== "loading") return;

        useAuthStore
            .getState()
            .refreshUser()
            .catch((error) => console.error("Failed to initialize auth state:", error));
    }, [hasServerState]);

    const logout = async () => {
        await store.logout();
        router.push("/login");
        router.refresh();
    };

    const useInitialState = hasServerState && store.status === "loading";
    const user = useInitialState ? (initialUser ?? null) : store.user;
    const status = useInitialState
        ? initialUser
            ? "authenticated"
            : "unauthenticated"
        : store.status;

    return (
        <AuthContext.Provider
            value={{
                user,
                status,
                login: store.login,
                register: store.register,
                logout,
                refresh: store.refreshUser,
                updateProfile: store.updateProfile,
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
