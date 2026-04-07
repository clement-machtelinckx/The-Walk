"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, History, Calendar } from "lucide-react";
import { formatShortDate } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";

interface SessionHistoryProps {
    tableId: string;
}

export function SessionHistory({ tableId }: SessionHistoryProps) {
    const { sessionHistories, fetchSessionHistory, isLoadingHistory } = useSessionStore();
    const history = sessionHistories[tableId] || [];

    useEffect(() => {
        fetchSessionHistory(tableId);
    }, [tableId, fetchSessionHistory]);

    if (isLoadingHistory && history.length === 0) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="text-primary/50 h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <History size={18} className="text-primary" />
                        Historique des sessions
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <History size={40} className="mb-4 opacity-20" />
                    <p className="text-sm italic">Aucune session terminée pour le moment.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <History size={18} className="text-primary" />
                    Historique des sessions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {history.map((item) => (
                    <div
                        key={item.session.id}
                        className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold tracking-tight">{item.session.title}</h3>
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                    Terminée
                                </Badge>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                <Calendar size={12} />
                                {formatShortDate(item.session.ended_at || item.session.updated_at)}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t pt-3 sm:border-t-0 sm:pt-0">
                            {item.presenceSummary ? (
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold">{item.presenceSummary.present}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-medium">Présents</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="text-xs font-bold">{item.presenceSummary.late}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-medium">Retards</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-xs font-bold">{item.presenceSummary.absent}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-medium">Absents</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-[10px] italic">Appel non enregistré</span>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
