import { z } from "zod";

export const presenceStatusSchema = z.enum(["present", "absent", "late", "excused"]);

export const updatePresenceSchema = z.object({
    session_id: z.string().uuid("ID de session invalide"),
    status: presenceStatusSchema,
});

export type UpdatePresenceInput = z.infer<typeof updatePresenceSchema>;
