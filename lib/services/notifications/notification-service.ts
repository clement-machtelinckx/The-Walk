import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { NotificationRepository } from "@/lib/repositories/notification-repository";
import type { PaginatedResult } from "@/lib/repositories/_shared/base";
import type {
    CreateNotificationInput,
    ListNotificationsQuery,
} from "@/lib/validators/notification";
import type { Notification, NotificationUnreadCount } from "@/types/notification";

async function requireOwnNotification(userId: string, notificationId: string) {
    const notification = await NotificationRepository.getById(notificationId);

    if (!notification) {
        throw new NotFoundError("Notification", notificationId);
    }

    if (notification.user_id !== userId) {
        throw new ForbiddenError("Vous ne pouvez accéder qu'à vos notifications.");
    }

    return notification;
}

export const NotificationService = {
    async create(input: CreateNotificationInput): Promise<Notification> {
        return await NotificationRepository.create(input);
    },

    async listForUser(
        userId: string,
        params: ListNotificationsQuery,
    ): Promise<PaginatedResult<Notification>> {
        return await NotificationRepository.listByUser(userId, params);
    },

    async getUnreadCount(userId: string): Promise<NotificationUnreadCount> {
        const unreadCount = await NotificationRepository.countUnread(userId);
        return { unreadCount };
    },

    async markAsRead(userId: string, notificationId: string): Promise<Notification> {
        const notification = await requireOwnNotification(userId, notificationId);

        if (notification.is_read) {
            return notification;
        }

        return await NotificationRepository.markAsRead(notificationId, userId);
    },

    async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
        const updatedCount = await NotificationRepository.markAllAsRead(userId);
        return { updatedCount };
    },
};
