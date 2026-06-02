import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { NotificationService } from "@/lib/services/notifications/notification-service";

export async function GET() {
    try {
        const user = await requireAuth();
        const count = await NotificationService.getUnreadCount(user.id);

        return NextResponse.json(count);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("[NOTIFICATIONS_UNREAD_COUNT_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
