import { getServerClient, getServiceRoleClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { GroupInvitation, Table, TableRole } from "@/types/table";
import { randomUUID } from "crypto";
import { NotFoundError } from "@/lib/errors";

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
        const supabase = getServiceRoleClient();
        const { data, error } = await supabase
            .from("table_group_invitations")
            .select("*")
            .eq("token", token)
            .maybeSingle();

        handleDbError(error, "GroupInvitationRepository.getByToken");
        return data;
    },

    async getTableInfoForInvitation(tableId: string): Promise<Pick<Table, "name" | "description">> {
        const supabase = getServiceRoleClient();
        const { data, error } = await supabase
            .from("tables")
            .select("name, description")
            .eq("id", tableId)
            .single();

        handleDbError(error, "GroupInvitationRepository.getTableInfoForInvitation");
        if (!data) {
            throw new NotFoundError("Table", tableId);
        }
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
