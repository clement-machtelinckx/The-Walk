import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { TableMember, TableRole } from "@/types/table";

export const MembershipRepository = {
    async getByUserAndTable(userId: string, tableId: string): Promise<TableMember | null> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("table_memberships")
            .select("*")
            .eq("user_id", userId)
            .eq("table_id", tableId)
            .maybeSingle();

        handleDbError(error, "MembershipRepository.getByUserAndTable");
        return data;
    },

    async listByTable(tableId: string): Promise<TableMember[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("table_memberships")
            .select("*, profiles!inner(*)")
            .eq("table_id", tableId);

        handleDbError(error, "MembershipRepository.listByTable");
        return data || [];
    },

    async updateRole(tableId: string, userId: string, role: TableRole): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("table_memberships")
            .update({ role })
            .eq("table_id", tableId)
            .eq("user_id", userId);

        handleDbError(error, "MembershipRepository.updateRole");
    },

    async remove(tableId: string, userId: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase
            .from("table_memberships")
            .delete()
            .eq("table_id", tableId)
            .eq("user_id", userId);

        handleDbError(error, "MembershipRepository.remove");
    },

    async countGmsByTable(tableId: string): Promise<number> {
        const supabase = await getServerClient();
        const { count, error } = await supabase
            .from("table_memberships")
            .select("*", { count: "exact", head: true })
            .eq("table_id", tableId)
            .eq("role", "gm");

        handleDbError(error, "MembershipRepository.countGmsByTable");
        return count || 0;
    },
};
