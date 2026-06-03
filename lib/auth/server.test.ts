import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getCurrentUser,
    hasTableRole,
    redirectIfAuthenticated,
    requireAuth,
    requireTableRole,
} from "./server";
import { getServerClient } from "@/lib/db";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { redirect } from "next/navigation";

vi.mock("@/lib/db");
vi.mock("@/lib/repositories/profile-repository");
vi.mock("@/lib/repositories/membership-repository");

describe("server auth helpers", () => {
    const userId = "user-123";
    const tableId = "table-123";
    const supabaseUser = { id: userId, email: "user@example.com" };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mockSupabaseUser(user: unknown = supabaseUser, error: unknown = null) {
        vi.mocked(getServerClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user },
                    error,
                }),
            },
        } as never);
    }

    it("returns the authenticated user with profile", async () => {
        mockSupabaseUser();
        vi.mocked(ProfileRepository.getById).mockResolvedValue({
            id: userId,
            email: "user@example.com",
            display_name: "User",
            avatar_url: null,
            avatar_key: null,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
        });

        const user = await getCurrentUser();

        expect(user).toEqual(
            expect.objectContaining({
                id: userId,
                email: "user@example.com",
                profile: expect.objectContaining({ display_name: "User" }),
            }),
        );
    });

    it("returns null when Supabase has no authenticated user", async () => {
        mockSupabaseUser(null);

        await expect(getCurrentUser()).resolves.toBeNull();
    });

    it("keeps the auth user when the business profile is missing", async () => {
        mockSupabaseUser();
        vi.mocked(ProfileRepository.getById).mockRejectedValue(new Error("missing profile"));
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const user = await getCurrentUser();

        expect(user).toEqual(
            expect.objectContaining({
                id: userId,
                profile: null,
            }),
        );
        consoleSpy.mockRestore();
    });

    it("throws when auth is required but no user is authenticated", async () => {
        mockSupabaseUser(null);

        await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
    });

    it("checks table roles against membership", async () => {
        mockSupabaseUser();
        vi.mocked(ProfileRepository.getById).mockResolvedValue({
            id: userId,
            email: "user@example.com",
            display_name: null,
            avatar_url: null,
            avatar_key: null,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
        });
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
            table_id: tableId,
            user_id: userId,
            role: "gm",
            joined_at: "2026-01-01T00:00:00.000Z",
        });

        await expect(hasTableRole(tableId, "gm")).resolves.toBe(true);
        await expect(hasTableRole(tableId, "player")).resolves.toBe(false);
    });

    it("throws when the required table role is missing", async () => {
        mockSupabaseUser();
        vi.mocked(ProfileRepository.getById).mockResolvedValue({
            id: userId,
            email: "user@example.com",
            display_name: null,
            avatar_url: null,
            avatar_key: null,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
        });
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(requireTableRole(tableId, "gm")).rejects.toThrow(ForbiddenError);
    });

    it("redirects authenticated users away from auth pages", async () => {
        mockSupabaseUser();
        vi.mocked(ProfileRepository.getById).mockResolvedValue({
            id: userId,
            email: "user@example.com",
            display_name: null,
            avatar_url: null,
            avatar_key: null,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
        });

        await redirectIfAuthenticated("/tables");

        expect(redirect).toHaveBeenCalledWith("/tables");
    });
});
