import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { MessageRepository } from "@/lib/repositories/message-repository";
import { PaginationParams, PaginatedResult } from "@/lib/repositories/_shared/base";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { CreateMessageInput } from "@/lib/validators/message";
import { TableMessage } from "@/types/discussion";

async function requireTableMember(userId: string, tableId: string) {
    const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
    if (!membership) {
        throw new ForbiddenError("Seuls les membres de la table peuvent accéder à la discussion.");
    }
}

async function validateOptionalSessionContext(tableId: string, sessionId?: string | null) {
    if (!sessionId) return;

    const session = await SessionRepository.getById(sessionId);
    if (!session) throw new NotFoundError("Session", sessionId);
    if (session.table_id !== tableId) {
        throw new ValidationError("La session ne correspond pas à cette table.");
    }
}

export const DiscussionService = {
    async listMessages(
        userId: string,
        tableId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<TableMessage>> {
        await requireTableMember(userId, tableId);
        return await MessageRepository.listTableMessages(tableId, params);
    },

    async sendMessage(userId: string, input: CreateMessageInput): Promise<TableMessage> {
        await requireTableMember(userId, input.table_id);
        await validateOptionalSessionContext(input.table_id, input.session_id);
        return await MessageRepository.createTableMessage(input, userId);
    },
};
