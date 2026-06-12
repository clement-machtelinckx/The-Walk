import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiscussionStore } from "./discussion-store";
import type { TableDiscussionData, TableMessage } from "@/types/discussion";

describe("useDiscussionStore", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const message = (id: string, createdAt: string): TableMessage => ({
        id,
        table_id: tableId,
        session_id: null,
        user_id: null,
        content: id,
        created_at: createdAt,
    });
    const discussion = (
        data: TableMessage[],
        page: number,
        totalPages: number,
    ): TableDiscussionData => ({
        data,
        total: data.length,
        page,
        limit: 50,
        totalPages,
    });

    beforeEach(() => {
        vi.restoreAllMocks();
        useDiscussionStore.setState({
            discussions: {},
            isLoadingDiscussion: false,
            isLoadingDiscussionHistory: false,
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

    it("loads older pages without duplicates and keeps chronological order", async () => {
        const duplicate = message("message-2", "2026-06-11T12:02:00.000Z");
        useDiscussionStore.setState({
            discussions: {
                [tableId]: discussion(
                    [duplicate, message("message-3", "2026-06-11T12:03:00.000Z")],
                    1,
                    2,
                ),
            },
        });
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi
                    .fn()
                    .mockResolvedValue(
                        discussion(
                            [message("message-1", "2026-06-11T12:01:00.000Z"), duplicate],
                            2,
                            2,
                        ),
                    ),
            }),
        );

        await useDiscussionStore.getState().loadOlderDiscussionMessages(tableId);

        expect(fetch).toHaveBeenCalledWith(`/api/tables/${tableId}/discussion?page=2`);
        expect(useDiscussionStore.getState().discussions[tableId]).toMatchObject({
            page: 2,
            totalPages: 2,
            data: [{ id: "message-1" }, { id: "message-2" }, { id: "message-3" }],
        });
    });

    it("does not request history when the discussion has one page", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        useDiscussionStore.setState({
            discussions: {
                [tableId]: discussion([message("message-1", "2026-06-11T12:01:00.000Z")], 1, 1),
            },
        });

        await useDiscussionStore.getState().loadOlderDiscussionMessages(tableId);

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refreshes recent messages without losing loaded history", async () => {
        useDiscussionStore.setState({
            discussions: {
                [tableId]: discussion(
                    [
                        message("message-1", "2026-06-11T12:01:00.000Z"),
                        message("message-2", "2026-06-11T12:02:00.000Z"),
                    ],
                    2,
                    2,
                ),
            },
        });
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi
                    .fn()
                    .mockResolvedValue(
                        discussion([message("message-3", "2026-06-11T12:03:00.000Z")], 1, 2),
                    ),
            }),
        );

        await useDiscussionStore.getState().fetchDiscussionMessages(tableId);

        expect(useDiscussionStore.getState().discussions[tableId]).toMatchObject({
            page: 2,
            data: [{ id: "message-1" }, { id: "message-2" }, { id: "message-3" }],
        });
    });

    it("sends public messages then refreshes without losing loaded history", async () => {
        useDiscussionStore.setState({
            discussions: {
                [tableId]: discussion([message("message-1", "2026-06-11T12:01:00.000Z")], 2, 2),
            },
        });
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
                    json: vi
                        .fn()
                        .mockResolvedValue(
                            discussion([message("message-2", "2026-06-11T12:02:00.000Z")], 1, 2),
                        ),
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
        expect(useDiscussionStore.getState().discussions[tableId]).toMatchObject({
            page: 2,
            data: [{ id: "message-1" }, { id: "message-2" }],
        });
    });
});
