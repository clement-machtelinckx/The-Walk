"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionCard } from "./session-card";
import { SessionForm } from "./session-form";
import { NextSessionEmptyState } from "./next-session-empty-state";
import { ResponseBlock } from "./response-block";
import { ResponseSummary } from "./response-summary";
import { PrechatBlock } from "./prechat-block";
import { Loader2, Settings, Play, ExternalLink } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface NextSessionContainerProps {
    tableId: string;
    myRole: string;
}

export function NextSessionContainer({ tableId, myRole }: NextSessionContainerProps) {
    const router = useRouter();
    const {
        nextSessions,
        activeSessions,
        isLoadingSession,
        isLoadingActiveSession,
        fetchNextSession,
        fetchActiveSession,
        fetchSessionResponses,
        startSession,
        isStartingSession,
    } = useSessionStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const canManage = myRole === "gm";

    const session = nextSessions[tableId];
    const activeSession = activeSessions[tableId];

    // Polling centralisé pour l'état de la session (toutes les 30s)
    const refreshSessions = useCallback(async () => {
        await Promise.all([
            fetchNextSession(tableId),
            fetchActiveSession(tableId)
        ]);
    }, [tableId, fetchNextSession, fetchActiveSession]);

    usePolling(refreshSessions, { interval: 30000 });

    const handleSuccess = () => {
        setIsEditing(false);
        setIsCreating(false);
    };

    const handleStartSession = async () => {
        if (!session?.id) return;
        if (!confirm("Voulez-vous vraiment démarrer cette session ?")) return;

        const result = await startSession(session.id);
        if (result.success && result.session) {
            router.push(`/tables/${tableId}/session/live/${result.session.id}`);
        }
    };

    if (
        (isLoadingSession || isLoadingActiveSession) &&
        session === undefined &&
        activeSession === undefined
    ) {
        return (
            <div className="flex justify-center py-20" role="status">
                <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="mx-auto max-w-2xl py-4">
                <h2 className="text-primary/80 mb-6 text-2xl font-bold italic">
                    Planifier une nouvelle session
                </h2>
                <SessionForm
                    tableId={tableId}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </div>
        );
    }

    if (isEditing && session) {
        return (
            <div className="mx-auto max-w-2xl py-4">
                <h2 className="text-primary/80 mb-6 text-2xl font-bold italic">
                    Modifier la session
                </h2>
                <SessionForm
                    tableId={tableId}
                    initialData={session}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    if (!session && !activeSession) {
        return <NextSessionEmptyState canCreate={canManage} onCreate={() => setIsCreating(true)} />;
    }

    // Si une session est déjà active, on affiche un HUB live prioritaire
    if (activeSession) {
        return (
            <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
                <div className="space-y-4 text-center">
                    <Badge className="animate-pulse bg-green-600 px-4 py-1 text-sm hover:bg-green-600">
                        Session en cours
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {activeSession.title}
                    </h1>
                    <p className="text-muted-foreground">
                        La session a démarré ! Rejoignez les autres joueurs sur le hub live.
                    </p>
                </div>

                <Card className="overflow-hidden border-2 border-green-600/20 shadow-lg">
                    <CardContent className="flex flex-col items-center gap-6 p-8">
                        <div className="rounded-full bg-green-100 p-4">
                            <Play className="h-12 w-12 fill-current text-green-600" />
                        </div>
                        <Button
                            size="lg"
                            className="h-16 w-full bg-green-600 text-xl shadow-lg hover:bg-green-700"
                            asChild
                        >
                            <Link href={`/tables/${tableId}/session/live/${activeSession.id}`}>
                                Rejoindre le Live
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <div className="border-t pt-10">
                    <p className="text-muted-foreground mb-4 text-center text-sm">
                        Besoin d&apos;autre chose ?
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/tables/${tableId}`}>Retour à la table</Link>
                        </Button>
                        {canManage && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/tables/${tableId}/admin`}>Admin table</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-4">
            {/* 1. Header & Primary Actions */}
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <SessionCard
                    session={session!}
                    canEdit={canManage}
                    onEdit={() => setIsEditing(true)}
                />

                {/* MJ Primary Action */}
                {canManage && (
                    <div className="flex justify-center">
                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleStartSession}
                            disabled={isStartingSession}
                            className="h-14 w-full max-w-sm border-0 bg-green-600 text-xl font-bold text-white shadow-lg hover:bg-green-700 sm:w-auto sm:px-12"
                        >
                            {isStartingSession ? (
                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            ) : (
                                <Play className="mr-3 h-6 w-6 fill-current" />
                            )}
                            Démarrer la session live
                        </Button>
                    </div>
                )}
            </div>

            {/* 2. User RSVP (Personal) */}
            <div className="mx-auto w-full max-w-3xl">
                <ResponseBlock sessionId={session!.id} />
            </div>

            {/* 3. Insights & Preparation */}
            <div className="mx-auto w-full max-w-3xl space-y-8">
                <ResponseSummary sessionId={session!.id} collapsible defaultExpanded={false} />
                <PrechatBlock sessionId={session!.id} />
            </div>
        </div>
    );
}
