import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { TableRepository } from "@/lib/repositories/table-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NotificationService } from "@/lib/services/notifications/notification-service";
import type { Invitation } from "@/types/table";
import type { Session, TablePrivateMessage } from "@/types/session";

async function createNotificationSafe(input: Parameters<typeof NotificationService.create>[0]) {
    try {
        await NotificationService.create(input);
    } catch (error) {
        console.error("[NOTIFICATION_EVENT]", error);
    }
}

export const NotificationEventService = {
    async notifyTargetedInvitationReceived(invitation: Invitation): Promise<void> {
        const [recipientProfile, table] = await Promise.all([
            ProfileRepository.getByEmailForSystem(invitation.email),
            TableRepository.getById(invitation.table_id),
        ]);

        if (!recipientProfile) {
            return;
        }

        await createNotificationSafe({
            user_id: recipientProfile.id,
            type: "table_invitation_received",
            title: "Invitation reçue",
            body: `Vous êtes invité à rejoindre la table ${table.name}.`,
            resource_type: "invitation",
            resource_id: invitation.id,
            href: `/invitation/${invitation.token}`,
            data: {
                tableId: invitation.table_id,
                role: invitation.role,
            },
        });
    },

    async notifyUpcomingSessionScheduled(actorUserId: string, session: Session): Promise<void> {
        if (session.status !== "scheduled") {
            return;
        }

        const [table, members] = await Promise.all([
            TableRepository.getById(session.table_id),
            MembershipService.listMembers(session.table_id),
        ]);

        await Promise.all(
            members
                .filter((member) => member.userId !== actorUserId)
                .map((member) =>
                    createNotificationSafe({
                        user_id: member.userId,
                        type: "session_scheduled",
                        title: "Prochaine session planifiée",
                        body: `${table.name} : ${session.title}`,
                        resource_type: "session",
                        resource_id: session.id,
                        href: `/tables/${session.table_id}`,
                        data: {
                            tableId: session.table_id,
                            scheduledAt: session.scheduled_at,
                        },
                    }),
                ),
        );
    },

    async notifyPrivateMessageReceived(
        senderUserId: string,
        message: TablePrivateMessage,
    ): Promise<void> {
        const senderProfile = await ProfileRepository.getById(senderUserId);
        const senderName = senderProfile.display_name || senderProfile.email;

        await createNotificationSafe({
            user_id: message.recipient_user_id,
            type: "private_message_received",
            title: "Nouveau message privé",
            body: `${senderName} vous a envoyé un message.`,
            resource_type: "private_message",
            resource_id: message.id,
            href: `/tables/${message.table_id}`,
            data: {
                tableId: message.table_id,
                senderUserId,
                sessionId: message.session_id,
            },
        });
    },

    async notifySessionLiveStarted(actorUserId: string, session: Session): Promise<void> {
        const [table, members] = await Promise.all([
            TableRepository.getById(session.table_id),
            MembershipService.listMembers(session.table_id),
        ]);

        await Promise.all(
            members
                .filter((member) => member.userId !== actorUserId)
                .map((member) =>
                    createNotificationSafe({
                        user_id: member.userId,
                        type: "session_live_started",
                        title: "Session live démarrée",
                        body: `${table.name} : ${session.title}`,
                        resource_type: "session",
                        resource_id: session.id,
                        href: `/tables/${session.table_id}/session/live/${session.id}`,
                        data: {
                            tableId: session.table_id,
                            startedAt: session.started_at,
                        },
                    }),
                ),
        );
    },

    async notifyInitiativeRequested(session: Session, userIds: string[]): Promise<void> {
        await Promise.all(
            userIds.map((userId) =>
                createNotificationSafe({
                    user_id: userId,
                    type: "initiative_requested",
                    title: "Initiative demandée",
                    body: "Le MJ demande votre jet d'initiative pour la session.",
                    resource_type: "session",
                    resource_id: session.id,
                    href: `/tables/${session.table_id}/session/live/${session.id}`,
                    data: {
                        tableId: session.table_id,
                        sessionId: session.id,
                    },
                }),
            ),
        );
    },
};
