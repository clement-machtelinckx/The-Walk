import { z } from "zod";

export const createMessageSchema = z.object({
    session_id: z.string().uuid("ID de session invalide"),
    content: z.string().min(1, "Le message ne peut pas être vide"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
