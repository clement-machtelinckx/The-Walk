import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { UpdatePresenceInput } from "@/lib/validators/presence";
import { SessionPresence } from "@/types/session";

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

    async listBySession(sessionId: string): Promise<SessionPresence[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_presence")
            .select("*, profiles!inner(*)")
            .eq("session_id", sessionId);

        handleDbError(error, "PresenceRepository.listBySession");
        return data || [];
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
