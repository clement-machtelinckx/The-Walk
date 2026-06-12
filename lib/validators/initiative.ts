import { z } from "zod";

const modifierSchema = z.number().int().min(-99).max(99);
const scoreSchema = z.number().int().min(-999).max(999).nullable();
const entryIdSchema = z.string().uuid("Entrée d'initiative invalide");

export const initiativeActionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("request"),
    }),
    z.object({
        action: z.literal("add_member"),
        user_id: z.string().uuid("Joueur invalide"),
    }),
    z.object({
        action: z.literal("add_custom"),
        label: z.string().trim().min(1, "Nom requis").max(80, "Nom trop long"),
        modifier: modifierSchema.default(0),
    }),
    z.object({
        action: z.literal("roll"),
        entry_id: entryIdSchema,
        modifier: modifierSchema.optional(),
    }),
    z.object({
        action: z.literal("roll_custom_missing"),
    }),
    z
        .object({
            action: z.literal("update_entry"),
            entry_id: entryIdSchema,
            score: scoreSchema.optional(),
            modifier: modifierSchema.optional(),
        })
        .refine((value) => value.score !== undefined || value.modifier !== undefined, {
            message: "Une modification est requise",
        }),
    z.object({
        action: z.literal("move"),
        entry_id: entryIdSchema,
        direction: z.enum(["up", "down"]),
    }),
    z.object({
        action: z.literal("set_current"),
        entry_id: entryIdSchema.nullable(),
    }),
    z.object({
        action: z.literal("remove"),
        entry_id: entryIdSchema,
    }),
    z.object({
        action: z.literal("reset"),
    }),
]);

export type InitiativeActionInput = z.infer<typeof initiativeActionSchema>;
