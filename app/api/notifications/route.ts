import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { NotificationService } from "@/lib/services/notifications/notification-service";
import { listNotificationsQuerySchema } from "@/lib/validators/notification";

export async function GET(request: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const query = listNotificationsQuerySchema.parse({
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
            unreadOnly: searchParams.get("unreadOnly") || undefined,
        });

        const notifications = await NotificationService.listForUser(user.id, query);

        return NextResponse.json(notifications);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Données invalides", details: error.format() },
                { status: 400 },
            );
        }

        console.error("[NOTIFICATIONS_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
