"use client";

import { useEffect, useState } from "react";
import { useSessionStore, type SessionReminderSummary } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, ArrowRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { formatFullDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ContextMenuActions, type ContextMenuAction } from "@/components/ui/context-menu-actions";
import { SessionDetailsSheet } from "@/components/session/session-details-sheet";

type NextSessionAdminBlockProps = Readonly<{
    tableId: string;
}>;

const statusLabels = {
    scheduled: "Planifiée",
    active: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
};

/**
 * Résumé informatif de la prochaine session dans l'espace admin.
 * Les outils, le RSVP et le pilotage live restent sur la table ou dans le drawer dédié.
 */
export function NextSessionAdminBlock({ tableId }: NextSessionAdminBlockProps) {
    const { nextSessions, isLoadingSession, fetchNextSession, sendSessionReminder } =
        useSessionStore();
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderSummary, setReminderSummary] = useState<SessionReminderSummary | null>(null);
    const [reminderError, setReminderError] = useState<string | null>(null);

    const session = nextSessions[tableId];

    useEffect(() => {
        fetchNextSession(tableId);
    }, [tableId, fetchNextSession]);

    const handleSendReminder = async () => {
        if (!session || session.status !== "scheduled") {
            return;
        }

        setIsSendingReminder(true);
        setReminderSummary(null);
        setReminderError(null);

        const result = await sendSessionReminder(session.id);
        if (result.success && result.summary) {
            setReminderSummary(result.summary);
        } else {
            setReminderError(result.error || "Impossible d'envoyer le rappel email.");
        }
        setIsSendingReminder(false);
    };

    const sessionActions: ContextMenuAction[] =
        session?.status === "scheduled"
            ? [
                  {
                      id: "reminder",
                      label: isSendingReminder ? "Envoi du rappel..." : "Envoyer un rappel email",
                      icon: isSendingReminder ? Loader2 : Mail,
                      iconClassName: isSendingReminder ? "animate-spin" : undefined,
                      onSelect: handleSendReminder,
                      disabled: isSendingReminder,
                  },
              ]
            : [];

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
                        <Link href={`/tables/${tableId}`}>Planifier la session suivante</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-card gap-0 overflow-hidden py-0">
            <CardHeader className="bg-primary/5 border-b px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Résumé admin
                        </p>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Calendar size={18} className="text-primary" />
                            Prochaine session
                        </CardTitle>
                    </div>
                    <Badge
                        variant={session.status === "active" ? "success" : "outline"}
                        className="bg-background"
                    >
                        {statusLabels[session.status]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <h3 className="truncate text-lg leading-tight font-bold">
                            {session.title}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                            <Calendar className="h-4 w-4 shrink-0" />
                            {formatFullDate(session.scheduled_at)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <SessionDetailsSheet session={session} />
                        <Button size="sm" className="shrink-0" asChild>
                            <Link href={`/tables/${tableId}`}>
                                Ouvrir sur la table
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <ContextMenuActions
                            actions={sessionActions}
                            label={`Ouvrir les actions de la session ${session.title}`}
                        />
                    </div>
                </div>
                {reminderSummary && (
                    <div className="text-primary border-primary/20 bg-primary/10 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                            Rappel envoyé : {reminderSummary.sent} email(s),{" "}
                            {reminderSummary.failed} échec(s), {reminderSummary.skipped} ignoré(s).
                        </span>
                    </div>
                )}
                {reminderError && (
                    <div className="text-destructive border-destructive/20 bg-destructive/10 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        <span>{reminderError}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
