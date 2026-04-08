import { GroupInvitationRepository } from "@/lib/repositories/group-invitation-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { TableRepository } from "@/lib/repositories/table-repository";
import { GroupInvitation, Table, TableRole } from "@/types/table";
import { AppError, ForbiddenError, ValidationError } from "@/lib/errors";

export interface GroupInvitationWithTable extends GroupInvitation {
    tables: Pick<Table, "name" | "description">;
}

export const GroupInvitationService = {
    /**
     * Create a new group invitation for a table.
     * Restricts creation to GM of the table.
     */
    async create(
        userId: string,
        tableId: string,
        role: TableRole,
        durationHours: number,
    ): Promise<GroupInvitation> {
        // 1. Check if user is MJ of the table
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        if (!membership || membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut générer des liens d'invitation.");
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);

        return await GroupInvitationRepository.create(
            tableId,
            role,
            userId,
            expiresAt.toISOString(),
        );
    },

    /**
     * Get a group invitation by its token, including table details.
     */
    async getByToken(token: string): Promise<GroupInvitationWithTable> {
        const invitation = await GroupInvitationRepository.getByToken(token);

        if (!invitation) {
            throw new ValidationError("L'invitation est introuvable.");
        }

        const expiresAt = new Date(invitation.expires_at);
        if (expiresAt < new Date()) {
            throw new ValidationError("Cette invitation a expiré.");
        }

        // Fetch table details
        const table = await TableRepository.getById(invitation.table_id);

        return {
            ...invitation,
            tables: {
                name: table.name,
                description: table.description,
            },
        };
    },

    /**
     * Accept a group invitation and create a membership.
     */
    async accept(userId: string, token: string): Promise<{ tableId: string }> {
        // 1. Validate invitation
        const invitation = await GroupInvitationRepository.getByToken(token);

        if (!invitation) {
            throw new ValidationError("L'invitation est introuvable.");
        }

        const expiresAt = new Date(invitation.expires_at);
        if (expiresAt < new Date()) {
            throw new ValidationError("Cette invitation a expiré.");
        }

        // 2. Check if already member
        const existingMembership = await MembershipRepository.getByUserAndTable(
            userId,
            invitation.table_id,
        );
        if (existingMembership) {
            return { tableId: invitation.table_id };
        }

        // 3. Create membership
        const supabase = await (await import("@/lib/db")).getServerClient();
        const { error: memberError } = await supabase.from("table_memberships").insert({
            table_id: invitation.table_id,
            user_id: userId,
            role: invitation.role,
        });

        if (memberError) {
            throw new AppError("Erreur lors de la création de l'adhésion.", "DATABASE_ERROR", 500);
        }

        return { tableId: invitation.table_id };
    },

    /**
     * List all active group invitations for a table.
     */
    async listByTable(userId: string, tableId: string): Promise<GroupInvitation[]> {
        // Check if user is MJ
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        if (!membership || membership.role !== "gm") {
            throw new ForbiddenError("Accès refusé.");
        }

        return await GroupInvitationRepository.listByTable(tableId);
    },
};
