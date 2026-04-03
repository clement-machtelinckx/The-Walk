import { User as SupabaseUser } from "@supabase/supabase-js";
import { Profile } from "@/lib/repositories/profile-repository";

/**
 * AppUser represents the combined authentication user (Supabase)
 * and the business profile (public.profiles).
 */
export interface AppUser {
    id: string;
    email: string;
    profile: Profile | null;
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
    user: AppUser | null;
    status: AuthStatus;
}

/**
 * Login response from /api/auth/login
 */
export interface LoginResponse {
    success: boolean;
    user: AppUser | null;
    error?: string;
}
