import { getServerClient } from "@/lib/db";
import { handleDbError } from "@/lib/repositories/_shared/base";
import type { InitiativeEntry, InitiativeState } from "@/types/initiative";

type InitiativeEntryUpdates = Partial<
    Pick<
        InitiativeEntry,
        | "initiative_score"
        | "initiative_modifier"
        | "initiative_requested_at"
        | "last_roll_id"
        | "position"
    >
>;

const ENTRY_SELECT =
    "*, profile:profiles!session_initiative_entries_user_id_fkey(id, display_name, avatar_url, avatar_key)";

export const InitiativeRepository = {
    async listEntries(sessionId: string): Promise<InitiativeEntry[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_initiative_entries")
            .select(ENTRY_SELECT)
            .eq("session_id", sessionId)
            .order("position", { ascending: true })
            .order("created_at", { ascending: true });

        handleDbError(error, "InitiativeRepository.listEntries");
        return (data as unknown as InitiativeEntry[]) || [];
    },

    async getEntry(entryId: string): Promise<InitiativeEntry | null> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_initiative_entries")
            .select(ENTRY_SELECT)
            .eq("id", entryId)
            .maybeSingle();

        handleDbError(error, "InitiativeRepository.getEntry");
        return data as unknown as InitiativeEntry | null;
    },

    async getState(sessionId: string): Promise<InitiativeState | null> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_initiative_state")
            .select("*")
            .eq("session_id", sessionId)
            .maybeSingle();

        handleDbError(error, "InitiativeRepository.getState");
        return data as InitiativeState | null;
    },

    async addMemberEntries(
        sessionId: string,
        tableId: string,
        userIds: string[],
        createdBy: string,
        firstPosition: number,
    ): Promise<void> {
        if (userIds.length === 0) return;

        const supabase = await getServerClient();
        const { error } = await supabase.from("session_initiative_entries").upsert(
            userIds.map((userId, index) => ({
                session_id: sessionId,
                table_id: tableId,
                participant_type: "member",
                user_id: userId,
                position: firstPosition + index,
                created_by: createdBy,
            })),
            { onConflict: "session_id,user_id", ignoreDuplicates: true },
        );

        handleDbError(error, "InitiativeRepository.addMemberEntries");
    },

    async addCustomEntry(
        sessionId: string,
        tableId: string,
        label: string,
        modifier: number,
        position: number,
        createdBy: string,
    ): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("session_initiative_entries").insert({
            session_id: sessionId,
            table_id: tableId,
            participant_type: "custom",
            label,
            initiative_modifier: modifier,
            position,
            created_by: createdBy,
        });

        handleDbError(error, "InitiativeRepository.addCustomEntry");
    },

    async updateEntry(entryId: string, updates: InitiativeEntryUpdates): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("session_initiative_entries")
            .update(updates)
            .eq("id", entryId);

        handleDbError(error, "InitiativeRepository.updateEntry");
    },

    async requestMemberInitiative(
        sessionId: string,
        userIds: string[],
        requestedAt: string,
    ): Promise<void> {
        if (userIds.length === 0) return;

        const supabase = await getServerClient();
        const { error } = await supabase
            .from("session_initiative_entries")
            .update({
                initiative_score: null,
                initiative_requested_at: requestedAt,
                last_roll_id: null,
            })
            .eq("session_id", sessionId)
            .eq("participant_type", "member")
            .in("user_id", userIds);

        handleDbError(error, "InitiativeRepository.requestMemberInitiative");
    },

    async updatePositions(entries: Array<{ id: string; position: number }>): Promise<void> {
        await Promise.all(
            entries.map((entry) => this.updateEntry(entry.id, { position: entry.position })),
        );
    },

    async upsertRequestState(
        sessionId: string,
        tableId: string,
        requestedBy: string,
        requestedAt: string,
    ): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("session_initiative_state").upsert(
            {
                session_id: sessionId,
                table_id: tableId,
                initiative_requested_at: requestedAt,
                requested_by: requestedBy,
            },
            { onConflict: "session_id" },
        );

        handleDbError(error, "InitiativeRepository.upsertRequestState");
    },

    async setCurrentEntry(
        sessionId: string,
        tableId: string,
        entryId: string | null,
    ): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("session_initiative_state").upsert(
            {
                session_id: sessionId,
                table_id: tableId,
                current_entry_id: entryId,
            },
            { onConflict: "session_id" },
        );

        handleDbError(error, "InitiativeRepository.setCurrentEntry");
    },

    async removeEntry(entryId: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("session_initiative_entries")
            .delete()
            .eq("id", entryId);

        handleDbError(error, "InitiativeRepository.removeEntry");
    },

    async reset(sessionId: string): Promise<void> {
        const supabase = await getServerClient();
        const { error: entriesError } = await supabase
            .from("session_initiative_entries")
            .delete()
            .eq("session_id", sessionId);
        handleDbError(entriesError, "InitiativeRepository.reset entries");

        const { error: stateError } = await supabase
            .from("session_initiative_state")
            .delete()
            .eq("session_id", sessionId);
        handleDbError(stateError, "InitiativeRepository.reset state");
    },
};
