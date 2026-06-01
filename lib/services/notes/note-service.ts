import { NoteRepository } from "@/lib/repositories/note-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ConflictError, DatabaseError, ForbiddenError, NotFoundError } from "@/lib/errors";
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

    async updatePersonalNote(
        userId: string,
        sessionId: string,
        content: string,
    ): Promise<PersonalNote> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        return await NoteRepository.upsertPersonal(userId, tableId, content);
    },

    /**
     * Note de groupe de table.
     * Lecture et édition explicite pour tous les membres.
     */
    async getGroupNote(userId: string, sessionId: string): Promise<GroupNote | null> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        return await NoteRepository.getGroupByTable(tableId);
    },

    async updateGroupNote(
        userId: string,
        sessionId: string,
        content: string,
        expectedUpdatedAt: string | null,
    ): Promise<GroupNote> {
        const { tableId } = await this.getTableContext(userId, sessionId);
        const currentNote = await NoteRepository.getGroupByTable(tableId);

        if (!currentNote) {
            if (expectedUpdatedAt !== null) {
                throw new ConflictError(
                    "La note de groupe a changé depuis votre chargement. Rechargez la dernière version avant d'enregistrer.",
                    { currentNote },
                );
            }

            try {
                return await NoteRepository.createGroup(tableId, content);
            } catch (error) {
                if (!(error instanceof DatabaseError)) {
                    throw error;
                }

                throw new ConflictError(
                    "La note de groupe a été créée entre-temps. Rechargez la dernière version avant d'enregistrer.",
                );
            }
        }

        if (expectedUpdatedAt !== currentNote.updated_at) {
            throw new ConflictError(
                "La note de groupe a changé depuis votre chargement. Rechargez la dernière version avant d'enregistrer.",
                { currentNote },
            );
        }

        const versionToUpdate = currentNote.updated_at;
        const updatedNote = await NoteRepository.updateGroupIfVersionMatches(
            tableId,
            content,
            versionToUpdate,
        );

        if (!updatedNote) {
            throw new ConflictError(
                "La note de groupe a changé pendant l'enregistrement. Rechargez la dernière version avant de réessayer.",
                { currentNote: await NoteRepository.getGroupByTable(tableId) },
            );
        }

        return updatedNote;
    },
};
