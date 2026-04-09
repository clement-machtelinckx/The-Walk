import { User as SupabaseUser } from "@supabase/supabase-js";
import { Profile } from "@/lib/repositories/profile-repository";

/**
 * PublicUser represents the user data exposed to the client.
 */
export interface PublicUser {
    id: string;
    email: string;
    profile: Profile | null;
}

/**
 * AppUser represents the combined authentication user (Supabase)
 * and the business profile (public.profiles).
 * Internal server-side use only.
 */
export interface AppUser extends PublicUser {
    supabaseUser: SupabaseUser;
}

/**
 * AuthStatus represents the current state of authentication in the client.
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * AuthSession represents the session state exposed to the application.
 */
export interface AuthSession {
    user: PublicUser | null;
    status: AuthStatus;
}

/**
 * Login response from /api/auth/login
 */
export interface LoginResponse {
    success: boolean;
    user: PublicUser | null;
    error?: string;
}
