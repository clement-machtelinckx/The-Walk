import { MessageRepository } from "@/lib/repositories/message-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { CreateMessageInput } from "@/lib/validators/message";
import { SessionMessage } from "@/types/session";
import { PaginationParams, PaginatedResult } from "@/lib/repositories/_shared/base";

export const PrechatService = {
    /**
     * Liste les messages du pré-chat d'une session.
     * Vérifie que l'utilisateur est membre de la table liée.
     */
    async listMessages(
        userId: string,
        sessionId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<SessionMessage>> {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent accéder au pré-chat.");
        }

        return await MessageRepository.listPreSession(sessionId, params);
    },

    /**
     * Envoie un message dans le pré-chat d'une session.
     * Vérifie que l'utilisateur est membre de la table liée.
     */
    async sendMessage(userId: string, input: CreateMessageInput): Promise<SessionMessage> {
        const session = await SessionRepository.getById(input.session_id);
        if (!session) throw new NotFoundError("Session", input.session_id);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent envoyer des messages.");
        }

        return await MessageRepository.createPreSession(input, userId);
    },
};
