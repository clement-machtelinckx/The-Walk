import { getCurrentUser } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ user: null, status: "unauthenticated" });
        }

        return NextResponse.json({ user, status: "authenticated" });
    } catch (error) {
        console.error("API /api/me error:", error);
        return NextResponse.json(
            { error: "Internal server error", user: null, status: "unauthenticated" },
            { status: 500 }
        );
    }
}
