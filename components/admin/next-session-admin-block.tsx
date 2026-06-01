"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, ArrowRight } from "lucide-react";
import { formatShortDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface NextSessionAdminBlockProps {
    tableId: string;
}

/**
 * Bloc d'information sur la prochaine session dans l'espace Admin.
 * Rôle : Structural / Informatif uniquement.
 * N'est PAS le cockpit de préparation (RSVP/Prechat/Start sont sur la page Préparation).
 */
export function NextSessionAdminBlock({ tableId }: NextSessionAdminBlockProps) {
    const { nextSessions, isLoadingSession, fetchNextSession } = useSessionStore();

    const session = nextSessions[tableId];

    useEffect(() => {
        fetchNextSession(tableId);
    }, [tableId, fetchNextSession]);

    if (isLoadingSession && !session) {
        return (
            <Card className="flex h-32 items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </Card>
        );
    }

    if (!session) {
        return (
            <Card className="bg-muted/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="text-muted-foreground/50 mb-2 h-8 w-8" />
                    <p className="text-muted-foreground mb-4 text-sm italic">
                        Aucune session planifiée pour le moment.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            Accéder à la préparation
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 py-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2 font-bold">
                        <Calendar size={18} className="text-primary" />
                        Session planifiée
                    </CardTitle>
                    <Badge variant="outline" className="bg-background">
                        {formatShortDate(session.scheduled_at)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg leading-tight font-bold">{session.title}</h3>
                        <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                            {session.description || "Pas de description."}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            Gérer la préparation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
