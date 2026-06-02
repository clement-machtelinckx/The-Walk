import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrivateMessageService } from "./private-message-service";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { PrivateMessageRepository } from "@/lib/repositories/private-message-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/private-message-repository");
vi.mock("@/lib/repositories/session-repository");

describe("PrivateMessageService", () => {
    const senderId = "11111111-1111-4111-8111-111111111111";
    const recipientId = "22222222-2222-4222-8222-222222222222";
    const otherTableSessionId = "33333333-3333-4333-8333-333333333333";
    const tableId = "44444444-4444-4444-8444-444444444444";
    const otherTableId = "55555555-5555-4555-8555-555555555555";

    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type PrivateMessage = Awaited<ReturnType<typeof PrivateMessageRepository.create>>;
    type Conversation = Awaited<ReturnType<typeof PrivateMessageRepository.listConversation>>;
    type Session = Awaited<ReturnType<typeof SessionRepository.getById>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("allows a table member to send a private message to another member without session context", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(PrivateMessageRepository.create).mockResolvedValue({
            id: "message-1",
            table_id: tableId,
            session_id: null,
            sender_user_id: senderId,
            recipient_user_id: recipientId,
            content: "Secret",
            created_at: new Date().toISOString(),
        } as PrivateMessage);

        const result = await PrivateMessageService.sendMessage(senderId, {
            table_id: tableId,
            recipient_user_id: recipientId,
            content: "Secret",
        });

        expect(SessionRepository.getById).not.toHaveBeenCalled();
        expect(PrivateMessageRepository.create).toHaveBeenCalledWith(
            {
                table_id: tableId,
                recipient_user_id: recipientId,
                content: "Secret",
            },
            senderId,
        );
        expect(result.content).toBe("Secret");
    });

    it("refuses senders outside the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(
            PrivateMessageService.sendMessage(senderId, {
                table_id: tableId,
                recipient_user_id: recipientId,
                content: "No access",
            }),
        ).rejects.toThrow(ForbiddenError);

        expect(PrivateMessageRepository.create).not.toHaveBeenCalled();
    });

    it("refuses recipients outside the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable)
            .mockResolvedValueOnce({ id: "sender-membership" } as Membership)
            .mockResolvedValueOnce(null);

        await expect(
            PrivateMessageService.sendMessage(senderId, {
                table_id: tableId,
                recipient_user_id: recipientId,
                content: "No recipient",
            }),
        ).rejects.toThrow(ForbiddenError);

        expect(PrivateMessageRepository.create).not.toHaveBeenCalled();
    });

    it("validates optional session context against the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: otherTableSessionId,
            table_id: otherTableId,
        } as Session);

        await expect(
            PrivateMessageService.sendMessage(senderId, {
                table_id: tableId,
                session_id: otherTableSessionId,
                recipient_user_id: recipientId,
                content: "Wrong table",
            }),
        ).rejects.toThrow(ValidationError);

        expect(PrivateMessageRepository.create).not.toHaveBeenCalled();
    });

    it("allows participants to read their conversation only through the selected pair", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(PrivateMessageRepository.listConversation).mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
        } as Conversation);

        await PrivateMessageService.listConversation(senderId, tableId, recipientId, {
            page: 1,
            limit: 50,
        });

        expect(PrivateMessageRepository.listConversation).toHaveBeenCalledWith(
            tableId,
            senderId,
            recipientId,
            { page: 1, limit: 50 },
        );
    });

    it("refuses self conversations", async () => {
        await expect(
            PrivateMessageService.listConversation(senderId, tableId, senderId),
        ).rejects.toThrow(ValidationError);

        expect(PrivateMessageRepository.listConversation).not.toHaveBeenCalled();
    });
});
