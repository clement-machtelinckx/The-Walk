import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { ResponseService } from "@/lib/services/responses/response-service";
import { sessionResponseSchema } from "@/lib/validators/session";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { sessionId } = await params;
        const body = await request.json();

        const validated = sessionResponseSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validated.error.format() },
                { status: 400 },
            );
        }

        const response = await ResponseService.respondToSession(user.id, sessionId, validated.data);

        return NextResponse.json({ response });
    } catch (error: unknown) {
        console.error("[SESSION_RESPOND_POST]", error);
        const err = error as any;
        const status = err.name === "NotFoundError" ? 404 : err.name === "ForbiddenError" ? 403 : 500;
        return NextResponse.json({ error: err.message || "Erreur interne" }, { status });
    }

}
