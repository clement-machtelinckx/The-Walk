import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NotificationEventService } from "@/lib/services/notifications/notification-event-service";
import { PresenceService } from "@/lib/services/presence/presence-service";
import { CreateSessionInput, UpdateSessionInput } from "@/lib/validators/session";
import { Session, PresenceSummary } from "@/types/session";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export interface SessionHistoryItem {
    session: Session;
    presenceSummary: PresenceSummary | null;
}

function notifyUpcomingSessionLater(userId: string, session: Session) {
    void NotificationEventService.notifyUpcomingSessionScheduled(userId, session).catch((error) => {
        console.error("[SESSION_SCHEDULED_NOTIFICATION]", error);
    });
}

function notifyLiveSessionStartedLater(userId: string, session: Session) {
    void NotificationEventService.notifySessionLiveStarted(userId, session).catch((error) => {
        console.error("[SESSION_LIVE_NOTIFICATION]", error);
    });
}

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

        const session = await SessionRepository.create({
            ...input,
            status: input.status || "scheduled",
        });

        notifyUpcomingSessionLater(userId, session);
        return session;
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

    /**
     * Start a session.
     * Only GM can start sessions.
     * Transition: scheduled -> active.
     */
    async startSession(userId: string, sessionId: string): Promise<Session> {
        const session = await SessionRepository.getById(sessionId);
        const membership = await MembershipService.requireMembership(userId, session.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut démarrer la session.");
        }

        if (session.status !== "scheduled") {
            throw new ValidationError(
                `Impossible de démarrer une session avec le statut : ${session.status}`,
            );
        }

        // Vérifier s'il y a déjà une session active sur cette table
        const activeSession = await SessionRepository.getActiveSessionByTable(session.table_id);
        if (activeSession) {
            throw new ValidationError("Une session est déjà en cours sur cette table.");
        }

        const updatedSession = await SessionRepository.update(sessionId, {
            status: "active",
            started_at: new Date().toISOString(),
        });

        notifyLiveSessionStartedLater(userId, updatedSession);
        return updatedSession;
    },

    /**
     * End a session.
     * Only GM can end sessions.
     * Transition: active -> completed.
     */
    async endSession(userId: string, sessionId: string): Promise<Session> {
        const session = await SessionRepository.getById(sessionId);
        const membership = await MembershipService.requireMembership(userId, session.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut terminer la session.");
        }

        if (session.status !== "active") {
            throw new ValidationError(
                `Impossible de terminer une session avec le statut : ${session.status}`,
            );
        }

        return await SessionRepository.update(sessionId, {
            status: "completed",
            ended_at: new Date().toISOString(),
        });
    },

    /**
     * Cancel a scheduled or active session without deleting its product history.
     * Only GM can cancel sessions.
     */
    async cancelSession(userId: string, sessionId: string): Promise<Session> {
        const session = await SessionRepository.getById(sessionId);
        const membership = await MembershipService.requireMembership(userId, session.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut annuler la session.");
        }

        if (session.status !== "scheduled" && session.status !== "active") {
            throw new ValidationError(
                `Impossible d'annuler une session avec le statut : ${session.status}`,
            );
        }

        return await SessionRepository.update(sessionId, {
            status: "cancelled",
            ended_at: new Date().toISOString(),
        });
    },

    /**
     * Delete only an empty scheduled session created by mistake.
     * Sessions with any product activity must be cancelled instead.
     */
    async deleteSession(userId: string, sessionId: string): Promise<void> {
        const session = await SessionRepository.getById(sessionId);
        const membership = await MembershipService.requireMembership(userId, session.table_id);

        if (membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut supprimer la session.");
        }

        if (session.status !== "scheduled") {
            throw new ValidationError("Seule une session planifiée peut être supprimée.");
        }

        const wasDeleted = await SessionRepository.deleteIfEmptyScheduled(sessionId);
        if (!wasDeleted) {
            throw new ValidationError(
                "Cette session contient déjà des réponses, notes ou messages. Annulez-la plutôt que de la supprimer.",
            );
        }
    },

    /**
     * Get the current active session for a table.
     * Must be a member of the table.
     */
    async getActiveSession(userId: string, tableId: string): Promise<Session | null> {
        await MembershipService.requireMembership(userId, tableId);
        return await SessionRepository.getActiveSessionByTable(tableId);
    },

    /**
     * Get history of completed sessions for a table.
     */
    async getSessionHistory(userId: string, tableId: string): Promise<SessionHistoryItem[]> {
        await MembershipService.requireMembership(userId, tableId);
        const sessions = await SessionRepository.getHistoricalSessions(tableId);

        const history = await Promise.all(
            sessions.map(async (session) => {
                let presenceSummary: PresenceSummary | null = null;
                try {
                    presenceSummary = await PresenceService.getPresenceSummary(userId, session.id);
                } catch (e) {
                    console.error(`Failed to fetch presence summary for session ${session.id}`, e);
                }
                return {
                    session,
                    presenceSummary,
                };
            }),
        );

        return history;
    },
};
