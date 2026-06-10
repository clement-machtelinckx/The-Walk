import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerClient } from "@/lib/db";
import { SessionRepository } from "./session-repository";
import type { Session } from "@/types/session";

vi.mock("@/lib/db", () => ({
    getServerClient: vi.fn(),
}));

describe("SessionRepository selectors", () => {
    const tableId = "table-123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mockSessionSelector(result: Session | null) {
        const query = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: result, error: null }),
        };
        const from = vi.fn().mockReturnValue(query);

        vi.mocked(getServerClient).mockResolvedValue({ from } as never);

        return { from, query };
    }

    it.each([
        ["before its planned time", "2026-06-10T16:00:00.000Z"],
        ["after its planned time while still scheduled", "2026-06-10T12:00:00.000Z"],
    ])("keeps a scheduled session visible %s", async (_label, scheduledAt) => {
        const session = {
            id: "session-scheduled",
            table_id: tableId,
            title: "Session planifiée",
            status: "scheduled",
            scheduled_at: scheduledAt,
        } as Session;
        const { query } = mockSessionSelector(session);

        await expect(SessionRepository.getNextSession(tableId)).resolves.toBe(session);

        expect(query.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(query.eq).toHaveBeenCalledWith("status", "scheduled");
        expect(query.gte).not.toHaveBeenCalled();
        expect(query.order).toHaveBeenCalledWith("scheduled_at", { ascending: true });
    });

    it("selects an active session independently from scheduled sessions", async () => {
        const session = {
            id: "session-active",
            table_id: tableId,
            title: "Session active",
            status: "active",
        } as Session;
        const { query } = mockSessionSelector(session);

        await expect(SessionRepository.getActiveSessionByTable(tableId)).resolves.toBe(session);

        expect(query.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(query.eq).toHaveBeenCalledWith("status", "active");
        expect(query.gte).not.toHaveBeenCalled();
    });
});
