import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";
import { useAuthStore } from "@/store/auth-store";
import type { PublicUser } from "@/types/auth";

const initialStoreState = useAuthStore.getState();

function AuthProbe() {
    const { user, status } = useAuth();

    return <div data-testid="auth-state">{`${status}:${user?.email ?? "none"}`}</div>;
}

describe("AuthProvider", () => {
    beforeEach(() => {
        useAuthStore.setState(
            {
                ...initialStoreState,
                user: null,
                status: "loading",
            },
            true,
        );
    });

    it("hydrates protected routes from the server user without refreshing /api/me", async () => {
        const refreshUser = vi.fn().mockResolvedValue(undefined);
        useAuthStore.setState({ refreshUser });

        const initialUser: PublicUser = {
            id: "user-123",
            email: "user@example.com",
            profile: null,
        };

        render(
            <AuthProvider initialUser={initialUser}>
                <AuthProbe />
            </AuthProvider>,
        );

        expect(screen.getByTestId("auth-state")).toHaveTextContent(
            "authenticated:user@example.com",
        );
        await waitFor(() => {
            expect(useAuthStore.getState()).toMatchObject({
                user: initialUser,
                status: "authenticated",
            });
        });
        expect(refreshUser).not.toHaveBeenCalled();
    });

    it("does not restore a stale server user after an explicit logout", async () => {
        const refreshUser = vi.fn().mockResolvedValue(undefined);
        useAuthStore.setState({
            user: null,
            status: "unauthenticated",
            refreshUser,
        });

        const staleInitialUser: PublicUser = {
            id: "user-123",
            email: "stale@example.com",
            profile: null,
        };

        render(
            <AuthProvider initialUser={staleInitialUser}>
                <AuthProbe />
            </AuthProvider>,
        );

        expect(screen.getByTestId("auth-state")).toHaveTextContent("unauthenticated:none");
        await waitFor(() => {
            expect(useAuthStore.getState()).toMatchObject({
                user: null,
                status: "unauthenticated",
            });
        });
        expect(refreshUser).not.toHaveBeenCalled();
    });

    it("keeps the /api/me fallback when no server user is provided", async () => {
        const refreshUser = vi.fn().mockResolvedValue(undefined);
        useAuthStore.setState({ refreshUser });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => expect(refreshUser).toHaveBeenCalledOnce());
    });
});
