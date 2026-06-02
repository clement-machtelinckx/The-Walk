import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { requireAuth } from "@/lib/auth/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { PrivateMessageService } from "@/lib/services/private-messages/private-message-service";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/private-messages/private-message-service");

describe("/api/tables/[tableId]/private-messages", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const senderId = "11111111-1111-4111-8111-111111111111";
    const recipientId = "22222222-2222-4222-8222-222222222222";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const mockUser = { id: senderId };
    const params = Promise.resolve({ tableId });

    type AuthUser = Awaited<ReturnType<typeof requireAuth>>;
    type SentMessage = Awaited<ReturnType<typeof PrivateMessageService.sendMessage>>;
    type Conversation = Awaited<ReturnType<typeof PrivateMessageService.listConversation>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns a conversation for an authenticated participant", async () => {
        vi.mocked(requireAuth).mockResolvedValue(mockUser as AuthUser);
        vi.mocked(PrivateMessageService.listConversation).mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
        } as Conversation);

        const request = new Request(
            `http://localhost/api/tables/${tableId}/private-messages?recipient_user_id=${recipientId}`,
        );

        const response = await GET(request, { params });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toEqual([]);
        expect(PrivateMessageService.listConversation).toHaveBeenCalledWith(
            senderId,
            tableId,
            recipientId,
            { page: 1, limit: 50 },
        );
    });

    it("sends a message with optional session context", async () => {
        vi.mocked(requireAuth).mockResolvedValue(mockUser as AuthUser);
        vi.mocked(PrivateMessageService.sendMessage).mockResolvedValue({
            id: "message-1",
            table_id: tableId,
            session_id: sessionId,
            sender_user_id: senderId,
            recipient_user_id: recipientId,
            content: "Secret",
            created_at: new Date().toISOString(),
        } as SentMessage);

        const request = new Request(`http://localhost/api/tables/${tableId}/private-messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_user_id: recipientId,
                session_id: sessionId,
                content: "Secret",
            }),
        });

        const response = await POST(request, { params });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(PrivateMessageService.sendMessage).toHaveBeenCalledWith(senderId, {
            table_id: tableId,
            session_id: sessionId,
            recipient_user_id: recipientId,
            content: "Secret",
        });
    });

    it("returns 400 for invalid payloads", async () => {
        vi.mocked(requireAuth).mockResolvedValue(mockUser as AuthUser);

        const request = new Request(`http://localhost/api/tables/${tableId}/private-messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_user_id: "not-a-uuid",
                content: "",
            }),
        });

        const response = await POST(request, { params });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Données invalides");
        expect(PrivateMessageService.sendMessage).not.toHaveBeenCalled();
    });

    it("returns 401 when the user is not authenticated", async () => {
        vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());

        const request = new Request(`http://localhost/api/tables/${tableId}/private-messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_user_id: recipientId,
                content: "Secret",
            }),
        });

        const response = await POST(request, { params });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Non authentifié");
    });

    it("returns business errors with their status", async () => {
        vi.mocked(requireAuth).mockResolvedValue(mockUser as AuthUser);
        vi.mocked(PrivateMessageService.sendMessage).mockRejectedValue(
            new ForbiddenError("Accès MP refusé"),
        );

        const request = new Request(`http://localhost/api/tables/${tableId}/private-messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient_user_id: recipientId,
                content: "Secret",
            }),
        });

        const response = await POST(request, { params });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe("Accès MP refusé");
    });
});
