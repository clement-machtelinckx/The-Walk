import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { NotificationService } from "@/lib/services/notifications/notification-service";

export async function PATCH() {
    try {
        const user = await requireAuth();
        const result = await NotificationService.markAllAsRead(user.id);

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("[NOTIFICATIONS_READ_ALL_PATCH]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
