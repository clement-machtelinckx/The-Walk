import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiscussionStore } from "./discussion-store";

describe("useDiscussionStore", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";

    beforeEach(() => {
        vi.restoreAllMocks();
        useDiscussionStore.setState({
            discussions: {},
            isLoadingDiscussion: false,
            isSendingDiscussionMessage: false,
            error: null,
        });
    });

    it("stores fetched public discussion messages by table", async () => {
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

        await useDiscussionStore.getState().fetchDiscussionMessages(tableId);

        expect(fetch).toHaveBeenCalledWith(`/api/tables/${tableId}/discussion?page=1`);
        expect(useDiscussionStore.getState().discussions[tableId]).toEqual(discussion);
    });

    it("sends public messages then refreshes the same table discussion", async () => {
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

        const result = await useDiscussionStore
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
