import { getServerClient } from "@/lib/db";
import { CreatePrivateMessageInput } from "@/lib/validators/private-message";
import { TablePrivateMessage } from "@/types/session";
import { applyPagination, handleDbError, PaginatedResult, PaginationParams } from "./_shared/base";

export const PrivateMessageRepository = {
    async create(
        input: CreatePrivateMessageInput,
        senderUserId: string,
    ): Promise<TablePrivateMessage> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("table_private_messages")
            .insert({
                table_id: input.table_id,
                session_id: input.session_id || null,
                sender_user_id: senderUserId,
                recipient_user_id: input.recipient_user_id,
                content: input.content,
            })
            .select(
                "*, sender_profile:profiles!table_private_messages_sender_user_id_fkey(id, display_name, avatar_url, avatar_key), recipient_profile:profiles!table_private_messages_recipient_user_id_fkey(id, display_name, avatar_url, avatar_key)",
            )
            .single();

        handleDbError(error, "PrivateMessageRepository.create");
        return data;
    },

    async listConversation(
        tableId: string,
        userId: string,
        recipientUserId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<TablePrivateMessage>> {
        const supabase = await getServerClient();
        const pairFilter = `and(sender_user_id.eq.${userId},recipient_user_id.eq.${recipientUserId}),and(sender_user_id.eq.${recipientUserId},recipient_user_id.eq.${userId})`;

        const { count, error: countError } = await supabase
            .from("table_private_messages")
            .select("id", { count: "exact", head: true })
            .eq("table_id", tableId)
            .or(pairFilter);

        handleDbError(countError, "PrivateMessageRepository.listConversation (count)");

        let query = supabase
            .from("table_private_messages")
            .select(
                "*, sender_profile:profiles!table_private_messages_sender_user_id_fkey(id, display_name, avatar_url, avatar_key), recipient_profile:profiles!table_private_messages_recipient_user_id_fkey(id, display_name, avatar_url, avatar_key)",
            )
            .eq("table_id", tableId)
            .or(pairFilter);

        query = applyPagination(query, { ...params, ascending: false }, "created_at");

        const { data, error } = await query;
        handleDbError(error, "PrivateMessageRepository.listConversation");

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
