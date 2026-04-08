"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, ArrowRight } from "lucide-react";
import { formatShortDate } from "@/lib/utils/date";
import { ResponseSummary } from "@/components/session/response-summary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface NextSessionAdminBlockProps {
    tableId: string;
}

export function NextSessionAdminBlock({ tableId }: NextSessionAdminBlockProps) {
    const {
        nextSessions,
        isLoadingSession,
        fetchNextSession,
        fetchSessionResponses,
    } = useSessionStore();

    const session = nextSessions[tableId];

    useEffect(() => {
        fetchNextSession(tableId);
    }, [tableId, fetchNextSession]);

    useEffect(() => {
        if (session?.id) {
            fetchSessionResponses(session.id);
        }
    }, [session?.id, fetchSessionResponses]);

    if (isLoadingSession && !session) {
        return (
            <Card className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (!session) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="mb-4 text-sm text-muted-foreground italic">
                        Aucune session planifiée pour le moment.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            Planifier la première session
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border-primary/20 bg-card">
                <CardHeader className="bg-primary/5 py-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-md font-bold">
                            <Calendar size={18} className="text-primary" />
                            Prochaine session
                        </CardTitle>
                        <Badge variant="outline" className="bg-background">
                            {formatShortDate(session.scheduled_at)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{session.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {session.description || "Pas de description."}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 text-primary" asChild>
                            <Link href={`/tables/${tableId}/session/next`}>
                                Gérer
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ResponseSummary sessionId={session.id} />
        </div>
    );
}
