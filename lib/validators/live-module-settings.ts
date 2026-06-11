import { z } from "zod";
import { SESSION_LIVE_MODULE_KEYS } from "@/types/live-module-settings";

export const sessionLiveModuleSettingsValuesSchema = z.object({
    group_notes: z.boolean(),
    dice: z.boolean(),
    initiative: z.boolean(),
    presence: z.boolean(),
});

export const updateSessionLiveModuleSettingsSchema = sessionLiveModuleSettingsValuesSchema
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "Au moins un module doit être renseigné.",
    });

export type SessionLiveModuleSettingsValuesInput = z.infer<
    typeof sessionLiveModuleSettingsValuesSchema
>;
export type UpdateSessionLiveModuleSettingsInput = z.infer<
    typeof updateSessionLiveModuleSettingsSchema
>;

export const sessionLiveModuleKeySchema = z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, "Clé de module invalide");

export const knownSessionLiveModuleKeySchema = z.enum(SESSION_LIVE_MODULE_KEYS);

export const updateSessionLiveModuleToggleSchema = z
    .object({
        module_key: sessionLiveModuleKeySchema,
        enabled: z.boolean(),
    })
    .strict();

export const updateSessionLiveModulesSchema = z.union([
    updateSessionLiveModuleSettingsSchema,
    updateSessionLiveModuleToggleSchema,
]);

export type UpdateSessionLiveModuleToggleInput = z.infer<
    typeof updateSessionLiveModuleToggleSchema
>;
