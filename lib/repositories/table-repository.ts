import { getServerClient } from "@/lib/db";
import { handleDbError, applyPagination, PaginationParams, PaginatedResult } from "./_shared/base";
import { NotFoundError } from "@/lib/errors";
import { Table, TableRole } from "@/types/table";
import { CreateTableInput, UpdateTableInput } from "@/lib/validators/table";

export const TableRepository = {
    async create(input: CreateTableInput, ownerId: string): Promise<Table> {
        const supabase = await getServerClient();

        // Start a transaction-like flow (though Supabase doesn't support complex transactions easily from JS)
        // We create the table and then add the owner as a GM membership
        const { data: table, error: tableError } = await supabase
            .from("tables")
            .insert({ ...input, owner_id: ownerId })
            .select()
            .single();

        handleDbError(tableError, "TableRepository.create (table)");

        const { error: memberError } = await supabase.from("table_memberships").insert({
            table_id: table.id,
            user_id: ownerId,
            role: "gm" as TableRole,
        });

        handleDbError(memberError, "TableRepository.create (membership)");

        return table;
    },

    async getById(id: string): Promise<Table> {
        const supabase = await getServerClient();
        const { data, error } = await supabase.from("tables").select("*").eq("id", id).single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Table", id);
        }
        handleDbError(error, "TableRepository.getById");
        return data;
    },

    async update(id: string, updates: UpdateTableInput): Promise<Table> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("tables")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        handleDbError(error, "TableRepository.update");
        return data;
    },

    async delete(id: string): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("tables").delete().eq("id", id);

        handleDbError(error, "TableRepository.delete");
    },

    async listByUserId(
        userId: string,
        params: PaginationParams = {},
    ): Promise<PaginatedResult<Table>> {
        const supabase = await getServerClient();

        // Count total
        const { count, error: countError } = await supabase
            .from("table_memberships")
            .select("table_id", { count: "exact", head: true })
            .eq("user_id", userId);

        handleDbError(countError, "TableRepository.listByUserId (count)");

        // Get tables where user is a member
        let query = supabase
            .from("tables")
            .select("*, table_memberships!inner(user_id)")
            .eq("table_memberships.user_id", userId);

        query = applyPagination(query, params);

        const { data, error } = await query;
        handleDbError(error, "TableRepository.listByUserId");

        const limit = params.limit || 20;
        return {
            data: data || [],
            total: count || 0,
            page: params.page || 1,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    },
};
