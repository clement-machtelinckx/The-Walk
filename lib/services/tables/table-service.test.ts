import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableService } from "./table-service";
import { TableRepository } from "@/lib/repositories/table-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/table-repository");
vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/services/memberships/membership-service");

describe("TableService", () => {
    const userId = "user-123";
    const tableId = "table-123";

    type TableById = Awaited<ReturnType<typeof TableRepository.getById>>;
    type Membership = Awaited<ReturnType<typeof MembershipService.requireMembership>>;
    type ActiveSession = Awaited<ReturnType<typeof SessionRepository.getActiveSessionByTable>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deletes a table for its owner", async () => {
        vi.mocked(TableRepository.getById).mockResolvedValue({
            id: tableId,
            owner_id: userId,
        } as TableById);
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Membership);
        vi.mocked(SessionRepository.getActiveSessionByTable).mockResolvedValue(null);

        await TableService.deleteTable(userId, tableId);

        expect(TableRepository.delete).toHaveBeenCalledWith(tableId);
    });

    it("refuses deletion for a non-owner GM", async () => {
        vi.mocked(TableRepository.getById).mockResolvedValue({
            id: tableId,
            owner_id: "another-user",
        } as TableById);

        await expect(TableService.deleteTable(userId, tableId)).rejects.toThrow(ForbiddenError);

        expect(MembershipService.requireMembership).not.toHaveBeenCalled();
        expect(SessionRepository.getActiveSessionByTable).not.toHaveBeenCalled();
        expect(TableRepository.delete).not.toHaveBeenCalled();
    });

    it("refuses deletion while a session is active", async () => {
        vi.mocked(TableRepository.getById).mockResolvedValue({
            id: tableId,
            owner_id: userId,
        } as TableById);
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "gm",
        } as Membership);
        vi.mocked(SessionRepository.getActiveSessionByTable).mockResolvedValue({
            id: "session-123",
        } as ActiveSession);

        await expect(TableService.deleteTable(userId, tableId)).rejects.toThrow(ValidationError);

        expect(TableRepository.delete).not.toHaveBeenCalled();
    });
});
