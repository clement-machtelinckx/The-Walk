import { requireAuth } from "@/lib/auth/server";
import { InvitationService } from "@/lib/services/invitations/invitation-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET() {
    try {
        const user = await requireAuth();

        // Match invitations based on the authenticated user's email
        const invitations = await InvitationService.listPendingForUser(user.email);

        return NextResponse.json({ invitations });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/invitations error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
