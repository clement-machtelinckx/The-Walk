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
    type SummaryTable = Awaited<ReturnType<typeof TableRepository.listSummariesByUserId>>[number];
    type Membership = Awaited<ReturnType<typeof MembershipService.requireMembership>>;
    type ActiveSession = Awaited<ReturnType<typeof SessionRepository.getActiveSessionByTable>>;
    type SummarySession = Awaited<
        ReturnType<typeof SessionRepository.listSummarySessionsByTableIds>
    >[number];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("listUserTables", () => {
        it("returns immediately without loading sessions when the user has no table", async () => {
            vi.mocked(TableRepository.listSummariesByUserId).mockResolvedValue([]);

            await expect(TableService.listUserTables(userId)).resolves.toEqual([]);

            expect(TableRepository.listSummariesByUserId).toHaveBeenCalledOnce();
            expect(TableRepository.listSummariesByUserId).toHaveBeenCalledWith(userId);
            expect(SessionRepository.listSummarySessionsByTableIds).not.toHaveBeenCalled();
            expect(MembershipService.getMembership).not.toHaveBeenCalled();
        });

        it("builds all table summaries with one table query and one grouped session query", async () => {
            const tables = [
                {
                    id: "table-1",
                    name: "Table principale",
                    description: "Campagne principale",
                    myRole: "gm",
                },
                {
                    id: "table-2",
                    name: "Table observée",
                    description: null,
                    myRole: "observer",
                },
                {
                    id: "table-3",
                    name: "Table sans session",
                    description: null,
                    myRole: "player",
                },
            ] as SummaryTable[];

            const laterSession = {
                id: "scheduled-later",
                table_id: "table-1",
                title: "Session de septembre",
                status: "scheduled",
                scheduled_at: "2026-09-10T18:00:00.000Z",
            } as SummarySession;
            const activeSession = {
                id: "active-1",
                table_id: "table-1",
                title: "Session en cours",
                status: "active",
                scheduled_at: "2026-08-01T18:00:00.000Z",
            } as SummarySession;
            const earlierSession = {
                id: "scheduled-earlier",
                table_id: "table-1",
                title: "Session d'août",
                status: "scheduled",
                scheduled_at: "2026-08-20T18:00:00.000Z",
            } as SummarySession;
            const undatedSession = {
                id: "scheduled-undated",
                table_id: "table-2",
                title: "Session à planifier",
                status: "scheduled",
                scheduled_at: null,
            } as SummarySession;

            vi.mocked(TableRepository.listSummariesByUserId).mockResolvedValue(tables);
            vi.mocked(SessionRepository.listSummarySessionsByTableIds).mockResolvedValue([
                laterSession,
                activeSession,
                earlierSession,
                undatedSession,
            ]);

            const result = await TableService.listUserTables(userId);

            expect(TableRepository.listSummariesByUserId).toHaveBeenCalledTimes(1);
            expect(SessionRepository.listSummarySessionsByTableIds).toHaveBeenCalledTimes(1);
            expect(SessionRepository.listSummarySessionsByTableIds).toHaveBeenCalledWith([
                "table-1",
                "table-2",
                "table-3",
            ]);
            expect(MembershipService.getMembership).not.toHaveBeenCalled();
            expect(result).toEqual([
                {
                    ...tables[0],
                    nextSession: earlierSession,
                    activeSession,
                },
                {
                    ...tables[1],
                    nextSession: undatedSession,
                    activeSession: null,
                },
                {
                    ...tables[2],
                    nextSession: null,
                    activeSession: null,
                },
            ]);
        });
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
