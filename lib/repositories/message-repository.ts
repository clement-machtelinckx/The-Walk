import { getServerClient } from "@/lib/db";
import { handleDbError, applyPagination, PaginationParams, PaginatedResult } from "./_shared/base";
import { SessionMessage } from "@/types/session";
import { CreateMessageInput } from "@/lib/validators/message";

export const MessageRepository = {
    async createPreSession(input: CreateMessageInput, userId: string): Promise<SessionMessage> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("pre_session_messages")
            .insert({
                session_id: input.session_id,
                user_id: userId,
                content: input.content,
            })
            .select()
            .single();

        handleDbError(error, "MessageRepository.createPreSession");
        return data;
    },

    async createLiveSession(input: CreateMessageInput, userId: string): Promise<SessionMessage> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("live_session_messages")
            .insert({
                session_id: input.session_id,
                user_id: userId,
                content: input.content,
            })
            .select()
            .single();

        handleDbError(error, "MessageRepository.createLiveSession");
        return data;
    },

    async listPreSession(
        sessionId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<SessionMessage>> {
        const supabase = await getServerClient();

        const { count, error: countError } = await supabase
            .from("pre_session_messages")
            .select("id", { count: "exact", head: true })
            .eq("session_id", sessionId);

        handleDbError(countError, "MessageRepository.listPreSession (count)");

        let query = supabase
            .from("pre_session_messages")
            .select("*, profiles!inner(*)")
            .eq("session_id", sessionId);

        query = applyPagination(query, params, "created_at");

        const { data, error } = await query;
        handleDbError(error, "MessageRepository.listPreSession");

        const limit = params.limit || 50;
        return {
            data: data || [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },

    async listLiveSession(
        sessionId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<SessionMessage>> {
        const supabase = await getServerClient();

        const { count, error: countError } = await supabase
            .from("live_session_messages")
            .select("id", { count: "exact", head: true })
            .eq("session_id", sessionId);

        handleDbError(countError, "MessageRepository.listLiveSession (count)");

        let query = supabase
            .from("live_session_messages")
            .select("*, profiles!inner(*)")
            .eq("session_id", sessionId);

        query = applyPagination(query, params, "created_at");

        const { data, error } = await query;
        handleDbError(error, "MessageRepository.listLiveSession");

        const limit = params.limit || 100;
        return {
            data: data || [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },
};
