import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/server";
import { AppError, DatabaseError } from "@/lib/errors";
import { InitiativeService } from "@/lib/services/initiative/initiative-service";
import { initiativeActionSchema } from "@/lib/validators/initiative";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const initiative = await InitiativeService.getSnapshot(user.id, sessionId);

        return NextResponse.json({ initiative });
    } catch (error) {
        if (error instanceof DatabaseError) {
            console.error("[INITIATIVE_GET_DATABASE]", error);
            return NextResponse.json(
                { error: "Impossible de charger l'initiative pour le moment." },
                { status: 500 },
            );
        }
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[INITIATIVE_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const input = initiativeActionSchema.parse(await request.json());
        const initiative = await InitiativeService.executeAction(user.id, sessionId, input);

        return NextResponse.json({ success: true, initiative });
    } catch (error) {
        if (error instanceof DatabaseError) {
            console.error("[INITIATIVE_POST_DATABASE]", error);
            return NextResponse.json(
                { error: "Impossible de mettre à jour l'initiative pour le moment." },
                { status: 500 },
            );
        }
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Données invalides", details: error.format() },
                { status: 400 },
            );
        }
        console.error("[INITIATIVE_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
