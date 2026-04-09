import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // 0. Rate limiting
        const { ok } = rateLimit(request, { limit: 5, windowMs: 60 * 1000 }); // 5 attempts per minute
        if (!ok) {
            return NextResponse.json(
                { success: false, error: "Trop de tentatives. Veuillez réessayer plus tard." },
                { status: 429 },
            );
        }

        const body = await request.json();

        // 1. Validate input
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error.issues[0]?.message || "Données invalides" },
                { status: 400 },
            );
        }

        const { email, password, displayName } = result.data;
        const supabase = await createClient();

        // 2. Register with Supabase
        const {
            data: { user: supabaseUser },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName || email.split("@")[0],
                },
            },
        });

        if (error || !supabaseUser) {
            return NextResponse.json(
                { success: false, error: error?.message || "Erreur lors de l'inscription" },
                { status: 400 },
            );
        }

        // 3. Post-register strategy: Immediate login/session setup
        // Note: The SQL trigger public.handle_new_user() will create the profile.

        let profile = null;
        try {
            // We wait a tiny bit to let the trigger run (pragmatic approach)
            // In a real high-load scenario, we might retry or accept null for a moment.
            profile = await ProfileRepository.getById(supabaseUser.id);
        } catch (profileError) {
            console.warn("Profile not immediately available for user:", supabaseUser.id);
        }
        const appUser = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            profile,
        };

        return NextResponse.json({
            success: true,
            user: appUser,
            // If Supabase is configured for email confirmation, we might want to tell the user
            message:
                supabaseUser.identities?.length === 0
                    ? "Compte déjà existant ou confirmation requise"
                    : "Inscription réussie",
        });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { success: false, error: "Une erreur est survenue lors de l'inscription" },
            { status: 500 },
        );
    }
}
