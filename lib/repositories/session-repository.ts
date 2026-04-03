import { getServerClient } from "@/lib/db";
import { handleDbError, applyPagination, PaginationParams, PaginatedResult } from "./_shared/base";
import { NotFoundError } from "@/lib/errors";
import { Session, SessionResponse } from "@/types/session";
import {
    CreateSessionInput,
    UpdateSessionInput,
    SessionResponseInput,
} from "@/lib/validators/session";

export const SessionRepository = {
    async create(input: CreateSessionInput): Promise<Session> {
        const supabase = await getServerClient();
        const { data, error } = await supabase.from("sessions").insert(input).select().single();

        handleDbError(error, "SessionRepository.create");
        return data;
    },

    async getById(id: string): Promise<Session> {
        const supabase = await getServerClient();
        const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Session", id);
        }
        handleDbError(error, "SessionRepository.getById");
        return data;
    },

    async update(id: string, updates: UpdateSessionInput): Promise<Session> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("sessions")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        handleDbError(error, "SessionRepository.update");
        return data;
    },

    async listByTable(
        tableId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<Session>> {
        const supabase = await getServerClient();

        const { count, error: countError } = await supabase
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .eq("table_id", tableId);

        handleDbError(countError, "SessionRepository.listByTable (count)");

        let query = supabase.from("sessions").select("*").eq("table_id", tableId);

        query = applyPagination(query, params, "scheduled_at");

        const { data, error } = await query;
        handleDbError(error, "SessionRepository.listByTable");

        const limit = params.limit || 20;
        return {
            data: data || [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },

    async getNextSession(tableId: string): Promise<Session | null> {
        const supabase = await getServerClient();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .eq("table_id", tableId)
            .eq("status", "scheduled")
            .gte("scheduled_at", now)
            .order("scheduled_at", { ascending: true })
            .limit(1)
            .maybeSingle();

        handleDbError(error, "SessionRepository.getNextSession");
        return data;
    },

    // Session Responses
    async upsertResponse(
        sessionId: string,
        userId: string,
        input: SessionResponseInput,
    ): Promise<SessionResponse> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_responses")
            .upsert({ session_id: sessionId, user_id: userId, status: input.status })
            .select()
            .single();

        handleDbError(error, "SessionRepository.upsertResponse");
        return data;
    },

    async listResponses(sessionId: string): Promise<SessionResponse[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_responses")
            .select("*, profiles!inner(*)")
            .eq("session_id", sessionId);

        handleDbError(error, "SessionRepository.listResponses");
        return data || [];
    },
};
