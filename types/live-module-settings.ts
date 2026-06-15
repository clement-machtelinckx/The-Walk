export const SESSION_LIVE_MODULE_KEYS = ["group_notes", "dice", "initiative", "presence"] as const;

export type SessionLiveModuleKey = (typeof SESSION_LIVE_MODULE_KEYS)[number];

export interface SessionLiveModuleSettingsValues {
    group_notes: boolean;
    dice: boolean;
    initiative: boolean;
    presence: boolean;
}

export interface SessionLiveModuleSettings extends SessionLiveModuleSettingsValues {
    session_id: string;
    enabled_modules: SessionLiveModuleKey[];
    is_configured: boolean;
}

export type UpdateSessionLiveModuleSettingsInput = Partial<SessionLiveModuleSettingsValues>;

export interface SessionLiveEnabledModule {
    id: string;
    session_id: string;
    module_key: string;
    created_at: string;
}
