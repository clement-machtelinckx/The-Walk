import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { ResponseService } from "@/lib/services/responses/response-service";
import { AppError } from "@/lib/errors";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const data = await ResponseService.getSessionResponses(user.id, sessionId);

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[SESSION_RESPONSES_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
