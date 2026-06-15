import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";
import { requireAuth } from "@/lib/auth/server";
import { DiscussionService } from "@/lib/services/discussion/discussion-service";
import { UnauthorizedError } from "@/lib/errors";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/discussion/discussion-service");

describe("/api/tables/[tableId]/discussion", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const userId = "11111111-1111-4111-8111-111111111111";
    const params = Promise.resolve({ tableId });
    type AuthUser = Awaited<ReturnType<typeof requireAuth>>;
    type Discussion = Awaited<ReturnType<typeof DiscussionService.listMessages>>;
    type Message = Awaited<ReturnType<typeof DiscussionService.sendMessage>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the permanent table discussion", async () => {
        vi.mocked(requireAuth).mockResolvedValue({ id: userId } as AuthUser);
        vi.mocked(DiscussionService.listMessages).mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
        } as Discussion);

        const response = await GET(
            new Request(`http://localhost/api/tables/${tableId}/discussion`),
            { params },
        );

        expect(response.status).toBe(200);
        expect(DiscussionService.listMessages).toHaveBeenCalledWith(userId, tableId, {
            page: 1,
            limit: 50,
        });
    });

    it("sends a table message with optional session context", async () => {
        vi.mocked(requireAuth).mockResolvedValue({ id: userId } as AuthUser);
        vi.mocked(DiscussionService.sendMessage).mockResolvedValue({
            id: "message-123",
            table_id: tableId,
            session_id: sessionId,
            user_id: userId,
            content: "Bonjour",
            created_at: "2026-06-11T12:00:00.000Z",
        } as Message);

        const response = await POST(
            new Request(`http://localhost/api/tables/${tableId}/discussion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: "Bonjour", session_id: sessionId }),
            }),
            { params },
        );

        expect(response.status).toBe(200);
        expect(DiscussionService.sendMessage).toHaveBeenCalledWith(userId, {
            table_id: tableId,
            session_id: sessionId,
            content: "Bonjour",
        });
    });

    it("returns auth errors", async () => {
        vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());

        const response = await GET(
            new Request(`http://localhost/api/tables/${tableId}/discussion`),
            { params },
        );

        expect(response.status).toBe(401);
    });
});
