import { requireAuth } from "@/lib/auth/server";
import { InvitationService } from "@/lib/services/invitations/invitation-service";
import { createInvitationSchema } from "@/lib/validators/invitation";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        const invitations = await InvitationService.listByTable(user.id, tableId);

        return NextResponse.json({ invitations });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/tables/[tableId]/invitations error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await req.json();

        const validatedData = createInvitationSchema.parse({
            ...body,
            table_id: tableId,
        });

        const invitation = await InvitationService.create(user.id, validatedData);

        return NextResponse.json({ invitation }, { status: 201 });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }
        console.error("POST /api/tables/[tableId]/invitations error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
