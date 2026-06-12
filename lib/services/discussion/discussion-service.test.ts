import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscussionService } from "./discussion-service";
import { MessageRepository } from "@/lib/repositories/message-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError } from "@/lib/errors";

vi.mock("@/lib/repositories/message-repository");
vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/repositories/membership-repository");

describe("DiscussionService", () => {
    const userId = "user-123";
    const sessionId = "session-123";
    const tableId = "table-123";
    type SessionById = Awaited<ReturnType<typeof SessionRepository.getById>>;
    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type Message = Awaited<ReturnType<typeof MessageRepository.createTableMessage>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
        } as SessionById);
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-123",
        } as Membership);
    });

    it("lists the single public discussion for table members", async () => {
        vi.mocked(MessageRepository.listTableMessages).mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
        });

        await DiscussionService.listMessages(userId, tableId, { page: 1, limit: 50 });

        expect(MessageRepository.listTableMessages).toHaveBeenCalledWith(tableId, {
            page: 1,
            limit: 50,
        });
    });

    it("sends messages through the single table message repository", async () => {
        const input = { table_id: tableId, session_id: sessionId, content: "Bonjour la table" };
        vi.mocked(MessageRepository.createTableMessage).mockResolvedValue({
            id: "message-123",
            table_id: tableId,
            session_id: sessionId,
            user_id: userId,
            content: input.content,
            created_at: "2026-06-11T12:00:00.000Z",
        } as Message);

        await DiscussionService.sendMessage(userId, input);

        expect(MessageRepository.createTableMessage).toHaveBeenCalledWith(input, userId);
    });

    it("rejects a session context from another table", async () => {
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: "another-table",
        } as SessionById);

        await expect(
            DiscussionService.sendMessage(userId, {
                table_id: tableId,
                session_id: sessionId,
                content: "Mauvais contexte",
            }),
        ).rejects.toThrow("La session ne correspond pas à cette table.");
        expect(MessageRepository.createTableMessage).not.toHaveBeenCalled();
    });

    it("rejects users outside the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(DiscussionService.listMessages(userId, tableId)).rejects.toThrow(
            ForbiddenError,
        );
        expect(MessageRepository.listTableMessages).not.toHaveBeenCalled();
    });
});
