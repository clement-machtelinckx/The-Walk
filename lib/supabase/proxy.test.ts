import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { updateSession } from "./proxy";

function mockClaims(userId: string | null) {
    const getClaims = vi.fn().mockResolvedValue({
        data: userId ? { claims: { sub: userId } } : { claims: null },
        error: null,
    });
    const getUser = vi.fn();

    vi.mocked(createServerClient).mockReturnValue({
        auth: {
            getClaims,
            getUser,
        },
    } as never);

    return { getClaims, getUser };
}

describe("Supabase proxy session handling", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects an unauthenticated visitor away from a protected route", async () => {
        const { getClaims, getUser } = mockClaims(null);

        const response = await updateSession(new NextRequest("https://the-walk.test/tables"));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(
            "https://the-walk.test/login?next=%2Ftables",
        );
        expect(getClaims).toHaveBeenCalledOnce();
        expect(getUser).not.toHaveBeenCalled();
    });

    it("redirects an authenticated user away from login using a safe next path", async () => {
        const { getClaims, getUser } = mockClaims("user-123");

        const response = await updateSession(
            new NextRequest("https://the-walk.test/login?next=%2Ftables%2Ftable-123"),
        );

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(
            "https://the-walk.test/tables/table-123",
        );
        expect(getClaims).toHaveBeenCalledOnce();
        expect(getUser).not.toHaveBeenCalled();
    });

    it("keeps public routes accessible without an authenticated user", async () => {
        const { getClaims } = mockClaims(null);

        const response = await updateSession(new NextRequest("https://the-walk.test/faq"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
        expect(getClaims).toHaveBeenCalledOnce();
    });
});
