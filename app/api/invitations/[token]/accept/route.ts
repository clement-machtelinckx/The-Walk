import { requireAuth } from "@/lib/auth/server";
import { InvitationService } from "@/lib/services/invitations/invitation-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const user = await requireAuth();
        const { token } = await params;

        const { tableId } = await InvitationService.accept(user.id, token);

        return NextResponse.json({
            message: "Invitation acceptée avec succès",
            redirectTo: `/tables/${tableId}`,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST /api/invitations/[token]/accept error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
