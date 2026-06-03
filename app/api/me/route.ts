import { getCurrentUser } from "@/lib/auth/server";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { profileUpdateSchema } from "@/lib/validators/profile";
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

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = profileUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
        }

        const updates: Parameters<typeof ProfileRepository.update>[1] = {};

        if ("avatarKey" in parsed.data) {
            updates.avatar_key = parsed.data.avatarKey ?? null;
        }

        const profile = await ProfileRepository.update(user.id, updates);
        const publicUser = {
            id: user.id,
            email: user.email,
            profile,
        };

        return NextResponse.json({ success: true, user: publicUser });
    } catch (error) {
        console.error("API /api/me PATCH error:", error);
        return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
    }
}
