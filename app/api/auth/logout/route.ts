import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Une erreur est survenue lors de la déconnexion" },
            { status: 500 }
        );
    }
}
