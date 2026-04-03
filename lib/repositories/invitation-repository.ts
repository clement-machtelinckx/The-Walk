import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { NotFoundError } from "@/lib/errors";
import { Invitation } from "@/types/table";
import { CreateInvitationInput } from "@/lib/validators/invitation";

export const InvitationRepository = {
    async create(input: CreateInvitationInput, inviterId: string): Promise<Invitation> {
        const supabase = await getServerClient();

        // Generate a random token if not provided
        const token =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry by default

        const { data, error } = await supabase
            .from("invitations")
            .insert({
                ...input,
                inviter_id: inviterId,
                token,
                expires_at: expiresAt.toISOString(),
                status: "pending",
            })
            .select()
            .single();

        handleDbError(error, "InvitationRepository.create");
        return data;
    },

    async getByToken(token: string): Promise<Invitation> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Invitation", token);
        }
        handleDbError(error, "InvitationRepository.getByToken");
        return data;
    },

    async updateStatus(id: string, status: Invitation["status"]): Promise<void> {
        const supabase = await getServerClient();
        const { error } = await supabase.from("invitations").update({ status }).eq("id", id);

        handleDbError(error, "InvitationRepository.updateStatus");
    },

    async listByTable(tableId: string): Promise<Invitation[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("table_id", tableId);

        handleDbError(error, "InvitationRepository.listByTable");
        return data || [];
    },
};
