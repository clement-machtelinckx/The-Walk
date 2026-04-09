"use client";

import { useEffect, useCallback, useState } from "react";
import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    LogOut, 
    Loader2, 
    Sword, 
    Dice5, 
    FileText, 
    ExternalLink, 
    ChevronRight, 
    ChevronLeft,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { useRouter } from "next/navigation";
import { formatFullDate } from "@/lib/utils/date";
import { PresenceBlock } from "./presence-block";
import { LivechatBlock } from "./livechat-block";
import { NotesHub } from "./notes/notes-hub";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

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
        activeSessions,
        fetchActiveSession
    } = useSessionStore();
    const isGM = myRole === "gm";

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        if (!confirm("Voulez-vous vraiment terminer cette session ? Elle sera clôturée définitivement.")) return;
        const result = await endSession(session.id);
        if (result.success) {
            router.push(`/tables/${tableId}`);
        }
    };

    return (
        <div className="space-y-6 py-2 md:py-4">
            {/* Header plus compact */}
            <header className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 animate-pulse shrink-0 px-1.5 py-0 text-[10px]">LIVE</Badge>
                        <span className="text-muted-foreground text-[10px] font-medium">
                            {formatFullDate(session.started_at || session.created_at)}
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight italic md:text-2xl">{session.title}</h1>
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sidebar Outils (Secondaire) */}
                <div className={cn(
                    "space-y-4 transition-all duration-300 lg:order-2",
                    isSidebarOpen ? "lg:col-span-3" : "lg:col-span-1"
                )}>
                    <div className="flex items-center justify-between">
                        <h3 className={cn(
                            "text-[10px] font-bold tracking-widest uppercase opacity-50",
                            !isSidebarOpen && "hidden lg:block lg:[writing-mode:vertical-lr] lg:rotate-180"
                        )}>
                            Outils & Ressources
                        </h3>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <ChevronRight className="hidden lg:block" /> : <ChevronLeft className="hidden lg:block" />}
                            {isSidebarOpen ? <ChevronUp className="lg:hidden" /> : <ChevronDown className="lg:hidden" />}
                        </Button>
                    </div>

                    {isSidebarOpen && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Button
                                variant="outline"
                                className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 group h-auto w-full border-2 transition-all p-3"
                                asChild
                            >
                                <a href={siteConfig.links.crawl} target="_blank" rel="noopener noreferrer">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 group-hover:bg-primary/20 rounded-full p-2 transition-colors">
                                            <ExternalLink className="text-primary h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold tracking-tight uppercase">The Crawl</p>
                                            <p className="text-[9px] text-muted-foreground">Interface externe</p>
                                        </div>
                                    </div>
                                </a>
                            </Button>

                            <Card className="bg-card/30 border-dashed">
                                <CardHeader className="p-3 pb-1">
                                    <CardTitle className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase opacity-60">
                                        <Sword size={10} className="text-primary" />
                                        Combat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center py-4">
                                    <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase opacity-30">Soon</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-dashed">
                                <CardHeader className="p-3 pb-1">
                                    <CardTitle className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase opacity-60">
                                        <Dice5 size={10} className="text-primary" />
                                        Dés
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center py-4">
                                    <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase opacity-30">Soon</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Main Content (Primaire) */}
                <div className={cn(
                    "space-y-6 lg:order-1 transition-all duration-300",
                    isSidebarOpen ? "lg:col-span-9" : "lg:col-span-11"
                )}>
                    {/* Résumé repliable */}
                    <Card className="bg-primary/5 border-primary/10 overflow-hidden">
                        <CardHeader 
                            className="flex flex-row items-center justify-between cursor-pointer py-2 px-4 border-b bg-background/50 hover:bg-background/80 transition-colors"
                            onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                        >
                            <CardTitle className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary/80">
                                <FileText size={12} />
                                Résumé de session
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                {isSummaryCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </Button>
                        </CardHeader>
                        {!isSummaryCollapsed && (
                            <CardContent className="p-4 animate-in fade-in slide-in-from-top-1 duration-200">
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
        </div>
    );
}
