import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { SessionResponseInput } from "@/lib/validators/session";
import {
    SessionResponse,
    SessionResponsesSummary,
} from "@/types/session";

export const ResponseService = {
    /**
     * Enregistrer ou mettre à jour la réponse d'un joueur.
     */
    async respondToSession(
        userId: string,
        sessionId: string,
        input: SessionResponseInput,
    ): Promise<SessionResponse> {
        // 1. Récupérer la session pour connaître la table
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        // 2. Vérifier que l'utilisateur est membre de la table
        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError(
                "Seuls les membres de la table peuvent répondre à une session.",
            );
        }

        // 3. Upsert de la réponse
        return await SessionRepository.upsertResponse(sessionId, userId, input);
    },

    /**
     * Récupérer les réponses et le récapitulatif d'une session.
     */
    async getSessionResponses(userId: string, sessionId: string): Promise<SessionResponsesSummary> {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent voir les réponses.");
        }

        const allResponses = await SessionRepository.listResponses(sessionId);
        const allMembers = await MembershipRepository.listByTable(session.table_id);

        // Filtrer les réponses actives (non-pending)
        const activeResponses = allResponses.filter((r) => r.status !== "pending");
        const respondedUserIds = new Set(activeResponses.map((r) => r.user_id));

        const summary = {
            going: activeResponses.filter((r) => r.status === "going").length,
            maybe: activeResponses.filter((r) => r.status === "maybe").length,
            declined: activeResponses.filter((r) => r.status === "declined").length,
            pending: 0, // Sera calculé ci-dessous
            total: allMembers.length,
        };

        // Les non-répondants sont les membres sans réponse active
        const non_responders = allMembers
            .filter((m) => !respondedUserIds.has(m.user_id))
            .map((m) => ({
                id: m.profiles.id,
                display_name: m.profiles.display_name,
                avatar_url: m.profiles.avatar_url,
            }));

        summary.pending = non_responders.length;

        return {
            responses: activeResponses,
            summary,
            non_responders,
        };
    },
};
