import { getServerClient, getServiceRoleClient } from "@/lib/db";
import { applyPagination, handleDbError, PaginatedResult, PaginationParams } from "./_shared/base";
import type { CreateNotificationInput } from "@/lib/validators/notification";
import type { Notification } from "@/types/notification";

export interface NotificationListParams extends PaginationParams {
    unreadOnly?: boolean;
}

export const NotificationRepository = {
    async create(input: CreateNotificationInput): Promise<Notification> {
        const supabase = getServiceRoleClient();
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                user_id: input.user_id,
                type: input.type,
                title: input.title,
                body: input.body || null,
                resource_type: input.resource_type || null,
                resource_id: input.resource_id || null,
                href: input.href || null,
                data: input.data || null,
            })
            .select()
            .single();

        handleDbError(error, "NotificationRepository.create");
        return data;
    },

    async listByUser(
        userId: string,
        params: NotificationListParams = {},
    ): Promise<PaginatedResult<Notification>> {
        const supabase = await getServerClient();
        let countQuery = supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);

        if (params.unreadOnly) {
            countQuery = countQuery.eq("is_read", false);
        }

        const { count, error: countError } = await countQuery;
        handleDbError(countError, "NotificationRepository.listByUser (count)");

        let query = supabase.from("notifications").select("*").eq("user_id", userId);

        if (params.unreadOnly) {
            query = query.eq("is_read", false);
        }

        query = applyPagination(query, { ...params, ascending: false }, "created_at");

        const { data, error } = await query;
        handleDbError(error, "NotificationRepository.listByUser");

        const limit = params.limit || 20;
        return {
            data: data || [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },

    async countUnread(userId: string): Promise<number> {
        const supabase = await getServerClient();
        const { count, error } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        handleDbError(error, "NotificationRepository.countUnread");
        return count || 0;
    },

    async getById(id: string): Promise<Notification | null> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        handleDbError(error, "NotificationRepository.getById");
        return data;
    },

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("notifications")
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        handleDbError(error, "NotificationRepository.markAsRead");
        return data;
    },

    async markAllAsRead(userId: string): Promise<number> {
        const supabase = await getServerClient();
        const readAt = new Date().toISOString();
        const { data, error } = await supabase
            .from("notifications")
            .update({
                is_read: true,
                read_at: readAt,
            })
            .eq("user_id", userId)
            .eq("is_read", false)
            .select("id");

        handleDbError(error, "NotificationRepository.markAllAsRead");
        return data?.length || 0;
    },
};
