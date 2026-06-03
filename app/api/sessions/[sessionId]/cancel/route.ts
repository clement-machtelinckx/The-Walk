import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { AppError } from "@/lib/errors";

type SessionRouteContext = Readonly<{
    params: Promise<{ sessionId: string }>;
}>;

export async function POST(_request: Request, { params }: SessionRouteContext) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const session = await SessionService.cancelSession(user.id, sessionId);

        return NextResponse.json({ session });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[SESSION_CANCEL_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
