import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { PresenceService } from "@/lib/services/presence/presence-service";
import { rollCallSchema } from "@/lib/validators/presence";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const rollCall = await PresenceService.getRollCall(user.id, sessionId);
        const summary = await PresenceService.getPresenceSummary(user.id, sessionId);

        return NextResponse.json({ rollCall, summary });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[PRESENCE_GET]", error);
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
        const body = await request.json();

        const validated = rollCallSchema.parse(body);
        await PresenceService.saveRollCall(user.id, sessionId, validated);

        return NextResponse.json({ success: true });
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
        console.error("[PRESENCE_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
