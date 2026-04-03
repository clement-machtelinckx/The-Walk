import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { updateSessionSchema } from "@/lib/validators/session";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const session = await SessionService.getSessionById(user.id, sessionId);

        return NextResponse.json({ session });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/sessions/[sessionId] error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const body = await req.json();

        const validatedData = updateSessionSchema.parse(body);

        const session = await SessionService.updateSession(user.id, sessionId, validatedData);

        return NextResponse.json({ session });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }
        console.error("PATCH /api/sessions/[sessionId] error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
