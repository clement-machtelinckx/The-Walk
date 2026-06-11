"use client";

import { useState } from "react";
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    AlertCircle,
    Calendar,
    ArrowRight,
    Loader2,
    MessageSquare,
    Play,
    Plus,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/special/empty-state";
import { SessionForm } from "@/components/session/session-form";
import { ResponseBlock } from "@/components/session/response-block";
import { ResponseSummary } from "@/components/session/response-summary";
import { TableDiscussionBlock } from "@/components/session/table-discussion-block";
import { SessionCard } from "@/components/session/session-card";
import { TableRole } from "@/types/table";
import { useSessionStore } from "@/store/session-store";
import { useRouter } from "next/navigation";

type NextSessionSummaryProps = Readonly<{
    tableId: string;
    session: Session | null;
    activeSession?: Session | null;
    myRole: TableRole;
}>;

/**
 * Hub de préparation intégré à la page table.
 * Regroupe planification, RSVP, synthèse et discussion avant le live.
 */
export function NextSessionSummary({
    tableId,
    session: initialSession,
    activeSession,
    myRole,
}: NextSessionSummaryProps) {
    const router = useRouter();
    const {
        startSession,
        cancelSession,
        deleteSession,
        isStartingSession,
        isCancellingSession,
        isDeletingSession,
    } = useSessionStore();
    const [session, setSession] = useState(initialSession);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const canManage = myRole === "gm";

    const handleStartSession = async () => {
        if (!session || !confirm("Voulez-vous vraiment démarrer cette session ?")) return;

        const result = await startSession(session.id);
        if (result.success && result.session) {
            router.push(`/tables/${tableId}/session/live/${result.session.id}`);
            return;
        }

        setActionError(result.error || "Impossible de démarrer la session.");
    };

    const handleCancelSession = async () => {
        if (
            !session ||
            !confirm("Annuler cette session ? Elle restera visible dans l'historique de la table.")
        )
            return;

        const result = await cancelSession(session.id);
        if (result.success) {
            setSession(null);
            setActionError(null);
            return;
        }

        setActionError(result.error || "Impossible d'annuler la session.");
    };

    const handleDeleteSession = async () => {
        if (
            !session ||
            !confirm(
                "Supprimer définitivement cette session ? Cette action est réservée aux sessions créées par erreur et sans activité.",
            )
        )
            return;

        const result = await deleteSession(session.id);
        if (result.success) {
            setSession(null);
            setActionError(null);
            return;
        }

        setActionError(result.error || "Impossible de supprimer la session.");
    };

    // Priorité à la session active : Navigation vers le live
    if (activeSession) {
        return (
            <Card className="border-green-600/30 bg-green-50/30 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-green-700">
                        <Play size={18} className="fill-current" />
                        Session en cours
                    </CardTitle>
                    <Badge className="animate-pulse bg-green-600">LIVE</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h3 className="line-clamp-2 text-xl font-extrabold text-green-900">
                        {activeSession.title}
                    </h3>
                    <p className="text-sm text-green-800/70 italic">
                        La session a démarré. Rejoignez la table !
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-green-600 shadow-sm hover:bg-green-700" asChild>
                        <Link href={`/tables/${tableId}/session/live/${activeSession.id}`}>
                            Rejoindre le Live
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (!session) {
        return (
            <Card className="bg-card/50 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Calendar size={18} className="text-muted-foreground" />
                        Prochaine Session
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isCreating ? (
                        <SessionForm
                            tableId={tableId}
                            onSuccess={(createdSession) => {
                                setSession(createdSession);
                                setIsCreating(false);
                            }}
                            onCancel={() => setIsCreating(false)}
                        />
                    ) : (
                        <EmptyState
                            title="Aucune session planifiée"
                            description={
                                canManage
                                    ? "Planifiez la prochaine rencontre directement depuis la table."
                                    : "Le MJ n'a pas encore planifié la prochaine rencontre."
                            }
                            variant="compact"
                        >
                            {canManage && (
                                <Button className="mt-3" onClick={() => setIsCreating(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Planifier une session
                                </Button>
                            )}
                        </EmptyState>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (isEditing) {
        return (
            <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                    <CardTitle>Modifier la prochaine session</CardTitle>
                </CardHeader>
                <CardContent>
                    <SessionForm
                        tableId={tableId}
                        initialData={session}
                        onSuccess={(updatedSession) => {
                            setSession(updatedSession);
                            setIsEditing(false);
                            setActionError(null);
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <SessionCard
                session={session}
                canEdit={canManage}
                onEdit={() => setIsEditing(true)}
                onCancelSession={handleCancelSession}
                onDeleteSession={handleDeleteSession}
                isCancelling={isCancellingSession}
                isDeleting={isDeletingSession}
            />

            {actionError && (
                <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                    <AlertCircle size={16} />
                    <span>{actionError}</span>
                </div>
            )}

            {canManage && (
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleStartSession}
                        disabled={isStartingSession}
                        className="w-full max-w-sm bg-green-600 font-bold text-white hover:bg-green-700"
                    >
                        {isStartingSession ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-5 w-5 fill-current" />
                        )}
                        Démarrer la session live
                    </Button>
                </div>
            )}

            <Card className="border-primary/20 bg-card/50 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg">Préparer avec la table</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <section className="space-y-4" aria-labelledby="table-session-participation">
                        <div className="space-y-1">
                            <h3
                                id="table-session-participation"
                                className="flex items-center gap-2 font-bold"
                            >
                                <Users className="text-primary h-4 w-4" />
                                Participation
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Confirmez votre présence et consultez les réponses du groupe.
                            </p>
                        </div>
                        <ResponseBlock sessionId={session.id} />
                        <ResponseSummary
                            sessionId={session.id}
                            collapsible
                            defaultExpanded={false}
                        />
                    </section>

                    <section className="space-y-4" aria-labelledby="table-session-discussion">
                        <div className="space-y-1">
                            <h3
                                id="table-session-discussion"
                                className="flex items-center gap-2 font-bold"
                            >
                                <MessageSquare className="text-primary h-4 w-4" />
                                Discussion de préparation
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Échangez avec la table avant de lancer la session.
                            </p>
                        </div>
                        <TableDiscussionBlock sessionId={session.id} />
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
