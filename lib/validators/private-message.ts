import { z } from "zod";

export const privateMessageRecipientSchema = z.object({
    recipient_user_id: z.string().uuid("Destinataire invalide"),
});

export const createPrivateMessageSchema = privateMessageRecipientSchema.extend({
    table_id: z.string().uuid("ID de table invalide"),
    session_id: z.string().uuid("ID de session invalide").nullable().optional(),
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(2000, "Le message est trop long (max 2000 caractères)"),
});

export type CreatePrivateMessageInput = z.infer<typeof createPrivateMessageSchema>;
export type PrivateMessageRecipientInput = z.infer<typeof privateMessageRecipientSchema>;
