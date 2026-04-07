import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { SessionResponseInput } from "@/lib/validators/session";
import {
    SessionResponse,
    SessionResponsesSummary,
    SessionResponseWithProfile,
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
        // 1. Récupérer la session
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        // 2. Vérifier que l'utilisateur est membre de la table
        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent voir les réponses.");
        }

        // 3. Récupérer toutes les réponses avec profils
        // Note: Repository.listResponses needs casting or explicit return type
        const responses = (await SessionRepository.listResponses(
            sessionId,
        )) as SessionResponseWithProfile[];

        // 4. Récupérer tous les membres de la table pour trouver les non-répondants
        const allMembers = await MembershipRepository.listByTable(session.table_id);

        // 5. Calculer le résumé
        const summary = {
            going: 0,
            maybe: 0,
            declined: 0,
            pending: 0,
            total: allMembers.length,
        };

        const respondedUserIds = new Set(responses.map((r) => r.user_id));

        responses.forEach((r) => {
            if (r.status in summary) {
                summary[r.status as keyof typeof summary]++;
            }
        });

        // 6. Identifier les non-répondants (membres qui n'ont pas de réponse ou réponse "pending")
        // En base, on peut avoir "pending" ou pas de ligne du tout.
        // On considère ici les membres sans ligne comme "pending" implicite.
        const non_responders = allMembers
            .filter((m) => !respondedUserIds.has(m.user_id))
            .map((m) => ({
                id: m.profiles.id,
                display_name: m.profiles.display_name,
                avatar_url: m.profiles.avatar_url,
            }));

        // Ajouter aussi ceux qui ont explicitement mis "pending" si ça arrive
        const explicitPending = responses
            .filter((r) => r.status === "pending")
            .map((r) => ({
                id: r.profiles.id,
                display_name: r.profiles.display_name,
                avatar_url: r.profiles.avatar_url,
            }));

        const finalNonResponders = [...non_responders, ...explicitPending];
        summary.pending = finalNonResponders.length;

        return {
            responses,
            summary,
            non_responders: finalNonResponders,
        };
    },
};
