import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { UpdatePresenceInput, RollCallInput } from "@/lib/validators/presence";
import { SessionPresence, SessionPresenceWithProfile } from "@/types/session";

export const PresenceRepository = {
    async update(input: UpdatePresenceInput, userId: string): Promise<SessionPresence> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_presence")
            .upsert({
                session_id: input.session_id,
                user_id: userId,
                status: input.status,
                last_seen_at: new Date().toISOString(),
            })
            .select()
            .single();

        handleDbError(error, "PresenceRepository.update");
        return data;
    },

    async listBySession(sessionId: string): Promise<SessionPresenceWithProfile[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_presence")
            .select("*, profiles!inner(id, display_name, avatar_url)")
            .eq("session_id", sessionId);

        handleDbError(error, "PresenceRepository.listBySession");
        return (data as SessionPresenceWithProfile[]) || [];
    },

    async upsertBulk(sessionId: string, input: RollCallInput): Promise<void> {
        const supabase = await getServerClient();
        const rows = input.presences.map((p) => ({
            session_id: sessionId,
            user_id: p.user_id,
            status: p.status,
            last_seen_at: new Date().toISOString(),
        }));

        const { error } = await supabase
            .from("session_presence")
            .upsert(rows, { onConflict: "session_id,user_id" });

        handleDbError(error, "PresenceRepository.upsertBulk");
    },

    async updateLastSeen(sessionId: string, userId: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("session_presence")
            .update({ last_seen_at: new Date().toISOString() })
            .match({ session_id: sessionId, user_id: userId });

        handleDbError(error, "PresenceRepository.updateLastSeen");
    },
};
