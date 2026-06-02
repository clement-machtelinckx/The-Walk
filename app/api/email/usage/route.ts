import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors";
import { EmailService } from "@/lib/services/email/email-service";

export async function GET() {
    try {
        const user = await requireAuth();
        const usage = await EmailService.getUsageForUser(user.id);

        return NextResponse.json({ usage });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("[EMAIL_USAGE_GET]", error);
        return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
    }
}
