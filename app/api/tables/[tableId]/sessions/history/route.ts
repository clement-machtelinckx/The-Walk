import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { AppError } from "@/lib/errors";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ tableId: string }> },
) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        const history = await SessionService.getSessionHistory(user.id, tableId);

        return NextResponse.json({ history });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[TABLE_SESSIONS_HISTORY_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
