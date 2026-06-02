import { describe, it, expect, vi, beforeEach } from "vitest";
import { getServerClient } from "@/lib/db";
import { PrivateMessageRepository } from "@/lib/repositories/private-message-repository";

vi.mock("@/lib/db", () => ({
    getServerClient: vi.fn(),
}));

describe("PrivateMessageRepository", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const senderId = "11111111-1111-4111-8111-111111111111";
    const recipientId = "22222222-2222-4222-8222-222222222222";
    const sessionId = "33333333-3333-4333-8333-333333333333";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("persists messages in the private table with table anchor and optional session context", async () => {
        const single = vi.fn().mockResolvedValue({
            data: {
                id: "message-1",
                table_id: tableId,
                session_id: sessionId,
                sender_user_id: senderId,
                recipient_user_id: recipientId,
                content: "Secret",
                created_at: new Date().toISOString(),
            },
            error: null,
        });
        const select = vi.fn(() => ({ single }));
        const insert = vi.fn(() => ({ select }));
        const from = vi.fn(() => ({ insert }));
        vi.mocked(getServerClient).mockResolvedValue({ from } as never);

        const result = await PrivateMessageRepository.create(
            {
                table_id: tableId,
                session_id: sessionId,
                recipient_user_id: recipientId,
                content: "Secret",
            },
            senderId,
        );

        expect(from).toHaveBeenCalledWith("table_private_messages");
        expect(insert).toHaveBeenCalledWith({
            table_id: tableId,
            session_id: sessionId,
            sender_user_id: senderId,
            recipient_user_id: recipientId,
            content: "Secret",
        });
        expect(result.content).toBe("Secret");
    });

    it("filters conversations by table and by the exact sender/recipient pair", async () => {
        const pairFilter = `and(sender_user_id.eq.${senderId},recipient_user_id.eq.${recipientId}),and(sender_user_id.eq.${recipientId},recipient_user_id.eq.${senderId})`;
        const countQuery = {
            count: 2,
            error: null,
            select: vi.fn(),
            eq: vi.fn(),
            or: vi.fn(),
        };
        countQuery.select.mockReturnValue(countQuery);
        countQuery.eq.mockReturnValue(countQuery);
        countQuery.or.mockReturnValue(countQuery);

        const dataQuery = {
            data: [
                {
                    id: "message-new",
                    table_id: tableId,
                    sender_user_id: senderId,
                    recipient_user_id: recipientId,
                    content: "New",
                },
                {
                    id: "message-old",
                    table_id: tableId,
                    sender_user_id: recipientId,
                    recipient_user_id: senderId,
                    content: "Old",
                },
            ],
            error: null,
            select: vi.fn(),
            eq: vi.fn(),
            or: vi.fn(),
            order: vi.fn(),
            range: vi.fn(),
        };
        dataQuery.select.mockReturnValue(dataQuery);
        dataQuery.eq.mockReturnValue(dataQuery);
        dataQuery.or.mockReturnValue(dataQuery);
        dataQuery.order.mockReturnValue(dataQuery);
        dataQuery.range.mockReturnValue(dataQuery);

        const from = vi.fn().mockReturnValueOnce(countQuery).mockReturnValueOnce(dataQuery);
        vi.mocked(getServerClient).mockResolvedValue({ from } as never);

        const result = await PrivateMessageRepository.listConversation(
            tableId,
            senderId,
            recipientId,
            { page: 1, limit: 50 },
        );

        expect(from).toHaveBeenCalledWith("table_private_messages");
        expect(countQuery.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(dataQuery.eq).toHaveBeenCalledWith("table_id", tableId);
        expect(countQuery.or).toHaveBeenCalledWith(pairFilter);
        expect(dataQuery.or).toHaveBeenCalledWith(pairFilter);
        expect(dataQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(dataQuery.range).toHaveBeenCalledWith(0, 49);
        expect(result.data.map((message) => message.id)).toEqual(["message-old", "message-new"]);
    });
});
