import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { NotificationService } from "@/lib/services/notifications/notification-service";
import { notificationIdSchema } from "@/lib/validators/notification";

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ notificationId: string }> },
) {
    try {
        const user = await requireAuth();
        const routeParams = notificationIdSchema.parse(await params);
        const notification = await NotificationService.markAsRead(
            user.id,
            routeParams.notificationId,
        );

        return NextResponse.json({ notification });
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

        console.error("[NOTIFICATION_READ_PATCH]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
