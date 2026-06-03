import { ForbiddenError, ValidationError } from "@/lib/errors";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { SessionLiveEnabledModuleRepository } from "@/lib/repositories/session-live-enabled-module-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import {
    SESSION_LIVE_MODULE_KEYS,
    SessionLiveModuleSettings,
    SessionLiveModuleSettingsValues,
    UpdateSessionLiveModuleSettingsInput,
} from "@/types/live-module-settings";

const CONFIGURED_MARKER_MODULE_KEY = "__configured";

export const DEFAULT_SESSION_LIVE_MODULE_SETTINGS: SessionLiveModuleSettingsValues = {
    live_chat: true,
    group_notes: true,
    dice: true,
    initiative: false,
    presence: true,
};

function toEnabledModuleKeys(settings: SessionLiveModuleSettingsValues): string[] {
    return SESSION_LIVE_MODULE_KEYS.filter((moduleKey) => settings[moduleKey]);
}

function toSettingsValues(enabledModules: Set<string>): SessionLiveModuleSettingsValues {
    return {
        live_chat: enabledModules.has("live_chat"),
        group_notes: enabledModules.has("group_notes"),
        dice: enabledModules.has("dice"),
        initiative: enabledModules.has("initiative"),
        presence: enabledModules.has("presence"),
    };
}

function buildSettings(
    sessionId: string,
    enabledModuleKeys: string[],
    isConfigured: boolean,
): SessionLiveModuleSettings {
    const exposedModuleKeys = enabledModuleKeys.filter(
        (moduleKey) => moduleKey !== CONFIGURED_MARKER_MODULE_KEY,
    );
    const values = isConfigured
        ? toSettingsValues(new Set(exposedModuleKeys))
        : DEFAULT_SESSION_LIVE_MODULE_SETTINGS;

    return {
        session_id: sessionId,
        enabled_modules: isConfigured
            ? exposedModuleKeys
            : toEnabledModuleKeys(DEFAULT_SESSION_LIVE_MODULE_SETTINGS),
        is_configured: isConfigured,
        ...values,
    };
}

async function requireSessionGm(userId: string, sessionId: string) {
    const session = await SessionRepository.getById(sessionId);
    const membership = await MembershipService.requireMembership(userId, session.table_id);

    if (membership.role !== "gm") {
        throw new ForbiddenError("Seul le Maître du Jeu peut modifier les modules live.");
    }
}

export const LiveModuleSettingsService = {
    async getSettings(userId: string, sessionId: string): Promise<SessionLiveModuleSettings> {
        const session = await SessionRepository.getById(sessionId);
        await MembershipService.requireMembership(userId, session.table_id);

        const rows = await SessionLiveEnabledModuleRepository.listBySessionId(sessionId);
        const moduleKeys = rows.map((row) => row.module_key);
        return buildSettings(sessionId, moduleKeys, moduleKeys.length > 0);
    },

    async updateSettings(
        userId: string,
        sessionId: string,
        updates: UpdateSessionLiveModuleSettingsInput,
    ): Promise<SessionLiveModuleSettings> {
        await requireSessionGm(userId, sessionId);

        const currentRows = await SessionLiveEnabledModuleRepository.listBySessionId(sessionId);
        const currentKeys = currentRows.map((row) => row.module_key);
        const currentSettings = buildSettings(sessionId, currentKeys, currentKeys.length > 0);
        const nextSettings: SessionLiveModuleSettingsValues = {
            live_chat: currentSettings.live_chat,
            group_notes: currentSettings.group_notes,
            dice: currentSettings.dice,
            initiative: currentSettings.initiative,
            presence: currentSettings.presence,
            ...updates,
        };

        const knownModuleKeys = new Set<string>(SESSION_LIVE_MODULE_KEYS);
        const existingFutureModuleKeys = currentKeys.filter(
            (moduleKey) =>
                moduleKey !== CONFIGURED_MARKER_MODULE_KEY && !knownModuleKeys.has(moduleKey),
        );
        const nextEnabledModuleKeys = [
            ...toEnabledModuleKeys(nextSettings),
            ...existingFutureModuleKeys,
        ];
        const keysToEnable = new Set([...nextEnabledModuleKeys, CONFIGURED_MARKER_MODULE_KEY]);
        const currentPersistedKeys = new Set(currentKeys);

        await Promise.all(
            [...keysToEnable]
                .filter((moduleKey) => !currentPersistedKeys.has(moduleKey))
                .map((moduleKey) =>
                    SessionLiveEnabledModuleRepository.enableModule(sessionId, moduleKey),
                ),
        );

        await Promise.all(
            [...currentPersistedKeys]
                .filter((moduleKey) => !keysToEnable.has(moduleKey))
                .map((moduleKey) =>
                    SessionLiveEnabledModuleRepository.disableModule(sessionId, moduleKey),
                ),
        );

        return buildSettings(sessionId, [...keysToEnable], true);
    },

    async updateModule(
        userId: string,
        sessionId: string,
        moduleKey: string,
        enabled: boolean,
    ): Promise<SessionLiveModuleSettings> {
        if (moduleKey.startsWith("__")) {
            throw new ValidationError("Cette clé de module est réservée au système.");
        }

        await requireSessionGm(userId, sessionId);

        const currentRows = await SessionLiveEnabledModuleRepository.listBySessionId(sessionId);
        const currentKeys = new Set(currentRows.map((row) => row.module_key));

        await SessionLiveEnabledModuleRepository.enableModule(
            sessionId,
            CONFIGURED_MARKER_MODULE_KEY,
        );

        if (enabled) {
            await SessionLiveEnabledModuleRepository.enableModule(sessionId, moduleKey);
            currentKeys.add(moduleKey);
        } else {
            await SessionLiveEnabledModuleRepository.disableModule(sessionId, moduleKey);
            currentKeys.delete(moduleKey);
        }

        currentKeys.add(CONFIGURED_MARKER_MODULE_KEY);
        return buildSettings(sessionId, [...currentKeys], true);
    },
};
