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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = request.nextUrl.pathname === "/login";
    const isPublicPage = request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/auth");
    
    // Check if the route is within the (app) group or other protected areas
    // Note: We can't directly check the (app) group name in the URL, but we can check the path
    const isProtectedRoute = 
        request.nextUrl.pathname.startsWith("/tables") || 
        request.nextUrl.pathname.startsWith("/mon-compte");

    if (!user && isProtectedRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
        // User is logged in, but on the login page -> redirect to /tables
        const url = request.nextUrl.clone();
        url.pathname = "/tables";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
