import { getServerClient } from "@/lib/db";
import { handleDbError, applyPagination, PaginationParams, PaginatedResult } from "./_shared/base";
import { TableMessage } from "@/types/session";
import { CreateMessageInput } from "@/lib/validators/message";

export const MessageRepository = {
    async createTableMessage(input: CreateMessageInput, userId: string): Promise<TableMessage> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("table_messages")
            .insert({
                table_id: input.table_id,
                session_id: input.session_id || null,
                user_id: userId,
                content: input.content,
            })
            .select()
            .single();

        handleDbError(error, "MessageRepository.createTableMessage");
        return data;
    },

    async listTableMessages(
        tableId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<TableMessage>> {
        const supabase = await getServerClient();

        const { count, error: countError } = await supabase
            .from("table_messages")
            .select("id", { count: "exact", head: true })
            .eq("table_id", tableId);

        handleDbError(countError, "MessageRepository.listTableMessages (count)");

        let query = supabase
            .from("table_messages")
            .select("*, profiles(*)")
            .eq("table_id", tableId);

        query = applyPagination(query, { ...params, ascending: false }, "created_at");

        const { data, error } = await query;
        handleDbError(error, "MessageRepository.listTableMessages");

        const limit = params.limit || 50;
        return {
            data: data ? [...data].reverse() : [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },
};
