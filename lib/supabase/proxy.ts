import { createServerClient } from "@supabase/ssr";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Validate and refresh the JWT using Supabase's SSR flow.
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const isAuthenticated = !claimsError && Boolean(claimsData?.claims?.sub);

    const path = request.nextUrl.pathname;
    const isAuthRoute = path === "/login" || path === "/register";
    const isProtectedRoute = path.startsWith("/tables") || path.startsWith("/mon-compte");

    if (!isAuthenticated && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
    }

    if (isAuthenticated && isAuthRoute) {
        const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next")) || "/tables";
        const url = new URL(nextPath, request.nextUrl.origin);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
