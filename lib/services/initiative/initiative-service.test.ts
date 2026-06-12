import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/lib/errors";
import { InitiativeRepository } from "@/lib/repositories/initiative-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { PresenceRepository } from "@/lib/repositories/presence-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { DiceService } from "@/lib/services/dice/dice-service";
import { InitiativeService } from "@/lib/services/initiative/initiative-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NotificationEventService } from "@/lib/services/notifications/notification-event-service";
import type { DiceRollLog } from "@/types/dice";
import type { InitiativeEntry } from "@/types/initiative";
import type { Session, SessionPresenceWithProfile } from "@/types/session";
import type { TableMember, TableRole } from "@/types/table";

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
    const now = new Date().toISOString();
    const activeSession: Session = {
        id: sessionId,
        table_id: tableId,
        title: "Session live",
        description: null,
        status: "active",
        scheduled_at: null,
        started_at: now,
        ended_at: null,
        created_at: now,
        updated_at: now,
    };

    const tableMembership = (userId: string, role: TableRole): TableMember => ({
        id: `${userId}-membership`,
        table_id: tableId,
        user_id: userId,
        role,
        joined_at: now,
    });

    const member = (userId: string, role: "gm" | "player" | "observer") => ({
        userId,
        role,
        joinedAt: now,
        profile: {
            id: userId,
            email: `${userId}@example.com`,
            display_name: userId,
            avatar_url: null,
            avatar_key: null,
            created_at: now,
            updated_at: now,
        },
    });

    const presence = (
        userId: string,
        status: SessionPresenceWithProfile["status"],
    ): SessionPresenceWithProfile => ({
        id: `${userId}-presence`,
        session_id: sessionId,
        user_id: userId,
        status,
        last_seen_at: now,
        profiles: {
            id: userId,
            display_name: userId,
            avatar_url: null,
            avatar_key: null,
        },
    });

    const diceRoll = (id: string, total: number): DiceRollLog => ({
        id,
        table_id: tableId,
        session_id: sessionId,
        user_id: playerA,
        dice_type: 20,
        quantity: 1,
        modifier: 3,
        rolls: [14],
        total,
        roll_kind: "initiative",
        created_at: now,
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
        created_at: now,
        updated_at: now,
        ...updates,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue(activeSession);
        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(gmId, "gm"),
        );
        vi.mocked(MembershipService.listMembers).mockResolvedValue([]);
        vi.mocked(PresenceRepository.listBySession).mockResolvedValue([]);
        vi.mocked(InitiativeRepository.listEntries).mockResolvedValue([]);
        vi.mocked(InitiativeRepository.getState).mockResolvedValue(null);
        vi.mocked(NotificationEventService.notifyInitiativeRequested).mockResolvedValue();
    });

    it("removes stale absent players while keeping custom entries on a targeted request", async () => {
        const staleAbsentEntry = entry({
            id: "00000000-0000-4000-8000-000000000020",
            user_id: playerB,
            initiative_score: 18,
        });
        const customEntry = entry({
            id: "00000000-0000-4000-8000-000000000021",
            participant_type: "custom",
            user_id: null,
            label: "Boss",
            initiative_score: 12,
            position: 1,
        });
        const requestedPlayerEntry = entry({
            initiative_requested_at: now,
            position: 2,
        });
        vi.mocked(MembershipService.listMembers).mockResolvedValue([
            member(gmId, "gm"),
            member(playerA, "player"),
            member(playerB, "player"),
            member(observerId, "observer"),
        ]);
        vi.mocked(PresenceRepository.listBySession).mockResolvedValue([
            presence(playerA, "present"),
            presence(playerB, "absent"),
        ]);
        vi.mocked(InitiativeRepository.listEntries)
            .mockResolvedValueOnce([staleAbsentEntry, customEntry])
            .mockResolvedValueOnce([customEntry, requestedPlayerEntry])
            .mockResolvedValueOnce([customEntry, requestedPlayerEntry]);

        await InitiativeService.executeAction(gmId, sessionId, { action: "request" });

        expect(InitiativeRepository.addMemberEntries).toHaveBeenCalledWith(
            sessionId,
            tableId,
            [playerA],
            gmId,
            2,
        );
        expect(InitiativeRepository.removeEntry).toHaveBeenCalledWith(staleAbsentEntry.id);
        expect(InitiativeRepository.removeEntry).not.toHaveBeenCalledWith(customEntry.id);
        expect(InitiativeRepository.requestMemberInitiative).toHaveBeenCalledWith(
            sessionId,
            [playerA],
            expect.any(String),
        );
        expect(NotificationEventService.notifyInitiativeRequested).toHaveBeenCalledWith(
            expect.objectContaining({ id: sessionId }),
            [playerA],
        );
        expect(InitiativeRepository.updatePositions).toHaveBeenCalledWith([
            { id: customEntry.id, position: 0 },
            { id: requestedPlayerEntry.id, position: 1 },
        ]);
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

    it("marks a player added during an active request as pending and notifies them", async () => {
        const requestedAt = "2026-06-12T12:00:00.000Z";
        const pendingEntry = entry({ initiative_requested_at: requestedAt });
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(
            tableMembership(playerA, "player"),
        );
        vi.mocked(InitiativeRepository.getState).mockResolvedValue({
            session_id: sessionId,
            table_id: tableId,
            current_entry_id: null,
            initiative_requested_at: requestedAt,
            requested_by: gmId,
            created_at: now,
            updated_at: now,
        });
        vi.mocked(InitiativeRepository.listEntries)
            .mockResolvedValueOnce([])
            .mockResolvedValue([pendingEntry]);

        await InitiativeService.executeAction(gmId, sessionId, {
            action: "add_member",
            user_id: playerA,
        });

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
            requestedAt,
        );
        expect(NotificationEventService.notifyInitiativeRequested).toHaveBeenCalledWith(
            activeSession,
            [playerA],
        );
    });

    it("adds a player without marking them pending when no request is active", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(
            tableMembership(playerA, "player"),
        );

        await InitiativeService.executeAction(gmId, sessionId, {
            action: "add_member",
            user_id: playerA,
        });

        expect(InitiativeRepository.addMemberEntries).toHaveBeenCalled();
        expect(InitiativeRepository.requestMemberInitiative).not.toHaveBeenCalled();
        expect(NotificationEventService.notifyInitiativeRequested).not.toHaveBeenCalled();
    });

    it("lets a newly requested player roll server-side and stores the initiative result", async () => {
        const playerEntry = entry({ initiative_requested_at: now });
        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(playerA, "player"),
        );
        vi.mocked(InitiativeRepository.getEntry).mockResolvedValue(playerEntry);
        vi.mocked(DiceService.createRoll).mockResolvedValue(
            diceRoll("00000000-0000-4000-8000-000000000011", 17),
        );
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
        expect(InitiativeRepository.updatePositionsAsSystem).toHaveBeenCalledWith([
            { id: playerEntry.id, position: 0 },
        ]);
        expect(InitiativeRepository.updatePositions).not.toHaveBeenCalled();
    });

    it("refuses a player rolling another member's entry", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(playerA, "player"),
        );
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
        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(playerA, "player"),
        );
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
        vi.mocked(DiceService.createRoll).mockResolvedValue(
            diceRoll("00000000-0000-4000-8000-000000000012", 20),
        );

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

        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(playerA, "player"),
        );

        await expect(
            InitiativeService.executeAction(playerA, sessionId, {
                action: "add_custom",
                label: "Intrus",
                modifier: 0,
            }),
        ).rejects.toThrow(ForbiddenError);
    });

    it("does not let a player reorder initiative entries", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue(
            tableMembership(playerA, "player"),
        );
        vi.mocked(InitiativeRepository.listEntries).mockResolvedValue([
            entry(),
            entry({ id: "00000000-0000-4000-8000-000000000011", user_id: playerB, position: 1 }),
        ]);

        await expect(
            InitiativeService.executeAction(playerA, sessionId, {
                action: "move",
                entry_id: entry().id,
                direction: "down",
            }),
        ).rejects.toThrow(ForbiddenError);

        expect(InitiativeRepository.updatePositions).not.toHaveBeenCalled();
        expect(InitiativeRepository.updatePositionsAsSystem).not.toHaveBeenCalled();
    });
});
