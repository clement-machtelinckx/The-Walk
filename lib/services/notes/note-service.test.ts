import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoteService } from "./note-service";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { NoteRepository } from "@/lib/repositories/note-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { ConflictError } from "@/lib/errors";
import { GroupNote } from "@/types/note";

vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/note-repository");
vi.mock("@/lib/repositories/session-repository");

describe("NoteService", () => {
    const userId = "user-123";
    const tableId = "table-123";
    const sessionId = "session-123";
    const loadedUpdatedAt = "2026-01-01T10:00:00.000Z";

    const groupNote: GroupNote = {
        id: "note-123",
        table_id: tableId,
        session_id: null,
        content: "Version chargée",
        created_at: "2026-01-01T09:00:00.000Z",
        updated_at: loadedUpdatedAt,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
        });
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-123",
            table_id: tableId,
            user_id: userId,
            role: "player",
            joined_at: "2026-01-01T08:00:00.000Z",
        });
    });

    it("enregistre la note de groupe quand la version chargée est toujours courante", async () => {
        const updatedNote = {
            ...groupNote,
            content: "Nouvelle version",
            updated_at: "2026-01-01T10:05:00.000Z",
        };

        vi.mocked(NoteRepository.getGroupByTable).mockResolvedValue(groupNote);
        vi.mocked(NoteRepository.updateGroupIfVersionMatches).mockResolvedValue(updatedNote);

        const result = await NoteService.updateGroupNote(
            userId,
            sessionId,
            "Nouvelle version",
            loadedUpdatedAt,
        );

        expect(result).toEqual(updatedNote);
        expect(NoteRepository.updateGroupIfVersionMatches).toHaveBeenCalledWith(
            tableId,
            "Nouvelle version",
            loadedUpdatedAt,
        );
    });

    it("refuse d'écraser la note de groupe si la version distante a changé", async () => {
        vi.mocked(NoteRepository.getGroupByTable).mockResolvedValue({
            ...groupNote,
            content: "Version distante plus récente",
            updated_at: "2026-01-01T10:10:00.000Z",
        });

        await expect(
            NoteService.updateGroupNote(userId, sessionId, "Brouillon local", loadedUpdatedAt),
        ).rejects.toThrow(ConflictError);

        expect(NoteRepository.updateGroupIfVersionMatches).not.toHaveBeenCalled();
    });
});
