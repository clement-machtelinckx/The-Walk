import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { ResponseService } from "@/lib/services/responses/response-service";
import { sessionResponseSchema } from "@/lib/validators/session";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const body = await request.json();

        const validated = sessionResponseSchema.parse(body);
        const response = await ResponseService.respondToSession(user.id, sessionId, validated);

        return NextResponse.json({ response });
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
        console.error("[SESSION_RESPOND_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
