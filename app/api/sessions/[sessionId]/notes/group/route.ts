import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { NoteService } from "@/lib/services/notes/note-service";
import { AppError } from "@/lib/errors";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;

        const note = await NoteService.getGroupNote(user.id, sessionId);
        return NextResponse.json({ note });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const user = await requireAuth();
        const { sessionId } = await params;
        const { content } = await request.json();

        const note = await NoteService.updateGroupNote(user.id, sessionId, content);
        return NextResponse.json({ success: true, note });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
