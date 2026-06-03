import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceService } from "./presence-service";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { PresenceRepository } from "@/lib/repositories/presence-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/presence-repository");
vi.mock("@/lib/repositories/session-repository");

describe("PresenceService", () => {
    const userId = "user-123";
    const tableId = "table-123";
    const sessionId = "session-123";

    type SessionById = Awaited<ReturnType<typeof SessionRepository.getById>>;
    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type TableMembers = Awaited<ReturnType<typeof MembershipRepository.listByTable>>;
    type Presences = Awaited<ReturnType<typeof PresenceRepository.listBySession>>;
    type Responses = Awaited<ReturnType<typeof SessionRepository.listResponses>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
            status: "active",
        } as SessionById);
    });

    it("builds a sorted roll call from saved presence and RSVP defaults", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(MembershipRepository.listByTable).mockResolvedValue([
            {
                user_id: "user-b",
                profiles: { display_name: "Zoé", avatar_url: null, avatar_key: null },
            },
            {
                user_id: "user-a",
                profiles: {
                    display_name: "Alice",
                    avatar_url: "alice.png",
                    avatar_key: "mage_drow_dark",
                },
            },
        ] as TableMembers);
        vi.mocked(PresenceRepository.listBySession).mockResolvedValue([
            { user_id: "user-b", status: "late" },
        ] as Presences);
        vi.mocked(SessionRepository.listResponses).mockResolvedValue([
            { user_id: "user-a", status: "going" },
        ] as Responses);

        const rollCall = await PresenceService.getRollCall(userId, sessionId);

        expect(rollCall).toEqual([
            {
                user_id: "user-a",
                display_name: "Alice",
                avatar_url: "alice.png",
                avatar_key: "mage_drow_dark",
                status: "present",
                rsvp_status: "going",
            },
            {
                user_id: "user-b",
                display_name: "Zoé",
                avatar_url: null,
                avatar_key: null,
                status: "late",
                rsvp_status: undefined,
            },
        ]);
    });

    it("refuses roll call access to users outside the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(PresenceService.getRollCall(userId, sessionId)).rejects.toThrow(
            ForbiddenError,
        );
        expect(PresenceRepository.listBySession).not.toHaveBeenCalled();
    });

    it("allows a GM to save roll call during an active session", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            role: "gm",
        } as Membership);

        await PresenceService.saveRollCall(userId, sessionId, {
            presences: [{ user_id: "user-a", status: "present" }],
        });

        expect(PresenceRepository.upsertBulk).toHaveBeenCalledWith(sessionId, {
            presences: [{ user_id: "user-a", status: "present" }],
        });
    });

    it("refuses roll call saves outside active sessions", async () => {
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
            status: "scheduled",
        } as SessionById);

        await expect(
            PresenceService.saveRollCall(userId, sessionId, {
                presences: [{ user_id: "user-a", status: "present" }],
            }),
        ).rejects.toThrow(ValidationError);

        expect(PresenceRepository.upsertBulk).not.toHaveBeenCalled();
    });

    it("refuses roll call saves from non-GM members", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            role: "player",
        } as Membership);

        await expect(
            PresenceService.saveRollCall(userId, sessionId, {
                presences: [{ user_id: "user-a", status: "present" }],
            }),
        ).rejects.toThrow(ForbiddenError);

        expect(PresenceRepository.upsertBulk).not.toHaveBeenCalled();
    });

    it("summarizes roll call statuses", async () => {
        vi.spyOn(PresenceService, "getRollCall").mockResolvedValue([
            {
                user_id: "a",
                display_name: "A",
                avatar_url: null,
                avatar_key: null,
                status: "present",
            },
            { user_id: "b", display_name: "B", avatar_url: null, avatar_key: null, status: "late" },
            {
                user_id: "c",
                display_name: "C",
                avatar_url: null,
                avatar_key: null,
                status: "absent",
            },
        ]);

        const summary = await PresenceService.getPresenceSummary(userId, sessionId);

        expect(summary).toEqual({
            present: 1,
            late: 1,
            absent: 1,
            total: 3,
        });
    });
});
