import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { SessionLiveEnabledModuleRepository } from "@/lib/repositories/session-live-enabled-module-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { LiveModuleSettingsService } from "./live-module-settings-service";
import { SessionRepository } from "@/lib/repositories/session-repository";

vi.mock("@/lib/repositories/session-live-enabled-module-repository");
vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/services/memberships/membership-service");

describe("LiveModuleSettingsService", () => {
    const userId = "user-123";
    const sessionId = "session-123";
    const tableId = "table-123";

    type SessionById = Awaited<ReturnType<typeof SessionRepository.getById>>;
    type Membership = Awaited<ReturnType<typeof MembershipService.requireMembership>>;
    type EnabledModule = Awaited<
        ReturnType<typeof SessionLiveEnabledModuleRepository.listBySessionId>
    >[number];

    const row = (moduleKey: string): EnabledModule => ({
        id: `row-${moduleKey}`,
        session_id: sessionId,
        module_key: moduleKey,
        created_at: new Date().toISOString(),
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: sessionId,
            table_id: tableId,
        } as SessionById);
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "gm",
        } as Membership);
        vi.mocked(SessionLiveEnabledModuleRepository.enableModule).mockResolvedValue(undefined);
        vi.mocked(SessionLiveEnabledModuleRepository.disableModule).mockResolvedValue(undefined);
    });

    it("returns V1 defaults when no live module config exists yet", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([]);

        const settings = await LiveModuleSettingsService.getSettings(userId, sessionId);

        expect(settings).toEqual({
            session_id: sessionId,
            enabled_modules: ["live_chat", "group_notes", "dice", "presence"],
            is_configured: false,
            live_chat: true,
            group_notes: true,
            dice: true,
            initiative: false,
            presence: true,
        });
        expect(MembershipService.requireMembership).toHaveBeenCalledWith(userId, tableId);
    });

    it("returns explicitly persisted settings when config exists", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([
            row("__configured"),
            row("dice"),
            row("presence"),
        ]);

        const settings = await LiveModuleSettingsService.getSettings(userId, sessionId);

        expect(settings).toMatchObject({
            enabled_modules: ["dice", "presence"],
            is_configured: true,
            live_chat: false,
            group_notes: false,
            dice: true,
            initiative: false,
            presence: true,
        });
    });

    it("allows table members to read settings", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Membership);
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([]);

        await expect(
            LiveModuleSettingsService.getSettings(userId, sessionId),
        ).resolves.toMatchObject({
            live_chat: true,
        });
    });

    it("rejects reads from users outside the table", async () => {
        vi.mocked(MembershipService.requireMembership).mockRejectedValue(
            new ForbiddenError("L'utilisateur n'est pas membre de cette table."),
        );

        await expect(LiveModuleSettingsService.getSettings(userId, sessionId)).rejects.toThrow(
            ForbiddenError,
        );
        expect(SessionLiveEnabledModuleRepository.listBySessionId).not.toHaveBeenCalled();
    });

    it("rejects updates from non-GM members", async () => {
        vi.mocked(MembershipService.requireMembership).mockResolvedValue({
            role: "player",
        } as Membership);

        await expect(
            LiveModuleSettingsService.updateModule(userId, sessionId, "dice", false),
        ).rejects.toThrow(ForbiddenError);
        expect(SessionLiveEnabledModuleRepository.enableModule).not.toHaveBeenCalled();
        expect(SessionLiveEnabledModuleRepository.disableModule).not.toHaveBeenCalled();
    });

    it("enabling a module persists the marker and the module key", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([]);

        const settings = await LiveModuleSettingsService.updateModule(
            userId,
            sessionId,
            "initiative",
            true,
        );

        expect(SessionLiveEnabledModuleRepository.enableModule).toHaveBeenCalledWith(
            sessionId,
            "__configured",
        );
        expect(SessionLiveEnabledModuleRepository.enableModule).toHaveBeenCalledWith(
            sessionId,
            "initiative",
        );
        expect(settings).toMatchObject({
            is_configured: true,
            enabled_modules: ["initiative"],
            initiative: true,
        });
    });

    it("disabling a module removes its row from the persisted config", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([
            row("__configured"),
            row("dice"),
            row("presence"),
        ]);

        const settings = await LiveModuleSettingsService.updateModule(
            userId,
            sessionId,
            "dice",
            false,
        );

        expect(SessionLiveEnabledModuleRepository.disableModule).toHaveBeenCalledWith(
            sessionId,
            "dice",
        );
        expect(settings).toMatchObject({
            is_configured: true,
            enabled_modules: ["presence"],
            dice: false,
            presence: true,
        });
    });

    it("keeps a deliberately empty config from falling back to defaults", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([]);

        const settings = await LiveModuleSettingsService.updateSettings(userId, sessionId, {
            live_chat: false,
            group_notes: false,
            dice: false,
            initiative: false,
            presence: false,
        });

        expect(SessionLiveEnabledModuleRepository.enableModule).toHaveBeenCalledTimes(1);
        expect(SessionLiveEnabledModuleRepository.enableModule).toHaveBeenCalledWith(
            sessionId,
            "__configured",
        );
        expect(settings).toEqual({
            session_id: sessionId,
            enabled_modules: [],
            is_configured: true,
            live_chat: false,
            group_notes: false,
            dice: false,
            initiative: false,
            presence: false,
        });
    });

    it("preserves future module keys when updating the known V1 projection", async () => {
        vi.mocked(SessionLiveEnabledModuleRepository.listBySessionId).mockResolvedValue([
            row("__configured"),
            row("map"),
            row("dice"),
        ]);

        const settings = await LiveModuleSettingsService.updateSettings(userId, sessionId, {
            dice: false,
        });

        expect(SessionLiveEnabledModuleRepository.disableModule).toHaveBeenCalledWith(
            sessionId,
            "dice",
        );
        expect(SessionLiveEnabledModuleRepository.disableModule).not.toHaveBeenCalledWith(
            sessionId,
            "map",
        );
        expect(settings.enabled_modules).toContain("map");
    });
});
