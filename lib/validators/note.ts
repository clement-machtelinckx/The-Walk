import { z } from "zod";

export const createNoteSchema = z.object({
    table_id: z.string().uuid().optional(),
    session_id: z.string().uuid().optional(),
    content: z.string().min(1, "Le contenu est requis"),
    is_group: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
    content: z.string().min(1).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
