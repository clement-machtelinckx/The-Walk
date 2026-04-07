import { PresenceRepository } from "@/lib/repositories/presence-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { RollCallInput } from "@/lib/validators/presence";
import { RollCallMember, PresenceSummary, PresenceStatus } from "@/types/session";

export const PresenceService = {
    /**
     * Récupère l'état actuel de l'appel pour une session.
     * Si aucune présence n'est enregistrée, pré-remplit à partir des RSVP.
     */
    async getRollCall(userId: string, sessionId: string): Promise<RollCallMember[]> {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent voir la présence.");
        }

        const members = await MembershipRepository.listByTable(session.table_id);
        const existingPresences = await PresenceRepository.listBySession(sessionId);
        const rsvps = await SessionRepository.listResponses(sessionId);

        const presenceMap = new Map(existingPresences.map((p) => [p.user_id, p.status]));
        const rsvpMap = new Map(rsvps.map((r) => [r.user_id, r.status]));

        const rollCall = members.map((member) => {
            const userId = member.user_id;
            const rsvpStatus = rsvpMap.get(userId);

            // Logique de statut par défaut :
            // 1. Statut déjà enregistré en base
            // 2. Si RSVP "going" -> "present" par défaut
            // 3. Sinon -> "absent" par défaut (ou neutre selon préférence, ici absent pour forcer l'appel)
            let status = presenceMap.get(userId);
            if (!status) {
                status = rsvpStatus === "going" ? "present" : "absent";
            }

            return {
                user_id: userId,
                display_name: member.profiles.display_name,
                avatar_url: member.profiles.avatar_url,
                status: status as PresenceStatus,
                rsvp_status: rsvpStatus,
            };
        });

        // Tri par nom d'affichage
        return rollCall.sort((a, b) =>
            (a.display_name || "").localeCompare(b.display_name || "", "fr"),
        );
    },

    /**
     * Enregistre l'appel pour une session.
     * MJ uniquement.
     */
    async saveRollCall(userId: string, sessionId: string, input: RollCallInput): Promise<void> {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership || membership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut faire l'appel.");
        }

        await PresenceRepository.upsertBulk(sessionId, input);
    },

    /**
     * Calcule un résumé de présence pour l'affichage rapide.
     */
    async getPresenceSummary(userId: string, sessionId: string): Promise<PresenceSummary> {
        const rollCall = await this.getRollCall(userId, sessionId);

        const summary: PresenceSummary = {
            present: 0,
            late: 0,
            absent: 0,
            total: rollCall.length,
        };

        rollCall.forEach((member) => {
            if (member.status in summary) {
                summary[member.status as keyof Omit<PresenceSummary, "total">]++;
            }
        });

        return summary;
    },
};
