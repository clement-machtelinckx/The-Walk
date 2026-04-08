import { requireAuth } from "@/lib/auth/server";
import { GroupInvitationService } from "@/lib/services/invitations/group-invitation-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ tableId: string }> },
) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;
        const body = await req.json();
        const { role, durationHours } = body;

        if (!role || !durationHours) {
            return NextResponse.json(
                { error: "Rôle et durée requis" },
                { status: 400 },
            );
        }

        const invitation = await GroupInvitationService.create(
            user.id,
            tableId,
            role,
            durationHours,
        );

        return NextResponse.json({ invitation });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST /api/tables/[tableId]/group-invitations error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ tableId: string }> },
) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        const invitations = await GroupInvitationService.listByTable(user.id, tableId);

        return NextResponse.json({ invitations });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
