import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/lib/errors";
import { InitiativeRepository } from "@/lib/repositories/initiative-repository";
import { PresenceRepository } from "@/lib/repositories/presence-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { DiceService } from "@/lib/services/dice/dice-service";
import { InitiativeService } from "@/lib/services/initiative/initiative-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NotificationEventService } from "@/lib/services/notifications/notification-event-service";
import type { InitiativeEntry } from "@/types/initiative";

vi.mock("@/lib/repositories/initiative-repository");
vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/presence-repository");
vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/services/dice/dice-service");
vi.mock("@/lib/services/memberships/membership-service");
vi.mock("@/lib/services/notifications/notification-event-service");

describe("InitiativeService", () => {
    const gmId = "00000000-0000-4000-8000-000000000001";
    const playerA = "00000000-0000-4000-8000-000000000002";
    const playerB = "00000000-0000-4000-8000-000000000003";
    const observerId = "00000000-0000-4000-8000-000000000004";
    const sessionId = "00000000-0000-4000-8000-000000000005";
    const tableId = "00000000-0000-4000-8000-000000000006";

    const member = (userId: string, role: "gm" | "player" | "observer") => ({
        userId,
        role,
        joinedAt: new Date().toISOString(),
        profile: {
            id: userId,
            email: `${userId}@example.com`,
            display_name: userId,
            avatar_url: null,
            avatar_key: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    });

    const entry = (updates: Partial<InitiativeEntry> = {}): InitiativeEntry => ({
        id: "00000000-0000-4000-8000-000000000010",
        session_id: sessionId,
        table_id: tableId,
        participant_type: "member",
        user_id: playerA,
        label: null,
        initiative_score: null,
        initiative_modifier: 0,
        initiative_requested_at: null,
        position: 0,
        last_roll_id: null,
        created_by: gmId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
            status: "active",
        } as Awaited<ReturnType<typeof SessionRepository.getById>>);
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "gm",
        } as Awaited<ReturnType<typeof MembershipService.requireMembership>>);
        vi.mocked(MembershipService.listMembers).mockResolvedValue([]);
        vi.mocked(PresenceRepository.listBySession).mockResolvedValue([]);
        vi.mocked(InitiativeRepository.listEntries).mockResolvedValue([]);
        vi.mocked(InitiativeRepository.getState).mockResolvedValue(null);
        vi.mocked(NotificationEventService.notifyInitiativeRequested).mockResolvedValue();
    });

    it("requests initiative only from present players when presence exists", async () => {
        vi.mocked(MembershipService.listMembers).mockResolvedValue([
            member(gmId, "gm"),
            member(playerA, "player"),
            member(playerB, "player"),
            member(observerId, "observer"),
        ]);
        vi.mocked(PresenceRepository.listBySession).mockResolvedValue([
            { user_id: playerA, status: "present" },
            { user_id: playerB, status: "absent" },
        ] as Awaited<ReturnType<typeof PresenceRepository.listBySession>>);

        await InitiativeService.executeAction(gmId, sessionId, { action: "request" });

        expect(InitiativeRepository.addMemberEntries).toHaveBeenCalledWith(
            sessionId,
            tableId,
            [playerA],
            gmId,
            0,
        );
        expect(InitiativeRepository.requestMemberInitiative).toHaveBeenCalledWith(
            sessionId,
            [playerA],
            expect.any(String),
        );
        expect(NotificationEventService.notifyInitiativeRequested).toHaveBeenCalledWith(
            expect.objectContaining({ id: sessionId }),
            [playerA],
        );
    });

    it("falls back to every table player when no present player exists", async () => {
        vi.mocked(MembershipService.listMembers).mockResolvedValue([
            member(gmId, "gm"),
            member(playerA, "player"),
            member(playerB, "player"),
            member(observerId, "observer"),
        ]);

        await InitiativeService.executeAction(gmId, sessionId, { action: "request" });

        expect(InitiativeRepository.addMemberEntries).toHaveBeenCalledWith(
            sessionId,
            tableId,
            [playerA, playerB],
            gmId,
            0,
        );
    });

    it("lets a requested player roll server-side and stores the initiative result", async () => {
        const playerEntry = entry({ initiative_requested_at: new Date().toISOString() });
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Awaited<ReturnType<typeof MembershipService.requireMembership>>);
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(playerEntry);
        vi.mocked(DiceService.createRoll).mockResolvedValue({
            id: "00000000-0000-4000-8000-000000000011",
            total: 17,
        } as Awaited<ReturnType<typeof DiceService.createRoll>>);
        vi.mocked(InitiativeRepository.listEntries).mockResolvedValue([
            entry({ initiative_score: 17, initiative_modifier: 3 }),
        ]);

        await InitiativeService.executeAction(playerA, sessionId, {
            action: "roll",
            entry_id: playerEntry.id,
            modifier: 3,
        });

        expect(DiceService.createRoll).toHaveBeenCalledWith(
            playerA,
            expect.objectContaining({
                dice_type: 20,
                quantity: 1,
                modifier: 3,
                roll_kind: "initiative",
            }),
        );
        expect(InitiativeRepository.updateEntry).toHaveBeenCalledWith(
            playerEntry.id,
            expect.objectContaining({
                initiative_score: 17,
                initiative_modifier: 3,
            }),
        );
    });

    it("refuses a player rolling another member's entry", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Awaited<ReturnType<typeof MembershipService.requireMembership>>);
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(entry({ user_id: playerB }));

        await expect(
            InitiativeService.executeAction(playerA, sessionId, {
                action: "roll",
                entry_id: entry().id,
                modifier: 2,
            }),
        ).rejects.toThrow(ForbiddenError);

        expect(DiceService.createRoll).not.toHaveBeenCalled();
    });

    it("refuses a player entry that was not targeted by a request", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Awaited<ReturnType<typeof MembershipService.requireMembership>>);
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(entry());

        await expect(
            InitiativeService.executeAction(playerA, sessionId, {
                action: "roll",
                entry_id: entry().id,
                modifier: 2,
            }),
        ).rejects.toThrow("Aucune demande d'initiative en attente pour ce joueur.");

        expect(DiceService.createRoll).not.toHaveBeenCalled();
    });

    it("lets a GM add and roll a custom participant", async () => {
        const customEntry = entry({
            participant_type: "custom",
            user_id: null,
            label: "Boss",
            initiative_modifier: 4,
        });
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(customEntry);
        vi.mocked(DiceService.createRoll).mockResolvedValue({
            id: "00000000-0000-4000-8000-000000000012",
            total: 20,
        } as Awaited<ReturnType<typeof DiceService.createRoll>>);

        await InitiativeService.executeAction(gmId, sessionId, {
            action: "add_custom",
            label: "Boss",
            modifier: 4,
        });
        await InitiativeService.executeAction(gmId, sessionId, {
            action: "roll",
            entry_id: customEntry.id,
        });

        expect(InitiativeRepository.addCustomEntry).toHaveBeenCalledWith(
            sessionId,
            tableId,
            "Boss",
            4,
            0,
            gmId,
        );
        expect(DiceService.createRoll).toHaveBeenCalledWith(
            gmId,
            expect.objectContaining({ modifier: 4, roll_kind: "initiative" }),
        );
    });

    it("sorts scored entries descending while keeping waiting entries last", async () => {
        const low = entry({ id: "low", initiative_score: 8, position: 0 });
        const waiting = entry({ id: "waiting", initiative_score: null, position: 1 });
        const high = entry({ id: "high", initiative_score: 19, position: 2 });
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(low);
        vi.mocked(InitiativeRepository.listEntries).mockResolvedValue([low, waiting, high]);

        await InitiativeService.executeAction(gmId, sessionId, {
            action: "update_entry",
            entry_id: low.id,
            score: 8,
        });

        expect(InitiativeRepository.updatePositions).toHaveBeenCalledWith([
            { id: "high", position: 0 },
            { id: "low", position: 1 },
            { id: "waiting", position: 2 },
        ]);
    });

    it("resets the initiative for a GM and rejects GM actions from players", async () => {
        await InitiativeService.executeAction(gmId, sessionId, { action: "reset" });
        expect(InitiativeRepository.reset).toHaveBeenCalledWith(sessionId);

        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Awaited<ReturnType<typeof MembershipService.requireMembership>>);

        await expect(
            InitiativeService.executeAction(playerA, sessionId, {
                action: "add_custom",
                label: "Intrus",
                modifier: 0,
            }),
        ).rejects.toThrow(ForbiddenError);
    });
});
