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

        const session = await SessionService.getActiveSession(user.id, tableId);

        return NextResponse.json({ session });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[SESSION_ACTIVE_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
