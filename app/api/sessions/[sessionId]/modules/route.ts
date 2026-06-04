import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { LiveModuleSettingsService } from "@/lib/services/sessions/live-module-settings-service";
import { updateSessionLiveModulesSchema } from "@/lib/validators/live-module-settings";
import { z } from "zod";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const settings = await LiveModuleSettingsService.getSettings(user.id, sessionId);

        return NextResponse.json({ settings });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[SESSION_LIVE_MODULES_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const body = await request.json();

        const updates = updateSessionLiveModulesSchema.parse(body);
        const settings =
            "module_key" in updates
                ? await LiveModuleSettingsService.updateModule(
                      user.id,
                      sessionId,
                      updates.module_key,
                      updates.enabled,
                  )
                : await LiveModuleSettingsService.updateSettings(user.id, sessionId, updates);

        return NextResponse.json({ success: true, settings });
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
        console.error("[SESSION_LIVE_MODULES_PATCH]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
