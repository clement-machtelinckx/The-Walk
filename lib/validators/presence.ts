import { z } from "zod";

export const presenceStatusSchema = z.enum(["present", "absent", "late"]);

export const updatePresenceSchema = z.object({
    session_id: z.string().uuid("ID de session invalide"),
    status: presenceStatusSchema,
});

export const rollCallSchema = z.object({
    presences: z.array(z.object({
        user_id: z.string().uuid(),
        status: presenceStatusSchema,
    })),
});

export type UpdatePresenceInput = z.infer<typeof updatePresenceSchema>;
export type RollCallInput = z.infer<typeof rollCallSchema>;
