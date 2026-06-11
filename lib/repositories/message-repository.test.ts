import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerClient } from "@/lib/db";
import { MessageRepository } from "@/lib/repositories/message-repository";

vi.mock("@/lib/db", () => ({
    getServerClient: vi.fn(),
}));

describe("MessageRepository", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const userId = "11111111-1111-4111-8111-111111111111";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("persists public messages with table anchor and optional session context", async () => {
        const single = vi.fn().mockResolvedValue({
            data: {
                id: "message-1",
                table_id: tableId,
                session_id: sessionId,
                user_id: userId,
                content: "Bonjour",
                created_at: "2026-06-11T12:00:00.000Z",
            },
            error: null,
        });
        const select = vi.fn(() => ({ single }));
        const insert = vi.fn(() => ({ select }));
        const from = vi.fn(() => ({ insert }));
        vi.mocked(getServerClient).mockResolvedValue({ from } as never);

        await MessageRepository.createTableMessage(
            {
                table_id: tableId,
                session_id: sessionId,
                content: "Bonjour",
            },
            userId,
        );

        expect(from).toHaveBeenCalledWith("table_messages");
        expect(insert).toHaveBeenCalledWith({
            table_id: tableId,
            session_id: sessionId,
            user_id: userId,
            content: "Bonjour",
        });
    });

    it("lists one permanent discussion by table", async () => {
        const countQuery = {
            count: 1,
            error: null,
            select: vi.fn(),
            eq: vi.fn(),
        };
        countQuery.select.mockReturnValue(countQuery);
        countQuery.eq.mockReturnValue(countQuery);

        const dataQuery = {
            data: [],
            error: null,
            select: vi.fn(),
            eq: vi.fn(),
            order: vi.fn(),
            range: vi.fn(),
        };
        dataQuery.select.mockReturnValue(dataQuery);
        dataQuery.eq.mockReturnValue(dataQuery);
        dataQuery.order.mockReturnValue(dataQuery);
        dataQuery.range.mockReturnValue(dataQuery);

        const from = vi.fn().mockReturnValueOnce(countQuery).mockReturnValueOnce(dataQuery);
        vi.mocked(getServerClient).mockResolvedValue({ from } as never);

        await MessageRepository.listTableMessages(tableId, { page: 1, limit: 50 });

        expect(from).toHaveBeenCalledWith("table_messages");
        expect(countQuery.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(dataQuery.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(dataQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(dataQuery.range).toHaveBeenCalledWith(0, 49);
    });
});
