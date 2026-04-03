import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError } from "@/lib/errors";
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
            throw new ForbiddenError(`User ${userId} is not a member of table ${tableId}`);
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
};
