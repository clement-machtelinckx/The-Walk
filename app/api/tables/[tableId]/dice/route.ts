import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { DiceService } from "@/lib/services/dice/dice-service";
import { createDiceRollSchema, diceRollSchema } from "@/lib/validators/dice";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function GET(_request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const rolls = await DiceService.listRolls(user.id, tableId);

        return NextResponse.json({ rolls });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[DICE_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await request.json();

        const payload = createDiceRollSchema.parse(body);
        const validated = diceRollSchema.parse({
            ...payload,
            table_id: tableId,
        });

        const roll = await DiceService.createRoll(user.id, validated);

        return NextResponse.json({ success: true, roll });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Données invalides", details: error.format() },
                { status: 400 },
            );
        }
        console.error("[DICE_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
