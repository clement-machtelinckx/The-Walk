import { getServerClient } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { passwordChangeSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";
import { AppError, UnauthorizedError, ValidationError } from "@/lib/errors";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const body = await req.json();

        const validatedData = passwordChangeSchema.parse(body);

        const supabase = await getServerClient();

        // To verify the current password, we attempt a re-auth
        // This is safer than manual hashing and aligned with Supabase Auth
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: validatedData.currentPassword,
        });

        if (reAuthError) {
            throw new UnauthorizedError("Ancien mot de passe incorrect");
        }

        // If re-auth succeeded, rotate password
        const { error: updateError } = await supabase.auth.updateUser({
            password: validatedData.newPassword,
        });

        if (updateError) {
            throw new ValidationError(updateError.message);
        }

        return NextResponse.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }
        console.error("Password change error:", error);
        return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
}
