import { z } from "zod";
import { tableRoleSchema } from "./table";

export const invitationStatusSchema = z.enum(["pending", "accepted", "declined", "expired"]);

export const createInvitationSchema = z.object({
    table_id: z.string().uuid("ID de table invalide"),
    email: z.string().email("Email invalide"),
    role: tableRoleSchema.default("player"),
});

export const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Token requis"),
});

export const createGroupInvitationSchema = z.object({
    role: tableRoleSchema.default("player"),
    durationHours: z.union([z.literal(24), z.literal(48), z.literal(168)]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type CreateGroupInvitationInput = z.infer<typeof createGroupInvitationSchema>;
