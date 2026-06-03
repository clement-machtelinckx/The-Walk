import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { PrivateMessageRepository } from "@/lib/repositories/private-message-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { NotificationEventService } from "@/lib/services/notifications/notification-event-service";
import { PaginationParams, PaginatedResult } from "@/lib/repositories/_shared/base";
import { CreatePrivateMessageInput } from "@/lib/validators/private-message";
import { TablePrivateMessage } from "@/types/session";

async function requireTableMember(userId: string, tableId: string) {
    const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
    if (!membership) {
        throw new ForbiddenError("Seuls les membres de la table peuvent accéder aux MP.");
    }

    return membership;
}

async function validateOptionalSessionContext(tableId: string, sessionId?: string | null) {
    if (!sessionId) return;

    const session = await SessionRepository.getById(sessionId);
    if (!session) throw new NotFoundError("Session", sessionId);

    if (session.table_id !== tableId) {
        throw new ValidationError("La session ne correspond pas à cette table.");
    }
}

function notifyPrivateMessageLater(senderUserId: string, message: TablePrivateMessage) {
    void NotificationEventService.notifyPrivateMessageReceived(senderUserId, message).catch(
        (error) => {
            console.error("[PRIVATE_MESSAGE_NOTIFICATION]", error);
        },
    );
}

export const PrivateMessageService = {
    async listConversation(
        userId: string,
        tableId: string,
        recipientUserId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<TablePrivateMessage>> {
        if (userId === recipientUserId) {
            throw new ValidationError("Sélectionnez un autre membre pour ouvrir un MP.");
        }

        await requireTableMember(userId, tableId);
        const recipientMembership = await MembershipRepository.getByUserAndTable(
            recipientUserId,
            tableId,
        );

        if (!recipientMembership) {
            throw new ForbiddenError("Le destinataire n'est pas membre de cette table.");
        }

        return await PrivateMessageRepository.listConversation(
            tableId,
            userId,
            recipientUserId,
            params,
        );
    },

    async sendMessage(
        userId: string,
        input: CreatePrivateMessageInput,
    ): Promise<TablePrivateMessage> {
        if (userId === input.recipient_user_id) {
            throw new ValidationError("Vous ne pouvez pas vous envoyer un MP à vous-même.");
        }

        await requireTableMember(userId, input.table_id);
        const recipientMembership = await MembershipRepository.getByUserAndTable(
            input.recipient_user_id,
            input.table_id,
        );

        if (!recipientMembership) {
            throw new ForbiddenError("Le destinataire n'est pas membre de cette table.");
        }

        await validateOptionalSessionContext(input.table_id, input.session_id);

        const message = await PrivateMessageRepository.create(input, userId);
        notifyPrivateMessageLater(userId, message);

        return message;
    },
};
