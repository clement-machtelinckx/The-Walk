import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { TableRole, TableMember } from "@/types/table";
import { Profile } from "@/lib/repositories/profile-repository";

export interface TableMemberDTO {
    userId: string;
    role: TableRole;
    joinedAt: string;
    profile: Profile;
}

// Internal type for repository result with joined profile
interface MembershipWithProfile extends TableMember {
    profiles: Profile;
}

export const MembershipService = {
    /**
     * Get the membership of a user in a table.
     */
    async getMembership(userId: string, tableId: string) {
        return await MembershipRepository.getByUserAndTable(userId, tableId);
    },

    /**
     * Check if a user is a member of a table.
     */
    async isMember(userId: string, tableId: string): Promise<boolean> {
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        return !!membership;
    },

    /**
     * Ensure a user is a member of a table, or throw ForbiddenError.
     */
    async requireMembership(userId: string, tableId: string) {
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        if (!membership) {
            throw new ForbiddenError(`L'utilisateur n'est pas membre de cette table.`);
        }
        return membership;
    },

    /**
     * List all members of a table with their profiles.
     */
    async listMembers(tableId: string): Promise<TableMemberDTO[]> {
        const memberships = (await MembershipRepository.listByTable(
            tableId,
        )) as unknown as MembershipWithProfile[];

        return memberships.map((m) => ({
            userId: m.user_id,
            role: m.role,
            joinedAt: m.joined_at,
            profile: m.profiles,
        }));
    },

    /**
     * Allow a user to leave a table.
     * Logic:
     * - Must be a member.
     * - If GM, must not be the last GM.
     */
    async leaveTable(userId: string, tableId: string): Promise<void> {
        const membership = await this.requireMembership(userId, tableId);

        if (membership.role === "gm") {
            const gmCount = await MembershipRepository.countGmsByTable(tableId);
            if (gmCount <= 1) {
                throw new ValidationError(
                    "Vous êtes le dernier Maître du Jeu. Nommez un autre MJ avant de quitter ou supprimez la table.",
                );
            }
        }

        await MembershipRepository.remove(tableId, userId);
    },

    /**
     * Allow a GM to remove a member from a table.
     * Logic:
     * - Actor must be GM.
     * - Target must be a member.
     * - Cannot remove another GM (V1 simplification).
     */
    async removeMember(actorId: string, tableId: string, targetId: string): Promise<void> {
        // 1. Check actor permissions
        const actorMembership = await this.requireMembership(actorId, tableId);
        if (actorMembership.role !== "gm") {
            throw new ForbiddenError("Seul un Maître du Jeu peut retirer des membres.");
        }

        // 2. Check target membership
        const targetMembership = await MembershipRepository.getByUserAndTable(targetId, tableId);
        if (!targetMembership) {
            throw new ValidationError("L'utilisateur cible n'est plus membre de cette table.");
        }

        // 3. Security rules V1
        if (targetMembership.role === "gm") {
            throw new ForbiddenError("Vous ne pouvez pas retirer un autre Maître du Jeu.");
        }

        // 4. Remove
        await MembershipRepository.remove(tableId, targetId);
    },
};
