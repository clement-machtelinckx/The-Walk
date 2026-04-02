export type UserRole = "admin" | "user" | "gm";

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    avatarUrl?: string;
}

export interface AuthSession {
    user: User | null;
    expires: string;
}
