import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/auth";
import { NextResponse } from "next/server";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { AppUser } from "@/types/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: "Email ou mot de passe invalide" },
                { status: 400 }
            );
        }

        const { email, password } = result.data;
        const supabase = await createClient();

        // 2. Authenticate with Supabase
        const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !supabaseUser) {
            return NextResponse.json(
                { success: false, error: "Identifiants invalides" },
                { status: 401 }
            );
        }

        // 3. Resolve business profile
        let profile = null;
        try {
            profile = await ProfileRepository.getById(supabaseUser.id);
        } catch (profileError) {
            console.error("Profile not found after login:", supabaseUser.id);
            // Profile might not be created yet if trigger failed or sync issue
        }

        const appUser: AppUser = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            profile,
            supabaseUser,
        };

        return NextResponse.json({
            success: true,
            user: appUser,
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Une erreur est survenue lors de la connexion" },
            { status: 500 }
        );
    }
}
