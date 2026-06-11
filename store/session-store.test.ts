import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "./session-store";

describe("useSessionStore discussion actions", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";

    beforeEach(() => {
        vi.restoreAllMocks();
        useSessionStore.setState({
            discussions: {},
            isLoadingDiscussion: false,
            isSendingDiscussionMessage: false,
            error: null,
        });
    });

    it("stores fetched public discussion messages by session", async () => {
        const discussion = {
            data: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
        };
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(discussion),
            }),
        );

        await useSessionStore.getState().fetchDiscussionMessages(tableId);

        expect(fetch).toHaveBeenCalledWith(`/api/tables/${tableId}/discussion?page=1`);
        expect(useSessionStore.getState().discussions[tableId]).toEqual(discussion);
    });

    it("sends public messages then refreshes the same discussion", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({ success: true }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: [],
                        total: 0,
                        page: 1,
                        limit: 50,
                        totalPages: 0,
                    }),
                }),
        );

        const result = await useSessionStore
            .getState()
            .sendDiscussionMessage(tableId, "Bonjour la table", sessionId);

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenNthCalledWith(1, `/api/tables/${tableId}/discussion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "Bonjour la table", session_id: sessionId }),
        });
        expect(fetch).toHaveBeenNthCalledWith(2, `/api/tables/${tableId}/discussion?page=1`);
    });
});

describe("useSessionStore private message actions", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const recipientId = "22222222-2222-4222-8222-222222222222";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const conversationKey = `${tableId}:${recipientId}`;

    beforeEach(() => {
        vi.restoreAllMocks();
        useSessionStore.setState({
            privateMessages: {},
            isLoadingPrivateMessages: false,
            isSendingPrivateMessage: false,
            error: null,
        });
    });

    it("stores fetched private conversations by table and recipient", async () => {
        const conversation = {
            data: [
                {
                    id: "message-1",
                    table_id: tableId,
                    session_id: null,
                    sender_user_id: "sender",
                    recipient_user_id: recipientId,
                    content: "Secret",
                    created_at: "2026-01-01T10:00:00.000Z",
                },
            ],
            total: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
        };
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(conversation),
            }),
        );

        await useSessionStore.getState().fetchPrivateMessages(tableId, recipientId);

        expect(fetch).toHaveBeenCalledWith(
            `/api/tables/${tableId}/private-messages?recipient_user_id=${recipientId}&page=1`,
        );
        expect(useSessionStore.getState().privateMessages[conversationKey]).toEqual(conversation);
        expect(useSessionStore.getState().isLoadingPrivateMessages).toBe(false);
    });

    it("surfaces fetch errors without mutating conversations", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ error: "Accès refusé" }),
            }),
        );

        await useSessionStore.getState().fetchPrivateMessages(tableId, recipientId);

        expect(useSessionStore.getState().privateMessages[conversationKey]).toBeUndefined();
        expect(useSessionStore.getState().error).toBe("Accès refusé");
        expect(useSessionStore.getState().isLoadingPrivateMessages).toBe(false);
    });

    it("sends private messages with optional session context then refreshes the conversation", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({ success: true }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: [],
                        total: 0,
                        page: 1,
                        limit: 50,
                        totalPages: 0,
                    }),
                }),
        );

        const result = await useSessionStore
            .getState()
            .sendPrivateMessage(tableId, recipientId, "Secret", sessionId);

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenNthCalledWith(1, `/api/tables/${tableId}/private-messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_user_id: recipientId,
                content: "Secret",
                session_id: sessionId,
            }),
        });
        expect(fetch).toHaveBeenNthCalledWith(
            2,
            `/api/tables/${tableId}/private-messages?recipient_user_id=${recipientId}&page=1`,
        );
        expect(useSessionStore.getState().isSendingPrivateMessage).toBe(false);
    });
});
