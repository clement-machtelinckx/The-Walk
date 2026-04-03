export type UserRole = "admin" | "user"; // App-wide roles if needed later

export interface Profile {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthSession {
    user: Profile | null;
    expires: string;
}
