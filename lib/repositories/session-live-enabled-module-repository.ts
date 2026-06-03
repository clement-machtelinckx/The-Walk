import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { SessionLiveEnabledModule } from "@/types/live-module-settings";

export const SessionLiveEnabledModuleRepository = {
    async listBySessionId(sessionId: string): Promise<SessionLiveEnabledModule[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_live_enabled_modules")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

        handleDbError(error, "SessionLiveEnabledModuleRepository.listBySessionId");
        return data || [];
    },

    async enableModule(sessionId: string, moduleKey: string): Promise<SessionLiveEnabledModule> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_live_enabled_modules")
            .upsert(
                {
                    session_id: sessionId,
                    module_key: moduleKey,
                },
                { onConflict: "session_id,module_key" },
            )
            .select()
            .single();

        handleDbError(error, "SessionLiveEnabledModuleRepository.enableModule");
        return data;
    },

    async disableModule(sessionId: string, moduleKey: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("session_live_enabled_modules")
            .delete()
            .eq("session_id", sessionId)
            .eq("module_key", moduleKey);

        handleDbError(error, "SessionLiveEnabledModuleRepository.disableModule");
    },
};
