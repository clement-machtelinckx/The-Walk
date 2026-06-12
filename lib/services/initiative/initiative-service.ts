import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { InitiativeRepository } from "@/lib/repositories/initiative-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { PresenceRepository } from "@/lib/repositories/presence-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { DiceService } from "@/lib/services/dice/dice-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { NotificationEventService } from "@/lib/services/notifications/notification-event-service";
import type { InitiativeActionInput } from "@/lib/validators/initiative";
import type { InitiativeEntry, InitiativeSnapshot } from "@/types/initiative";
import type { Session } from "@/types/session";

async function requireActiveSessionMember(userId: string, sessionId: string) {
    const session = await SessionRepository.getById(sessionId);
    const membership = await MembershipService.requireMembership(userId, session.table_id);

    if (session.status !== "active") {
        throw new ValidationError(
            "L'initiative est disponible uniquement pendant une session live.",
        );
    }

    return { session, membership };
}

async function requireActiveSessionGm(userId: string, sessionId: string): Promise<Session> {
    const { session, membership } = await requireActiveSessionMember(userId, sessionId);

    if (membership.role !== "gm") {
        throw new ForbiddenError("Seul le Maître du Jeu peut gérer l'ordre d'initiative.");
    }

    return session;
}

async function requireSessionEntry(sessionId: string, entryId: string): Promise<InitiativeEntry> {
    const entry = await InitiativeRepository.getEntry(entryId);

    if (!entry || entry.session_id !== sessionId) {
        throw new NotFoundError("Entrée d'initiative", entryId);
    }

    return entry;
}

async function normalizePositions(sessionId: string): Promise<void> {
    const entries = await InitiativeRepository.listEntries(sessionId);
    await InitiativeRepository.updatePositions(
        entries.map((entry, position) => ({ id: entry.id, position })),
    );
}

async function sortByScore(sessionId: string, asSystem = false): Promise<void> {
    const entries = await InitiativeRepository.listEntries(sessionId);
    const sorted = [...entries].sort((left, right) => {
        if (left.initiative_score === null && right.initiative_score === null) {
            return left.position - right.position;
        }
        if (left.initiative_score === null) return 1;
        if (right.initiative_score === null) return -1;
        return right.initiative_score - left.initiative_score || left.position - right.position;
    });

    const positions = sorted.map((entry, position) => ({ id: entry.id, position }));

    if (asSystem) {
        await InitiativeRepository.updatePositionsAsSystem(positions);
        return;
    }

    await InitiativeRepository.updatePositions(positions);
}

async function rollEntry(
    actorUserId: string,
    session: Session,
    entry: InitiativeEntry,
    modifier: number,
): Promise<void> {
    const roll = await DiceService.createRoll(actorUserId, {
        table_id: session.table_id,
        session_id: session.id,
        dice_type: 20,
        quantity: 1,
        modifier,
        roll_kind: "initiative",
    });

    await InitiativeRepository.updateEntry(entry.id, {
        initiative_modifier: modifier,
        initiative_score: roll.total,
        last_roll_id: roll.id,
    });
}

async function getSnapshot(userId: string, sessionId: string): Promise<InitiativeSnapshot> {
    const { session } = await requireActiveSessionMember(userId, sessionId);
    const [state, entries, members] = await Promise.all([
        InitiativeRepository.getState(sessionId),
        InitiativeRepository.listEntries(sessionId),
        MembershipService.listMembers(session.table_id),
    ]);

    return {
        state,
        entries,
        eligible_members: members
            .filter((member) => member.role === "player")
            .map((member) => ({
                user_id: member.userId,
                display_name: member.profile.display_name,
                avatar_url: member.profile.avatar_url,
                avatar_key: member.profile.avatar_key,
            })),
    };
}

async function requestInitiative(userId: string, sessionId: string): Promise<void> {
    const session = await requireActiveSessionGm(userId, sessionId);
    const [members, presences, existingEntries] = await Promise.all([
        MembershipService.listMembers(session.table_id),
        PresenceRepository.listBySession(sessionId),
        InitiativeRepository.listEntries(sessionId),
    ]);

    const playerIds = members
        .filter((member) => member.role === "player" && member.userId !== userId)
        .map((member) => member.userId);
    const presentPlayerIds = new Set(
        presences
            .filter((presence) => presence.status === "present")
            .map((presence) => presence.user_id),
    );
    const targetedUserIds = playerIds.some((playerId) => presentPlayerIds.has(playerId))
        ? playerIds.filter((playerId) => presentPlayerIds.has(playerId))
        : playerIds;

    const nextPosition =
        existingEntries.reduce((maximum, entry) => Math.max(maximum, entry.position), -1) + 1;

    await InitiativeRepository.addMemberEntries(
        sessionId,
        session.table_id,
        targetedUserIds,
        userId,
        nextPosition,
    );
    const requestedAt = new Date().toISOString();
    await InitiativeRepository.requestMemberInitiative(sessionId, targetedUserIds, requestedAt);
    await InitiativeRepository.upsertRequestState(sessionId, session.table_id, userId, requestedAt);
    await sortByScore(sessionId);
    await NotificationEventService.notifyInitiativeRequested(session, targetedUserIds);
}

