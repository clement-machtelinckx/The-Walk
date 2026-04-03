import { z } from "zod";

export const tableRoleSchema = z.enum(["gm", "player", "observer"]);

export const createTableSchema = z.object({
    name: z.string().min(1, "Le nom de la table est requis"),
    description: z.string().nullable().optional(),
});

export const updateTableSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
});

export const tableMembershipSchema = z.object({
    table_id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: tableRoleSchema,
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type TableMembershipInput = z.infer<typeof tableMembershipSchema>;
