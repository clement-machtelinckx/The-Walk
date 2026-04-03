import { getServerClient } from "@/lib/db";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { AppUser } from "@/types/auth";
import { TableRole } from "@/types/table";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user and their business profile.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
    const supabase = await getServerClient();
    
    // Get auth user from Supabase session
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !supabaseUser) {
        return null;
    }

    // Get business profile
    try {
        const profile = await ProfileRepository.getById(supabaseUser.id);
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            profile,
            supabaseUser,
        };
    } catch (error) {
        console.error("Error fetching profile for user:", supabaseUser.id, error);
        // Fallback: return user with null profile if it doesn't exist yet
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            profile: null,
            supabaseUser,
        };
    }
}

/**
 * Ensure the user is authenticated, or throw UnauthorizedError.
 */
export async function requireAuth(): Promise<AppUser> {
    const user = await getCurrentUser();
    if (!user) {
        throw new UnauthorizedError("Authentication required");
    }
    return user;
}

/**
 * Check if the user has a specific role in a table.
 * Returns true if the user has the role, false otherwise.
 */
export async function hasTableRole(tableId: string, role?: TableRole): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    const membership = await MembershipRepository.getByUserAndTable(user.id, tableId);
    if (!membership) return false;

    if (role && membership.role !== role) return false;
    
    return true;
}

/**
 * Ensure the user has a specific role in a table, or throw ForbiddenError.
 */
export async function requireTableRole(tableId: string, role?: TableRole): Promise<void> {
    const hasRole = await hasTableRole(tableId, role);
    if (!hasRole) {
        throw new ForbiddenError(`Required role ${role || "any"} not found for table ${tableId}`);
    }
}

/**
 * Redirect to a specific path if the user is already authenticated.
 * Useful for login/register pages.
 */
export async function redirectIfAuthenticated(path: string = "/tables") {
    const user = await getCurrentUser();
    if (user) {
        redirect(path);
    }
}
