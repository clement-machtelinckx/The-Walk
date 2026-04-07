import { NoteRepository } from "@/lib/repositories/note-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { PersonalNote, GroupNote } from "@/types/note";

export const NoteService = {
    /**
     * Résout la table_id à partir d'une session_id et vérifie l'appartenance.
     */
    async getTableContext(userId: string, sessionId: string) {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent accéder aux notes.");
        }

        return { tableId: session.table_id, role: membership.role };
    },

    /**
     * Note personnelle de table.
     */
    async getPersonalNote(userId: string, sessionId: string): Promise<PersonalNote | null> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        return await NoteRepository.getPersonalByTable(userId, tableId);
    },

    async updatePersonalNote(userId: string, sessionId: string, content: string): Promise<PersonalNote> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        return await NoteRepository.upsertPersonal(userId, tableId, content);
    },

    /**
     * Note de groupe de table.
     * MJ uniquement en édition (V1 Option B).
     * Lecture pour tous les membres.
     */
    async getGroupNote(userId: string, sessionId: string): Promise<GroupNote | null> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        return await NoteRepository.getGroupByTable(tableId);
    },

    async updateGroupNote(userId: string, sessionId: string, content: string): Promise<GroupNote> {
        const { tableId, role } = await this.getTableContext(userId, sessionId);
        
        if (role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut éditer la note de groupe.");
        }

        return await NoteRepository.upsertGroup(tableId, content);
    },
};
