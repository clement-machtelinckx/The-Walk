import { z } from "zod";

export const sessionStatusSchema = z.enum(["scheduled", "active", "completed", "cancelled"]);
export const responseStatusSchema = z.enum(["going", "maybe", "declined", "pending"]);
export const userResponseStatusSchema = z.enum(["going", "maybe", "declined"]);

export const createSessionSchema = z.object({
    table_id: z.string().uuid("ID de table invalide"),
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().nullable().optional(),
    scheduled_at: z.string().datetime().nullable().optional(),
    status: sessionStatusSchema.default("scheduled").optional(),
});

export const updateSessionSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: sessionStatusSchema.optional(),
    scheduled_at: z.string().datetime().nullable().optional(),
    started_at: z.string().datetime().nullable().optional(),
    ended_at: z.string().datetime().nullable().optional(),
});

export const sessionResponseSchema = z.object({
    status: userResponseStatusSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionResponseInput = z.infer<typeof sessionResponseSchema>;
export type UserResponseStatus = z.infer<typeof userResponseStatusSchema>;
