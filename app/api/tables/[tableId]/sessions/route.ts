import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { createSessionSchema } from "@/lib/validators/session";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function POST(req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await req.json();

        const validatedData = createSessionSchema.parse({
            ...body,
            table_id: tableId,
        });

        const session = await SessionService.createSession(user.id, validatedData);

        return NextResponse.json({ session }, { status: 201 });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }
        console.error("POST /api/tables/[tableId]/sessions error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
