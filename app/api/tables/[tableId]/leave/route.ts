import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function POST(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        await MembershipService.leaveTable(user.id, tableId);

        return NextResponse.json({
            message: "Vous avez quitté la table avec succès.",
            redirectTo: "/tables",
        });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("POST /api/tables/[tableId]/leave error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
