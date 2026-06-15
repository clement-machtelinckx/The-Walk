"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Session } from "@/types/session";
import type {
    SessionLiveModuleSettings,
    SessionLiveModuleSettingsValues,
} from "@/types/live-module-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, LogOut, Loader2, FileText, ChevronDown, ChevronUp, Dice5 } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { useRouter } from "next/navigation";
import { formatFullDate } from "@/lib/utils/date";
import { PresenceBlock } from "./presence-block";
import { TableDiscussionBlock } from "./table-discussion-block";
import { NotesHub } from "./notes/notes-hub";
import { SessionToolsDrawer } from "./session-tools-drawer";
import { DiceLogBlock } from "./dice-log-block";
import { InitiativeBlock } from "./initiative-block";
import { ContextMenuActions, type ContextMenuAction } from "@/components/ui/context-menu-actions";

type LiveSessionHubProps = Readonly<{
    session: Session;
    tableId: string;
    myRole: string;
    moduleSettings: SessionLiveModuleSettings;
}>;

function toModuleValues(settings: SessionLiveModuleSettings): SessionLiveModuleSettingsValues {
    return {
        group_notes: settings.group_notes,
        dice: settings.dice,
        initiative: settings.initiative,
        presence: settings.presence,
    };
}

export function LiveSessionHub({ session, tableId, myRole, moduleSettings }: LiveSessionHubProps) {
    const router = useRouter();
    const {
        endSession,
        cancelSession,
        isEndingSession,
        isCancellingSession,
        activeSessions,
        fetchActiveSession,
        liveModuleSettings,
        setLiveModuleSettings,
        fetchLiveModuleSettings,
    } = useSessionStore();
    const isGM = myRole === "gm";

    const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
    const liveModules = liveModuleSettings[session.id] || toModuleValues(moduleSettings);

    useEffect(() => {
        if (!liveModuleSettings[session.id]) {
            setLiveModuleSettings(session.id, toModuleValues(moduleSettings));
        }
    }, [liveModuleSettings, moduleSettings, session.id, setLiveModuleSettings]);

    const currentModuleSettings = useMemo<SessionLiveModuleSettings>(
        () => ({
            ...moduleSettings,
            ...liveModules,
        }),
        [liveModules, moduleSettings],
    );

    const hasVisibleLiveEnrichments =
        liveModules.group_notes || liveModules.dice || liveModules.initiative;

    // Polling centralisé pour vérifier l'état de la session (toutes les 30s)
    const checkSessionStatus = useCallback(async () => {
        await fetchActiveSession(tableId);
        const currentActive = activeSessions[tableId];
        if (currentActive === null) {
            router.push(`/tables/${tableId}`);
        }
    }, [tableId, fetchActiveSession, activeSessions, router]);

    usePolling(checkSessionStatus, { interval: 30000 });

    const refreshModuleSettings = useCallback(async () => {
        await fetchLiveModuleSettings(session.id);
    }, [fetchLiveModuleSettings, session.id]);

    const handleModuleSettingsChange = useCallback(
        (settings: SessionLiveModuleSettingsValues) => setLiveModuleSettings(session.id, settings),
        [session.id, setLiveModuleSettings],
    );

    usePolling(refreshModuleSettings, { interval: 15000 });

    const handleEndSession = async () => {
        if (
            !confirm(
                "Voulez-vous vraiment terminer cette session ? Elle sera clôturée définitivement.",
            )
        )
            return;
        const result = await endSession(session.id);
        if (result.success) {
            router.push(`/tables/${tableId}`);
        }
    };

    const handleCancelSession = async () => {
        if (
            !confirm(
                "Annuler cette session live ? Elle sera clôturée comme annulée et restera visible dans l'historique.",
            )
        )
            return;

        const result = await cancelSession(session.id);
        if (result.success) {
            router.push(`/tables/${tableId}`);
            return;
        }

        alert(result.error || "Impossible d'annuler la session.");
    };

    const liveActions: ContextMenuAction[] = isGM
        ? [
              {
                  id: "cancel",
                  label: isCancellingSession ? "Annulation en cours..." : "Annuler la session",
                  icon: isCancellingSession ? Loader2 : Ban,
                  iconClassName: isCancellingSession ? "animate-spin" : undefined,
                  onSelect: handleCancelSession,
                  disabled: isEndingSession || isCancellingSession,
              },
              {
                  id: "end",
                  label: isEndingSession ? "Clôture en cours..." : "Clôturer la session",
                  icon: isEndingSession ? Loader2 : LogOut,
                  iconClassName: isEndingSession ? "animate-spin" : undefined,
                  onSelect: handleEndSession,
                  disabled: isEndingSession || isCancellingSession,
                  destructive: true,
                  separatorBefore: true,
              },
          ]
        : [];

    return (
        <div className="space-y-6 py-2 md:py-4">
            <SessionToolsDrawer
                isGM={isGM}
                tableId={tableId}
                context="live"
                sessionId={session.id}
                moduleSettings={currentModuleSettings}
                onModuleSettingsChange={handleModuleSettingsChange}
            />

            {/* Header plus compact */}
            <header className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="shrink-0 animate-pulse bg-green-600 px-1.5 py-0 text-[10px]">
                            LIVE
                        </Badge>
                        <span className="text-muted-foreground text-[10px] font-medium">
                            {formatFullDate(session.started_at || session.created_at)}
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight italic md:text-2xl">
                        {session.title}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {liveModules.presence && <PresenceBlock sessionId={session.id} isGM={isGM} />}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/tables/${tableId}`)}
                        className="text-muted-foreground hover:text-foreground h-8 text-xs"
                    >
                        <span className="hidden sm:inline">Quitter le live</span>
                        <span className="sm:hidden">Quitter</span>
                    </Button>

                    {isGM && (
                        <ContextMenuActions
                            actions={liveActions}
                            label="Ouvrir les actions de la session live"
                        />
                    )}
                </div>
            </header>

            <div className="space-y-6">
                {/* Résumé repliable */}
                <Card className="border-primary/10 bg-primary/5 overflow-hidden">
                    <CardHeader
                        className="bg-background/50 hover:bg-background/80 flex cursor-pointer flex-row items-center justify-between border-b px-4 py-2 transition-colors"
                        onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                    >
                        <CardTitle className="text-primary/80 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            <FileText size={12} />
                            Résumé de session
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                            {isSummaryCollapsed ? (
                                <ChevronDown size={14} />
                            ) : (
                                <ChevronUp size={14} />
                            )}
                        </Button>
                    </CardHeader>
                    {!isSummaryCollapsed && (
                        <CardContent className="animate-in fade-in slide-in-from-top-1 p-4 duration-200">
                            <p className="text-foreground text-sm leading-relaxed">
                                {session.description || "Aucun objectif défini pour cette session."}
                            </p>
                        </CardContent>
                    )}
                </Card>

                <TableDiscussionBlock tableId={tableId} sessionId={session.id} context="live" />

                <NotesHub
                    sessionId={session.id}
                    isGM={isGM}
                    showGroupNotes={liveModules.group_notes}
                />

                {(liveModules.dice || liveModules.initiative) && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {liveModules.dice && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                                        <Dice5 className="text-primary h-4 w-4" />
                                        Dés
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DiceLogBlock tableId={tableId} sessionId={session.id} />
                                </CardContent>
                            </Card>
                        )}

                        {liveModules.initiative && (
                            <InitiativeBlock sessionId={session.id} isGM={isGM} />
                        )}
                    </div>
                )}

                {!hasVisibleLiveEnrichments && (
                    <Card className="border-dashed">
                        <CardContent className="p-4">
                            <p className="text-sm font-semibold">
                                Aucun enrichissement live affiché.
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                La discussion de table reste disponible. Le MJ peut réactiver les
                                autres outils depuis les réglages de session.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
