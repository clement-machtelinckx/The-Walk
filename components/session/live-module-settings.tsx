"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
    SessionLiveModuleSettings,
    SessionLiveModuleKey,
    SessionLiveModuleSettingsValues,
} from "@/types/live-module-settings";

const MODULE_LABELS: Record<SessionLiveModuleKey, { label: string; description: string }> = {
    live_chat: {
        label: "Chat live",
        description: "Messages visibles pendant la session.",
    },
    group_notes: {
        label: "Notes de groupe",
        description: "Espace partagé pour les notes de table.",
    },
    dice: {
        label: "Dés",
        description: "Journal et outils de lancer.",
    },
    initiative: {
        label: "Initiative",
        description: "Suivi d'ordre de tour.",
    },
    presence: {
        label: "Présence",
        description: "Appel et état des participants.",
    },
};

const MODULE_KEYS: SessionLiveModuleKey[] = [
    "live_chat",
    "group_notes",
    "dice",
    "initiative",
    "presence",
];

type LiveModuleSettingsProps = Readonly<{
    sessionId: string;
    initialSettings?: SessionLiveModuleSettings;
    onSettingsChange?: (settings: SessionLiveModuleSettingsValues) => void;
}>;

function toValues(settings: SessionLiveModuleSettings): SessionLiveModuleSettingsValues {
    return {
        live_chat: settings.live_chat,
        group_notes: settings.group_notes,
        dice: settings.dice,
        initiative: settings.initiative,
        presence: settings.presence,
    };
}

export function LiveModuleSettings({
    sessionId,
    initialSettings,
    onSettingsChange,
}: LiveModuleSettingsProps) {
    const [settings, setSettings] = useState<SessionLiveModuleSettingsValues | null>(
        initialSettings ? toValues(initialSettings) : null,
    );
    const [isLoading, setIsLoading] = useState(!initialSettings);
    const [savingModule, setSavingModule] = useState<SessionLiveModuleKey | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/sessions/${sessionId}/modules`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Impossible de charger les modules.");
                return;
            }

            const nextSettings = toValues(data.settings);
            setSettings(nextSettings);
            onSettingsChange?.(nextSettings);
        } catch {
            setError("Erreur réseau pendant le chargement des modules.");
        } finally {
            setIsLoading(false);
        }
    }, [onSettingsChange, sessionId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateModule = async (module: SessionLiveModuleKey, enabled: boolean) => {
        if (!settings || savingModule) return;

        const previousSettings = settings;
        setSavingModule(module);
        setFeedback(null);
        setError(null);
        setSettings({ ...settings, [module]: enabled });

        try {
            const response = await fetch(`/api/sessions/${sessionId}/modules`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [module]: enabled }),
            });
            const data = await response.json();

            if (!response.ok) {
                setSettings(previousSettings);
                setError(data.error || "Impossible d'enregistrer ce module.");
                return;
            }

            const nextSettings = toValues(data.settings);
            setSettings(nextSettings);
            onSettingsChange?.(nextSettings);
            setFeedback("Modules mis à jour.");
        } catch {
            setSettings(previousSettings);
            setError("Erreur réseau pendant l'enregistrement.");
        } finally {
            setSavingModule(null);
        }
    };

    let moduleSettingsContent = null;

    if (isLoading) {
        moduleSettingsContent = (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary/60 h-5 w-5 animate-spin" />
            </div>
        );
    } else if (settings) {
        moduleSettingsContent = (
            <div className="mt-4 space-y-2">
                {MODULE_KEYS.map((module) => {
                    const isEnabled = settings[module];
                    const isSaving = savingModule === module;
                    const moduleLabel = MODULE_LABELS[module];

                    return (
                        <div
                            key={module}
                            className="bg-background/70 flex items-center justify-between gap-3 rounded-md border p-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold">{moduleLabel.label}</p>
                                <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                                    {moduleLabel.description}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                role="switch"
                                aria-checked={isEnabled}
                                aria-label={`${isEnabled ? "Désactiver" : "Activer"} ${moduleLabel.label}`}
                                disabled={Boolean(savingModule)}
                                onClick={() => updateModule(module, !isEnabled)}
                                className="h-8 shrink-0 gap-2 px-1.5"
                            >
                                {isSaving && (
                                    <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                                )}
                                <span
                                    className={cn(
                                        "flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors",
                                        isEnabled
                                            ? "border-primary bg-primary"
                                            : "border-border bg-muted",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "bg-background h-4.5 w-4.5 rounded-full shadow-sm transition-transform",
                                            isEnabled && "translate-x-5",
                                        )}
                                    />
                                </span>
                            </Button>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <section className="bg-muted/20 rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <Settings2 className="text-primary h-3.5 w-3.5" />
                        Modules affichés
                    </h4>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Configuration commune à tous les participants du live.
                    </p>
                </div>
                <Badge variant="outline" className="shrink-0 px-2 py-0 text-[9px]">
                    MJ
                </Badge>
            </div>

            {moduleSettingsContent}

            {(feedback || error) && (
                <p
                    className={cn(
                        "mt-3 text-[11px] font-medium",
                        error ? "text-destructive" : "text-muted-foreground",
                    )}
                >
                    {error || feedback}
                </p>
            )}
        </section>
    );
}
