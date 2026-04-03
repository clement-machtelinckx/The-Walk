import { requireAuth } from "@/lib/auth/server";
import { TableService } from "@/lib/services/tables/table-service";
import { createTableSchema } from "@/lib/validators/table";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function GET() {
    try {
        const user = await requireAuth();
        const tables = await TableService.listUserTables(user.id);

        return NextResponse.json({ tables });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/tables error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const body = await req.json();

        const validatedData = createTableSchema.parse(body);
        const table = await TableService.createTable(user.id, validatedData);

        return NextResponse.json({ table }, { status: 201 });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }
        console.error("POST /api/tables error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
