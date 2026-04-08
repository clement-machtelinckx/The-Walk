import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { TableRole } from "@/types/table";
import { ForbiddenError, ValidationError, AppError } from "@/lib/errors";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ tableId: string; memberId: string }> },
) {
    try {
        // 1. Authentification
        const user = await requireAuth();

        const { tableId, memberId } = await params;
        const body = await req.json();
        const { role } = body as { role: TableRole };

        if (!role) {
            return NextResponse.json({ error: "Rôle manquant" }, { status: 400 });
        }

        // 2. Action métier (la protection MJ est gérée dans le service)
        await MembershipService.updateMemberRole(user.id, tableId, memberId, role);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[API_MEMBERS_ROLE_PATCH]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
