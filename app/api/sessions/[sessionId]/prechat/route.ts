import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { PrechatService } from "@/lib/services/prechat/prechat-service";
import { createMessageSchema } from "@/lib/validators/message";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        const result = await PrechatService.listMessages(user.id, sessionId, { page, limit });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[PRECHAT_GET]", error);
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

        // On force le session_id du payload à correspondre à l'URL pour plus de sécurité
        const validated = createMessageSchema.parse({ ...body, session_id: sessionId });
        const message = await PrechatService.sendMessage(user.id, validated);

        return NextResponse.json({ message });
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
        console.error("[PRECHAT_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
