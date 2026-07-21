import { TableRepository } from "@/lib/repositories/table-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { Table, TableRole } from "@/types/table";
import { CreateTableInput } from "@/lib/validators/table";
import { Session } from "@/types/session";
import { ForbiddenError, ValidationError } from "@/lib/errors";

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

interface TableSessionSummary {
    nextSession: Session | null;
    activeSession: Session | null;
}

function shouldUseAsNextSession(candidate: Session, current: Session | null): boolean {
    if (!current) {
        return true;
    }

    if (!candidate.scheduled_at) {
        return false;
    }

    if (!current.scheduled_at) {
        return true;
    }

    return candidate.scheduled_at < current.scheduled_at;
}

function groupSummarySessions(sessions: Session[]): Map<string, TableSessionSummary> {
    const summaries = new Map<string, TableSessionSummary>();

    for (const session of sessions) {
        const summary = summaries.get(session.table_id) || {
            nextSession: null,
            activeSession: null,
        };

        if (session.status === "active" && !summary.activeSession) {
            summary.activeSession = session;
        }

        if (
            session.status === "scheduled" &&
            shouldUseAsNextSession(session, summary.nextSession)
        ) {
            summary.nextSession = session;
        }

        summaries.set(session.table_id, summary);
    }

    return summaries;
}

export const TableService = {
    /**
     * List all tables for a user with role and next session summary.
     * Uses one table query and one grouped session query, regardless of table count.
     */
    async listUserTables(userId: string): Promise<TableSummaryDTO[]> {
        const tables = await TableRepository.listSummariesByUserId(userId);

        if (tables.length === 0) {
            return [];
        }

        const sessions = await SessionRepository.listSummarySessionsByTableIds(
            tables.map((table) => table.id),
        );
        const sessionsByTable = groupSummarySessions(sessions);

        return tables.map((table) => {
            const summary = sessionsByTable.get(table.id);

            return {
                id: table.id,
                name: table.name,
                description: table.description,
                myRole: table.myRole,
                nextSession: summary?.nextSession || null,
                activeSession: summary?.activeSession || null,
            };
        });
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

    /**
     * Delete a table and all table-scoped data through database cascades.
     * Allowed for the owner only. Active sessions must be ended/cancelled first.
     */
    async deleteTable(userId: string, tableId: string): Promise<void> {
        const table = await TableRepository.getById(tableId);

        const canDelete = table.owner_id === userId;
        if (!canDelete) {
            throw new ForbiddenError("Seul le propriétaire peut supprimer cette table.");
        }

        const activeSession = await SessionRepository.getActiveSessionByTable(tableId);
        if (activeSession) {
            throw new ValidationError(
                "Une session est en cours. Clôturez-la ou annulez-la avant de supprimer la table.",
            );
        }

        await TableRepository.delete(tableId);
    },
};
