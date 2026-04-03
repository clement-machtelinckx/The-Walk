import { getServiceRoleClient, getServerClient } from "@/lib/db";
import { LoginTokenRepository } from "@/lib/repositories/login-token-repository";
import { tokenLoginSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";
import { AppError, UnauthorizedError, DatabaseError } from "@/lib/errors";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = tokenLoginSchema.parse(body);

        // 1. Find and validate the token
        const tokenRecord = await LoginTokenRepository.findValid(validatedData.token);

        if (!tokenRecord) {
            throw new UnauthorizedError("Token invalide, expiré ou déjà utilisé");
        }

        // 2. Establish session via Supabase Admin SDK
        const adminSupabase = getServiceRoleClient();

        // Need the user email to generate a link
        const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(
            tokenRecord.profile_id,
        );

        if (userError || !userData.user?.email) {
            console.error("User fetch error:", userError);
            throw new DatabaseError("Utilisateur introuvable");
        }

        // Generate a magic link (OTP type)
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
        });

        if (linkError || !linkData.properties?.email_otp) {
            console.error("Link generation error:", linkError);
            throw new DatabaseError("Impossible de générer le lien de connexion");
        }

        // 3. Mark token as used
        await LoginTokenRepository.markAsUsed(tokenRecord.id);

        // 4. Authenticate the user with the generated OTP
        const supabase = await getServerClient();
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            email: userData.user.email,
            token: linkData.properties.email_otp,
            type: "magiclink",
        });

        if (authError || !authData.session) {
            console.error("Auth verification error:", authError);
            throw new DatabaseError("Échec de l'authentification");
        }

        const redirectTo = validatedData.redirectTo || tokenRecord.redirect_to || "/tables";

        return NextResponse.json({
            message: "Connexion réussie",
            redirectTo,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Token manquant ou invalide" }, { status: 400 });
        }
        console.error("Token login error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la connexion" },
            { status: 500 },
        );
    }
}
