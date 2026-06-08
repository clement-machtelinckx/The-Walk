import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { TableRepository } from "@/lib/repositories/table-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { notFound } from "next/navigation";
import NextSessionPage from "./page";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/memberships/membership-service");
vi.mock("@/lib/repositories/table-repository");
vi.mock("@/lib/repositories/session-repository");
vi.mock("next/navigation", () => ({
    notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
    }),
}));

describe("/tables/[tableId]/session/next page", () => {
    const tableId = "table-123";
    type AuthUser = Awaited<ReturnType<typeof requireAuth>>;
    type Membership = Awaited<ReturnType<typeof MembershipService.requireMembership>>;
    type Table = Awaited<ReturnType<typeof TableRepository.getById>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(requireAuth).mockResolvedValue({ id: "user-123" } as AuthUser);
        vi.mocked(TableRepository.getById).mockResolvedValue({
            id: tableId,
            name: "Test table",
        } as Table);
        vi.mocked(SessionRepository.getNextSession).mockResolvedValue(null);
        vi.mocked(SessionRepository.getActiveSessionByTable).mockResolvedValue(null);
    });

    it.each(["gm", "player"] as const)(
        "allows a %s member when no next session exists",
        async (role) => {
            vi.mocked(MembershipService.requireMembership).mockResolvedValue({
                role,
            } as Membership);

            await expect(
                NextSessionPage({ params: Promise.resolve({ tableId }) }),
            ).resolves.toBeTruthy();

            expect(MembershipService.requireMembership).toHaveBeenCalledWith("user-123", tableId);
            expect(TableRepository.getById).toHaveBeenCalledWith(tableId);
            expect(SessionRepository.getNextSession).toHaveBeenCalledWith(tableId);
            expect(SessionRepository.getActiveSessionByTable).toHaveBeenCalledWith(tableId);
        },
    );

    it("returns a clean not-found response before loading table data for a non-member", async () => {
        vi.mocked(MembershipService.requireMembership).mockRejectedValue(
            new ForbiddenError("Not a member"),
        );

        await expect(NextSessionPage({ params: Promise.resolve({ tableId }) })).rejects.toThrow(
            "NEXT_NOT_FOUND",
        );

        expect(notFound).toHaveBeenCalledOnce();
        expect(TableRepository.getById).not.toHaveBeenCalled();
        expect(SessionRepository.getNextSession).not.toHaveBeenCalled();
    });
});
