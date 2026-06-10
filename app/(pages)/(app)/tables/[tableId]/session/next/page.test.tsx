import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { notFound, redirect } from "next/navigation";
import NextSessionPage from "./page";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/memberships/membership-service");
vi.mock("next/navigation", () => ({
    notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
    }),
    redirect: vi.fn(() => {
        throw new Error("NEXT_REDIRECT");
    }),
}));

describe("/tables/[tableId]/session/next page", () => {
    const tableId = "table-123";
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(requireAuth).mockResolvedValue({ id: "user-123" });
    });

    it.each(["gm", "player"] as const)("redirects a %s member to the table hub", async (role) => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role,
        });

        await expect(NextSessionPage({ params: Promise.resolve({ tableId }) })).rejects.toThrow(
            "NEXT_REDIRECT",
        );

        expect(MembershipService.requireMembership).toHaveBeenCalledWith("user-123", tableId);
        expect(redirect).toHaveBeenCalledWith(`/tables/${tableId}`);
    });

    it("returns a clean not-found response before loading table data for a non-member", async () => {
        vi.mocked(MembershipService.requireMembership).mockRejectedValue(
            new ForbiddenError("Not a member"),
        );

        await expect(NextSessionPage({ params: Promise.resolve({ tableId }) })).rejects.toThrow(
            "NEXT_NOT_FOUND",
        );

        expect(notFound).toHaveBeenCalledOnce();
        expect(redirect).not.toHaveBeenCalled();
    });
});
