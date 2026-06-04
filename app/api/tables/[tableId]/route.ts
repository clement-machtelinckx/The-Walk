import { requireAuth } from "@/lib/auth/server";
import { TableService } from "@/lib/services/tables/table-service";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        const details = await TableService.getTableDetails(user.id, tableId);

        return NextResponse.json(details);
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/tables/[tableId] error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
    try {
        const user = await requireAuth();
        const { tableId } = await params;

        await TableService.deleteTable(user.id, tableId);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("DELETE /api/tables/[tableId] error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
