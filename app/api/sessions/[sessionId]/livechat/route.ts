import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { LivechatService } from "@/lib/services/livechat/livechat-service";
import { createMessageSchema } from "@/lib/validators/message";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        // On peut éventuellement récupérer la page via searchParams
        const { searchParams } = new URL(_request.url);
        const page = parseInt(searchParams.get("page") || "1");

        const data = await LivechatService.listMessages(user.id, sessionId, { page });

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[LIVECHAT_GET]", error);
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

        const validated = createMessageSchema.parse({
            ...body,
            session_id: sessionId,
        });

        const message = await LivechatService.sendMessage(user.id, validated);

        return NextResponse.json({ success: true, message });
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
        console.error("[LIVECHAT_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
