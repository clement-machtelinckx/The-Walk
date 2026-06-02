import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { PrivateMessageService } from "@/lib/services/private-messages/private-message-service";
import {
    createPrivateMessageSchema,
    privateMessageRecipientSchema,
} from "@/lib/validators/private-message";
import { z } from "zod";

export async function GET(request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const recipientInput = privateMessageRecipientSchema.parse({
            recipient_user_id: searchParams.get("recipient_user_id"),
        });

        const data = await PrivateMessageService.listConversation(
            user.id,
            tableId,
            recipientInput.recipient_user_id,
            { page, limit: 50 },
        );

        return NextResponse.json(data);
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
        console.error("[PRIVATE_MESSAGES_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await request.json();

        const input = createPrivateMessageSchema.parse({
            ...body,
            table_id: tableId,
            session_id: body.session_id || null,
        });

        const message = await PrivateMessageService.sendMessage(user.id, input);

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
        console.error("[PRIVATE_MESSAGES_POST]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
