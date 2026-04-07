import { z } from "zod";

export const createMessageSchema = z.object({
    session_id: z.string().uuid("ID de session invalide"),
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(2000, "Le message est trop long (max 2000 caractères)"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