async function addMember(userId: string, sessionId: string, targetUserId: string): Promise<void> {
    const session = await requireActiveSessionGm(userId, sessionId);
    const targetMembership = await MembershipRepository.getByUserAndTable(
        targetUserId,
        session.table_id,
    );

    if (!targetMembership || targetMembership.role !== "player") {
        throw new ValidationError("Seuls les joueurs de la table peuvent rejoindre l'initiative.");
    }

    const entries = await InitiativeRepository.listEntries(sessionId);
    const nextPosition =
        entries.reduce((maximum, entry) => Math.max(maximum, entry.position), -1) + 1;
    await InitiativeRepository.addMemberEntries(
        sessionId,
        session.table_id,
        [targetUserId],
        userId,
        nextPosition,
    );
}

async function addCustom(
    userId: string,
    sessionId: string,
    label: string,
    modifier: number,
): Promise<void> {
    const session = await requireActiveSessionGm(userId, sessionId);
    const entries = await InitiativeRepository.listEntries(sessionId);
    const nextPosition =
        entries.reduce((maximum, entry) => Math.max(maximum, entry.position), -1) + 1;

    await InitiativeRepository.addCustomEntry(
        sessionId,
        session.table_id,
        label,
        modifier,
        nextPosition,
        userId,
    );
}

async function rollInitiative(
    userId: string,
    sessionId: string,
    entryId: string,
    requestedModifier?: number,
): Promise<void> {
    const { session, membership } = await requireActiveSessionMember(userId, sessionId);
    const entry = await requireSessionEntry(sessionId, entryId);

    if (entry.participant_type === "custom") {
        if (membership.role !== "gm") {
            throw new ForbiddenError(
                "Seul le MJ peut lancer l'initiative d'un participant custom.",
            );
        }
    } else {
        if (entry.user_id !== userId) {
            throw new ForbiddenError("Vous ne pouvez lancer que votre propre initiative.");
        }
        if (!entry.initiative_requested_at || entry.initiative_score !== null) {
            throw new ValidationError("Aucune demande d'initiative en attente pour ce joueur.");
        }
    }

    await rollEntry(userId, session, entry, requestedModifier ?? entry.initiative_modifier);
    await sortByScore(sessionId, membership.role !== "gm");
}

async function rollCustomMissing(userId: string, sessionId: string): Promise<void> {
    const session = await requireActiveSessionGm(userId, sessionId);
    const entries = await InitiativeRepository.listEntries(sessionId);

    for (const entry of entries) {
        if (entry.participant_type === "custom" && entry.initiative_score === null) {
            await rollEntry(userId, session, entry, entry.initiative_modifier);
        }
    }

    await sortByScore(sessionId);
}

async function updateEntry(
    userId: string,
    sessionId: string,
    entryId: string,
    score?: number | null,
    modifier?: number,
): Promise<void> {
    await requireActiveSessionGm(userId, sessionId);
    await requireSessionEntry(sessionId, entryId);

    await InitiativeRepository.updateEntry(entryId, {
        ...(score !== undefined ? { initiative_score: score } : {}),
        ...(modifier !== undefined ? { initiative_modifier: modifier } : {}),
        last_roll_id: null,
    });

    if (score !== undefined) {
        await sortByScore(sessionId);
    }
}

async function moveEntry(
    userId: string,
    sessionId: string,
    entryId: string,
    direction: "up" | "down",
): Promise<void> {
    await requireActiveSessionGm(userId, sessionId);
    const entries = await InitiativeRepository.listEntries(sessionId);
    const currentIndex = entries.findIndex((entry) => entry.id === entryId);

    if (currentIndex === -1) {
        throw new NotFoundError("Entrée d'initiative", entryId);
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;

    await InitiativeRepository.updatePositions([
        { id: entries[currentIndex].id, position: targetIndex },
        { id: entries[targetIndex].id, position: currentIndex },
    ]);
}

async function setCurrent(
    userId: string,
    sessionId: string,
    entryId: string | null,
): Promise<void> {
    const session = await requireActiveSessionGm(userId, sessionId);
    if (entryId) await requireSessionEntry(sessionId, entryId);
    await InitiativeRepository.setCurrentEntry(sessionId, session.table_id, entryId);
}

async function removeEntry(userId: string, sessionId: string, entryId: string): Promise<void> {
    await requireActiveSessionGm(userId, sessionId);
    await requireSessionEntry(sessionId, entryId);
    await InitiativeRepository.removeEntry(entryId);
    await normalizePositions(sessionId);
}

async function reset(userId: string, sessionId: string): Promise<void> {
    await requireActiveSessionGm(userId, sessionId);
    await InitiativeRepository.reset(sessionId);
}

async function executeAction(
    userId: string,
    sessionId: string,
    input: InitiativeActionInput,
): Promise<InitiativeSnapshot> {
    switch (input.action) {
        case "request":
            await requestInitiative(userId, sessionId);
            break;
        case "add_member":
            await addMember(userId, sessionId, input.user_id);
            break;
        case "add_custom":
            await addCustom(userId, sessionId, input.label, input.modifier);
            break;
        case "roll":
            await rollInitiative(userId, sessionId, input.entry_id, input.modifier);
            break;
        case "roll_custom_missing":
            await rollCustomMissing(userId, sessionId);
            break;
        case "update_entry":
            await updateEntry(userId, sessionId, input.entry_id, input.score, input.modifier);
            break;
        case "move":
            await moveEntry(userId, sessionId, input.entry_id, input.direction);
            break;
        case "set_current":
            await setCurrent(userId, sessionId, input.entry_id);
            break;
        case "remove":
            await removeEntry(userId, sessionId, input.entry_id);
            break;
        case "reset":
            await reset(userId, sessionId);
            break;
    }

    return getSnapshot(userId, sessionId);
}

export const InitiativeService = {
    getSnapshot,
    executeAction,
};
