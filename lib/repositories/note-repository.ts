import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { CreateNoteInput, UpdateNoteInput } from "@/lib/validators/note";
import { NotFoundError } from "@/lib/errors";

export const NoteRepository = {
    async create(input: CreateNoteInput, userId: string) {
        const supabase = await getServerClient();
        const table = input.is_group ? "group_notes" : "personal_notes";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            content: input.content,
            table_id: input.table_id,
            session_id: input.session_id,
        };

        if (!input.is_group) {
            payload.user_id = userId;
        }

        const { data, error } = await supabase.from(table).insert(payload).select().single();

        handleDbError(error, `NoteRepository.create (${table})`);
        return data;
    },

    async getById(id: string, isGroup: boolean) {
        const supabase = await getServerClient();
        const table = isGroup ? "group_notes" : "personal_notes";

        const { data, error } = await supabase.from(table).select("*").eq("id", id).single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Note", id);
        }
        handleDbError(error, `NoteRepository.getById (${table})`);
        return data;
    },

    async update(id: string, updates: UpdateNoteInput, isGroup: boolean) {
        const supabase = await getServerClient();
        const table = isGroup ? "group_notes" : "personal_notes";

        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        handleDbError(error, `NoteRepository.update (${table})`);
        return data;
    },

    async delete(id: string, isGroup: boolean) {
        const supabase = await getServerClient();
        const table = isGroup ? "group_notes" : "personal_notes";

        const { error } = await supabase.from(table).delete().eq("id", id);

        handleDbError(error, `NoteRepository.delete (${table})`);
    },

    async listPersonal(userId: string, tableId?: string) {
        const supabase = await getServerClient();
        let query = supabase.from("personal_notes").select("*").eq("user_id", userId);

        if (tableId) {
            query = query.eq("table_id", tableId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });
        handleDbError(error, "NoteRepository.listPersonal");
        return data || [];
    },

    async listGroup(tableId: string) {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("group_notes")
            .select("*")
            .eq("table_id", tableId)
            .order("created_at", { ascending: false });

        handleDbError(error, "NoteRepository.listGroup");
        return data || [];
    },

    /**
     * Gère la note personnelle unique pour une table donnée.
     */
    async getPersonalByTable(userId: string, tableId: string) {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("personal_notes")
            .select("*")
            .eq("user_id", userId)
            .eq("table_id", tableId)
            .maybeSingle();

        handleDbError(error, "NoteRepository.getPersonalByTable");
        return data;
    },

    async upsertPersonal(userId: string, tableId: string, content: string) {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("personal_notes")
            .upsert(
                {
                    user_id: userId,
                    table_id: tableId,
                    content,
                },
                { onConflict: "user_id,table_id" },
            )
            .select()
            .single();

        handleDbError(error, "NoteRepository.upsertPersonal");
        return data;
    },

    /**
     * Gère la note de groupe unique pour une table donnée.
     */
    async getGroupByTable(tableId: string) {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("group_notes")
            .select("*")
            .eq("table_id", tableId)
            .maybeSingle();

        handleDbError(error, "NoteRepository.getGroupByTable");
        return data;
    },

    async upsertGroup(tableId: string, content: string) {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("group_notes")
            .upsert(
                {
                    table_id: tableId,
                    content,
                },
                { onConflict: "table_id" },
            )
            .select()
            .single();

        handleDbError(error, "NoteRepository.upsertGroup");
        return data;
    },
};
