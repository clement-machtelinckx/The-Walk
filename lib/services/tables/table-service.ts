import { TableRepository } from "@/lib/repositories/table-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { Table, TableRole } from "@/types/table";
import { CreateTableInput } from "@/lib/validators/table";
import { Session } from "@/types/session";

export interface TableSummaryDTO {
    id: string;
    name: string;
    description: string | null;
    myRole: TableRole;
    nextSession: Session | null;
    activeSession: Session | null;
}

export interface TableDetailsDTO {
    table: Table;
    myRole: TableRole;
    nextSession: Session | null;
    activeSession: Session | null;
}

export const TableService = {
    /**
     * List all tables for a user with role and next session summary.
     */
    async listUserTables(userId: string): Promise<TableSummaryDTO[]> {
        const paginatedTables = await TableRepository.listByUserId(userId);

        const summaries = await Promise.all(
            paginatedTables.data.map(async (table) => {
                const membership = await MembershipService.getMembership(userId, table.id);
                const nextSession = await SessionRepository.getNextSession(table.id);
                const activeSession = await SessionRepository.getActiveSessionByTable(table.id);

                return {
                    id: table.id,
                    name: table.name,
                    description: table.description,
                    myRole: membership?.role || "player", // Fallback, though user should be member
                    nextSession,
                    activeSession,
                };
            }),
        );

        return summaries;
    },

    /**
     * Get details of a table for a specific user.
     * Ensures the user is a member.
     */
    async getTableDetails(userId: string, tableId: string): Promise<TableDetailsDTO> {
        const membership = await MembershipService.requireMembership(userId, tableId);
        const table = await TableRepository.getById(tableId);
        const nextSession = await SessionRepository.getNextSession(tableId);
        const activeSession = await SessionRepository.getActiveSessionByTable(tableId);

        return {
            table,
            myRole: membership.role,
            nextSession,
            activeSession,
        };
    },

    /**
     * Create a new table and set the creator as GM.
     */
    async createTable(userId: string, input: CreateTableInput): Promise<Table> {
        return await TableRepository.create(input, userId);
    },
};
