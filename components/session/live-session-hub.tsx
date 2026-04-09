"use client";

import { useEffect, useCallback } from "react";
import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, Sword, Dice5, FileText, ExternalLink } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { useRouter } from "next/navigation";
import { formatFullDate } from "@/lib/utils/date";
import { PresenceBlock } from "./presence-block";
import { LivechatBlock } from "./livechat-block";
import { PersonalNoteBlock } from "./notes/personal-note-block";
import { GroupNoteBlock } from "./notes/group-note-block";
import { siteConfig } from "@/config/site";

interface LiveSessionHubProps {
    session: Session;
    tableId: string;
    myRole: string;
}

export function LiveSessionHub({ session, tableId, myRole }: LiveSessionHubProps) {
    const router = useRouter();
    const { 
        endSession, 
        isEndingSession, 
        fetchPresence,
        activeSessions,
        fetchActiveSession
    } = useSessionStore();
    const isGM = myRole === "gm";

    // Polling centralisé pour vérifier l'état de la session (toutes les 30s)
    const checkSessionStatus = useCallback(async () => {
        await fetchActiveSession(tableId);
        const currentActive = activeSessions[tableId];
        
        // Si la session n'est plus active dans le store après le fetch, on redirige
        // (Sauf si c'est nous qui venons de la fermer, mais le store sera déjà à jour)
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
        <div className="space-y-8 py-4">
            <header className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 animate-pulse">LIVE</Badge>
                        <span className="text-muted-foreground text-sm font-medium">
                            Lancé le {formatFullDate(session.started_at || session.created_at)}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight italic">{session.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <PresenceBlock sessionId={session.id} isGM={isGM} />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tables/${tableId}`)}
                        className="shadow-sm"
                    >
                        Quitter le live
                    </Button>
                    {isGM && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndSession}
                            disabled={isEndingSession}
                            className="shadow-md"
                        >
                            {isEndingSession ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                            )}
                            Clôturer la session
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Sidebar Outils */}
                <div className="space-y-6 lg:col-span-1 order-2 lg:order-1">
                    <Button
                        variant="outline"
                        className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 group h-auto w-full border-2 transition-all p-4"
                        asChild
                    >
                        <a href={siteConfig.links.crawl} target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="bg-primary/10 group-hover:bg-primary/20 rounded-full p-3 transition-colors">
                                    <ExternalLink className="text-primary h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold tracking-tight uppercase">
                                        Ouvrir The Crawl
                                    </p>
                                    <p className="text-muted-foreground text-[10px] mt-1">
                                        Interface interactive
                                    </p>
                                </div>
                            </div>
                        </a>
                    </Button>

                    <Card className="bg-card/50 border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-70">
                                <Sword size={12} className="text-primary" />
                                SUIVI COMBAT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center py-6">
                            <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase opacity-40">
                                Prochainement
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-70">
                                <Dice5 size={12} className="text-primary" />
                                LANCER DE DÉS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center py-6">
                            <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase opacity-40">
                                Prochainement
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="space-y-6 lg:col-span-3 order-1 lg:order-2">
                    <Card className="bg-primary/5 border-primary/10 overflow-hidden">
                        <CardHeader className="pb-2 border-b bg-background/50">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-primary/80">
                                <FileText size={14} />
                                RÉSUMÉ / OBJECTIFS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-foreground text-sm leading-relaxed">
                                {session.description || "Aucun objectif défini pour cette session."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <PersonalNoteBlock sessionId={session.id} />
                        <GroupNoteBlock sessionId={session.id} isGM={isGM} />
                    </div>

                    <div className="pt-4">
                        <LivechatBlock sessionId={session.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
