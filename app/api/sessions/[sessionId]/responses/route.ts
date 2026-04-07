import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { ResponseService } from "@/lib/services/responses/response-service";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { sessionId } = await params;
        const data = await ResponseService.getSessionResponses(user.id, sessionId);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("[SESSION_RESPONSES_GET]", error);
        const err = error as any;
        const status = err.name === "NotFoundError" ? 404 : err.name === "ForbiddenError" ? 403 : 500;
        return NextResponse.json({ error: err.message || "Erreur interne" }, { status });
    }

}
