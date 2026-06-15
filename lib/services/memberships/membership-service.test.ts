import { beforeEach, describe, expect, it, vi } from "vitest";
import { MembershipService } from "./membership-service";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/membership-repository");

describe("MembershipService", () => {
    const tableId = "table-123";
    const actorId = "actor-123";
    const targetId = "target-123";

    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type TableMembers = Awaited<ReturnType<typeof MembershipRepository.listByTable>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("maps table memberships to DTOs with profile data", async () => {
        vi.mocked(MembershipRepository.listByTable).mockResolvedValue([
            {
                id: "membership-123",
                table_id: tableId,
                user_id: targetId,
                role: "player",
                joined_at: "2026-01-01T10:00:00.000Z",
                profiles: {
                    id: targetId,
                    email: "player@example.com",
                    display_name: "Player",
                    avatar_url: null,
                    avatar_key: null,
                },
            },
        ] as TableMembers);

        const members = await MembershipService.listMembers(tableId);

        expect(members).toEqual([
            {
                userId: targetId,
                role: "player",
                joinedAt: "2026-01-01T10:00:00.000Z",
                profile: {
                    id: targetId,
                    email: "player@example.com",
                    display_name: "Player",
                    avatar_url: null,
                    avatar_key: null,
                },
            },
        ]);
    });

    it("prevents the last GM from leaving a table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            role: "gm",
        } as Membership);
        vi.mocked(MembershipRepository.countGmsByTable).mockResolvedValue(1);

        await expect(MembershipService.leaveTable(actorId, tableId)).rejects.toThrow(
            ValidationError,
        );

        expect(MembershipRepository.remove).not.toHaveBeenCalled();
    });

    it("allows a non-last GM to leave a table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            role: "gm",
        } as Membership);
        vi.mocked(MembershipRepository.countGmsByTable).mockResolvedValue(2);

        await MembershipService.leaveTable(actorId, tableId);

        expect(MembershipRepository.remove).toHaveBeenCalledWith(tableId, actorId);
    });

    it("prevents non-GM members from removing another member", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            role: "player",
        } as Membership);

        await expect(MembershipService.removeMember(actorId, tableId, targetId)).rejects.toThrow(
            ForbiddenError,
        );

        expect(MembershipRepository.remove).not.toHaveBeenCalled();
    });

    it("prevents removing another GM", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable)
            .mockResolvedValueOnce({ role: "gm" } as Membership)
            .mockResolvedValueOnce({ role: "gm" } as Membership);

        await expect(MembershipService.removeMember(actorId, tableId, targetId)).rejects.toThrow(
            ForbiddenError,
        );

        expect(MembershipRepository.remove).not.toHaveBeenCalled();
    });

    it("prevents self role changes", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable)
            .mockResolvedValueOnce({ role: "gm" } as Membership)
            .mockResolvedValueOnce({ role: "gm" } as Membership);

        await expect(
            MembershipService.updateMemberRole(actorId, tableId, actorId, "player"),
        ).rejects.toThrow(ValidationError);

        expect(MembershipRepository.updateRole).not.toHaveBeenCalled();
    });

    it("prevents demoting the last GM", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable)
            .mockResolvedValueOnce({ role: "gm" } as Membership)
            .mockResolvedValueOnce({ role: "gm" } as Membership);
        vi.mocked(MembershipRepository.countGmsByTable).mockResolvedValue(1);

        await expect(
            MembershipService.updateMemberRole(actorId, tableId, targetId, "player"),
        ).rejects.toThrow(ValidationError);

        expect(MembershipRepository.updateRole).not.toHaveBeenCalled();
    });

    it("allows a GM to update another member role", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable)
            .mockResolvedValueOnce({ role: "gm" } as Membership)
            .mockResolvedValueOnce({ role: "player" } as Membership);

        await MembershipService.updateMemberRole(actorId, tableId, targetId, "observer");

        expect(MembershipRepository.updateRole).toHaveBeenCalledWith(tableId, targetId, "observer");
    });
});
