import { z } from "zod";

export const ALLOWED_DICE_TYPES = [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30, 100] as const;

export const diceRollSchema = z.object({
    table_id: z.string().uuid(),
    session_id: z.string().uuid().nullable().optional(),
    dice_type: z
        .number()
        .int()
        .refine(
            (value) => ALLOWED_DICE_TYPES.includes(value as (typeof ALLOWED_DICE_TYPES)[number]),
            {
                message: "Type de dé non autorisé",
            },
        ),
    quantity: z.number().int().min(1).max(20).default(1),
    modifier: z.number().int().min(-999).max(999).default(0),
    roll_kind: z.string().trim().min(1).max(40).default("standard"),
});

export const createDiceRollSchema = diceRollSchema.omit({ table_id: true }).partial({
    session_id: true,
    quantity: true,
    modifier: true,
    roll_kind: true,
});

export type DiceRollInput = z.infer<typeof diceRollSchema>;
export type CreateDiceRollInput = z.infer<typeof createDiceRollSchema>;
