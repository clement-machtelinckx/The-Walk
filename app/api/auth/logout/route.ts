import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getLoginPathWithNext, getSafeNextPath } from "@/lib/auth/redirect";

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Une erreur est survenue lors de la déconnexion" },
            { status: 500 },
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();

        const { searchParams, origin } = new URL(request.url);
        const nextPath = getSafeNextPath(searchParams.get("next"));

        return NextResponse.redirect(new URL(getLoginPathWithNext(nextPath), origin));
    } catch (error) {
        console.error("Logout redirect error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}
