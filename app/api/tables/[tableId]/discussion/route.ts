import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { DiscussionService } from "@/lib/services/discussion/discussion-service";
import { createMessageSchema } from "@/lib/validators/message";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export async function GET(request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const { searchParams } = new URL(request.url);
        const page = Number.parseInt(searchParams.get("page") || "1");
        const limit = Number.parseInt(searchParams.get("limit") || "50");

        const result = await DiscussionService.listMessages(user.id, tableId, { page, limit });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[DISCUSSION_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await request.json();
        const validated = createMessageSchema.parse({
            ...body,
            table_id: tableId,
            session_id: body.session_id || null,
        });
        const message = await DiscussionService.sendMessage(user.id, validated);

        return NextResponse.json({ success: true, message });
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
        console.error("[DISCUSSION_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
