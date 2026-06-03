import { z } from "zod";

export const createNotificationSchema = z.object({
    user_id: z.string().uuid("Destinataire invalide"),
    type: z.string().trim().min(1, "Type requis").max(80, "Type trop long"),
    title: z.string().trim().min(1, "Titre requis").max(160, "Titre trop long"),
    body: z.string().trim().max(500, "Texte trop long").nullable().optional(),
    resource_type: z.string().trim().min(1).max(80).nullable().optional(),
    resource_id: z.string().uuid("Ressource invalide").nullable().optional(),
    href: z.string().trim().max(500, "Lien trop long").nullable().optional(),
    data: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const notificationIdSchema = z.object({
    notificationId: z.string().uuid("Notification invalide"),
});

export const listNotificationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    unreadOnly: z.coerce.boolean().optional().default(false),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationIdInput = z.infer<typeof notificationIdSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
