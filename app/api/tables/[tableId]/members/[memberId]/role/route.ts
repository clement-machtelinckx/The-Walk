import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { TableRole } from "@/types/table";
import { ForbiddenError, ValidationError } from "@/lib/errors";

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
    } catch (error: unknown) {
        console.error("[API_MEMBERS_ROLE_PATCH]", error);

        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        if (error instanceof ValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const errorMessage = error instanceof Error ? error.message : "Erreur interne";
        const status =
            error && typeof error === "object" && "status" in error
                ? (error.status as number)
                : 500;

        return NextResponse.json({ error: errorMessage }, { status });
    }
}
