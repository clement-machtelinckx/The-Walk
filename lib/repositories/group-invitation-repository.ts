import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { GroupInvitation, TableRole } from "@/types/table";
import { randomUUID } from "crypto";

export const GroupInvitationRepository = {
    async create(
        tableId: string,
        role: TableRole,
        createdBy: string,
        expiresAt: string,
    ): Promise<GroupInvitation> {
        const supabase = await getServerClient();
        const token = randomUUID();

        const { data, error } = await supabase
            .from("table_group_invitations")
            .insert({
                table_id: tableId,
                role,
                token,
                created_by: createdBy,
                expires_at: expiresAt,
            })
            .select()
            .single();

        handleDbError(error, "GroupInvitationRepository.create");
        return data;
    },

    async getByToken(token: string): Promise<GroupInvitation | null> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("table_group_invitations")
            .select("*")
            .eq("token", token)
            .maybeSingle();

        handleDbError(error, "GroupInvitationRepository.getByToken");
        return data;
    },

    async listByTable(tableId: string): Promise<GroupInvitation[]> {
        const supabase = await getServerClient();
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
            .from("table_group_invitations")
            .select("*")
            .eq("table_id", tableId)
            .gt("expires_at", now)
            .order("created_at", { ascending: false });

        handleDbError(error, "GroupInvitationRepository.listByTable");
        return data || [];
    },

    async delete(id: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("table_group_invitations").delete().eq("id", id);

        handleDbError(error, "GroupInvitationRepository.delete");
    },
};
