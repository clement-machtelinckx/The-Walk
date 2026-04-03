import { createServerClient } from "@supabase/ssr";
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

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Route types
    const isAuthRoute = path === "/login" || path === "/register";
    const isProtectedRoute = path.startsWith("/tables") || path.startsWith("/mon-compte");

    // 1. Redirect unauthenticated users from protected routes to /login
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
    }

    // 2. Redirect authenticated users from auth routes (login/register) to /tables
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/tables";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
