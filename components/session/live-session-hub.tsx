"use client";

import { useCallback, useState } from "react";
import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { useRouter } from "next/navigation";
import { formatFullDate } from "@/lib/utils/date";
import { PresenceBlock } from "./presence-block";
import { LivechatBlock } from "./livechat-block";
import { NotesHub } from "./notes/notes-hub";
import { SessionToolsDrawer } from "./session-tools-drawer";

interface LiveSessionHubProps {
    session: Session;
    tableId: string;
    myRole: string;
}

export function LiveSessionHub({ session, tableId, myRole }: LiveSessionHubProps) {
    const router = useRouter();
    const { endSession, isEndingSession, activeSessions, fetchActiveSession } = useSessionStore();
    const isGM = myRole === "gm";

    const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

    // Polling centralisé pour vérifier l'état de la session (toutes les 30s)
    const checkSessionStatus = useCallback(async () => {
        await fetchActiveSession(tableId);
        const currentActive = activeSessions[tableId];
        if (currentActive === null) {
            router.push(`/tables/${tableId}`);
        }
    }, [tableId, fetchActiveSession, activeSessions, router]);

    usePolling(checkSessionStatus, { interval: 30000 });

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

    return (
        <div className="space-y-6 py-2 md:py-4">
            <SessionToolsDrawer
                isGM={isGM}
                tableId={tableId}
                context="live"
                sessionId={session.id}
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
                    <PresenceBlock sessionId={session.id} isGM={isGM} />

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
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndSession}
                            disabled={isEndingSession}
                            className="h-8 text-xs shadow-sm"
                        >
                            {isEndingSession ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <LogOut className="h-3 w-3 sm:mr-1.5" />
                            )}
                            <span className="hidden sm:inline">Clôturer</span>
                            <span className="sm:hidden">Fin</span>
                        </Button>
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

                {/* Hub de Notes (Tabs) */}
                <NotesHub sessionId={session.id} isGM={isGM} />

                {/* Chat (Repliable sur mobile géré dans LivechatBlock) */}
                <LivechatBlock sessionId={session.id} />
            </div>
        </div>
    );
}
