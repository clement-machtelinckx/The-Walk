import { getCurrentUser } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ user: null, status: "unauthenticated" });
        }

        const publicUser = {
            id: user.id,
            email: user.email,
            profile: user.profile,
        };

        return NextResponse.json({ user: publicUser, status: "authenticated" });
    } catch (error) {
        console.error("API /api/me error:", error);
        return NextResponse.json(
            { error: "Erreur serveur interne", user: null, status: "unauthenticated" },
            { status: 500 },
        );
    }
}
