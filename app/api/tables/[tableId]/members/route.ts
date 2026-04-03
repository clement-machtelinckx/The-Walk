import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        // Ensure user is a member to list members
        await MembershipService.requireMembership(user.id, tableId);

        const members = await MembershipService.listMembers(tableId);

        return NextResponse.json({ members });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/tables/[tableId]/members error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
