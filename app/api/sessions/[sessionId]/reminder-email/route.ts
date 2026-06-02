import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { TransactionalEmailService } from "@/lib/services/email/transactional-email-service";

export async function POST(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const summary = await TransactionalEmailService.sendReminderForSession(user.id, sessionId);

        return NextResponse.json({ summary });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("POST /api/sessions/[sessionId]/reminder-email error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
