import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { CreateSessionInput, UpdateSessionInput } from "@/lib/validators/session";
import { Session } from "@/types/session";
import { ForbiddenError } from "@/lib/errors";

export const SessionService = {
    /**
     * Create a new session for a table.
     * Only GM can create sessions.
     */
    async createSession(userId: string, input: CreateSessionInput): Promise<Session> {
        const membership = await MembershipService.requireMembership(userId, input.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut créer des sessions.");
        }

        return await SessionRepository.create({
            ...input,
            status: input.status || "scheduled",
        });
    },

    /**
     * Update an existing session.
     * Only GM can update sessions.
     */
    async updateSession(
        userId: string,
        sessionId: string,
        updates: UpdateSessionInput,
    ): Promise<Session> {
        const session = await SessionRepository.getById(sessionId);
        const membership = await MembershipService.requireMembership(userId, session.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut modifier les sessions.");
        }

        return await SessionRepository.update(sessionId, updates);
    },

    /**
     * Get the next scheduled session for a table.
     * Must be a member of the table.
     */
    async getNextSession(userId: string, tableId: string): Promise<Session | null> {
        await MembershipService.requireMembership(userId, tableId);
        return await SessionRepository.getNextSession(tableId);
    },

    /**
     * Get session by ID.
     * Must be a member of the table.
     */
    async getSessionById(userId: string, sessionId: string): Promise<Session> {
        const session = await SessionRepository.getById(sessionId);
        await MembershipService.requireMembership(userId, session.table_id);
        return session;
    },
};
