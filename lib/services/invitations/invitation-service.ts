import { InvitationRepository } from "@/lib/repositories/invitation-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { TableRepository } from "@/lib/repositories/table-repository";
import { Invitation, Table } from "@/types/table";
import { CreateInvitationInput } from "@/lib/validators/invitation";
import { AppError, ForbiddenError, ValidationError } from "@/lib/errors";

export interface InvitationWithTable extends Invitation {
    tables: Pick<Table, "name" | "description">;
}

export const InvitationService = {
    /**
     * Create a new invitation for a table.
     * Restricts creation to GM of the table.
     */
    async create(userId: string, input: CreateInvitationInput): Promise<Invitation> {
        // 1. Check if user is MJ of the table
        const membership = await MembershipRepository.getByUserAndTable(userId, input.table_id);
        if (!membership || membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut inviter des joueurs.");
        }

        return await InvitationRepository.create(input, userId);
    },

    /**
     * Get an invitation by its token, including table details.
     */
    async getByToken(token: string): Promise<InvitationWithTable> {
        const invitation = await InvitationRepository.getByToken(token);

        // Ensure invitation is not already accepted or expired
        if (invitation.status === "accepted") {
            throw new ValidationError("Cette invitation a déjà été utilisée.");
        }

        const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
        if (invitation.status === "expired" || (expiresAt && expiresAt < new Date())) {
            if (invitation.status !== "expired") {
                await InvitationRepository.updateStatus(invitation.id, "expired");
            }
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
     * Accept an invitation and create a membership.
     */
    async accept(userId: string, token: string): Promise<{ tableId: string }> {
        // 1. Validate invitation
        const invitation = await InvitationRepository.getByToken(token);

        if (invitation.status !== "pending") {
            throw new ValidationError("Cette invitation n'est plus valide.");
        }

        const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
        if (expiresAt && expiresAt < new Date()) {
            await InvitationRepository.updateStatus(invitation.id, "expired");
            throw new ValidationError("Cette invitation a expiré.");
        }

        // 2. Check if already member
        const existingMembership = await MembershipRepository.getByUserAndTable(
            userId,
            invitation.table_id,
        );
        if (existingMembership) {
            await InvitationRepository.updateStatus(invitation.id, "accepted");
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

        // 4. Mark invitation as accepted
        await InvitationRepository.updateStatus(invitation.id, "accepted");

        return { tableId: invitation.table_id };
    },

    /**
     * List all invitations for a table.
     */
    async listByTable(userId: string, tableId: string): Promise<Invitation[]> {
        // Check if user is MJ
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        if (!membership || membership.role !== "gm") {
            throw new ForbiddenError("Accès refusé.");
        }

        return await InvitationRepository.listByTable(tableId);
    },

    /**
     * List all pending invitations for a specific user based on their email.
     */
    async listPendingForUser(email: string): Promise<InvitationWithTable[]> {
        return await InvitationRepository.listPendingByEmail(email);
    },
};
