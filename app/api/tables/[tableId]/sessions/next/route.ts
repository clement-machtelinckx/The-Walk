import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        const session = await SessionService.getNextSession(user.id, tableId);

        return NextResponse.json({ session });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/tables/[tableId]/sessions/next error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
