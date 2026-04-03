import { getServiceRoleClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { createHash } from "crypto";

export interface LoginToken {
    id: string;
    profile_id: string;
    token_hash: string;
    expires_at: string;
    used_at: string | null;
    redirect_to: string;
    created_at: string;
    updated_at: string;
}

/**
 * Hash a raw token for storage or lookup.
 */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export const LoginTokenRepository = {
    /**
     * Create a new login token.
     * @returns The raw token (to be sent to user) and the created record.
     */
    async create(
        profileId: string,
        expiresInMinutes: number = 60,
        redirectTo: string = "/tables",
    ): Promise<{ rawToken: string; record: LoginToken }> {
        const supabase = getServiceRoleClient();
        const rawToken =
            Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from("login_tokens")
            .insert({
                profile_id: profileId,
                token_hash: tokenHash,
                expires_at: expiresAt,
                redirect_to: redirectTo,
            })
            .select()
            .single();

        handleDbError(error, "LoginTokenRepository.create");
        return { rawToken, record: data };
    },

    /**
     * Find a valid (not expired, not used) token by its raw value.
     */
    async findValid(rawToken: string): Promise<LoginToken | null> {
        const supabase = getServiceRoleClient();
        const tokenHash = hashToken(rawToken);
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("login_tokens")
            .select("*")
            .eq("token_hash", tokenHash)
            .is("used_at", null)
            .gt("expires_at", now)
            .maybeSingle();

        handleDbError(error, "LoginTokenRepository.findValid");
        return data;
    },

    /**
     * Mark a token as used.
     */
    async markAsUsed(id: string): Promise<void> {
        const supabase = getServiceRoleClient();
        const now = new Date().toISOString();

        const { error } = await supabase.from("login_tokens").update({ used_at: now }).eq("id", id);

        handleDbError(error, "LoginTokenRepository.markAsUsed");
    },
};
