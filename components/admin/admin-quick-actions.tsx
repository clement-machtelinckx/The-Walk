"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Calendar, Play, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { useSessionStore } from "@/store/session-store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AdminQuickActionsProps {
    tableId: string;
    hasActiveSession: boolean;
    hasPendingSession: boolean;
    activeSessionId?: string;
    pendingSessionId?: string;
}

export function AdminQuickActions({
    tableId,
    hasActiveSession,
    hasPendingSession,
    activeSessionId,
    pendingSessionId,
}: AdminQuickActionsProps) {
    const { startSession, isStartingSession } = useSessionStore();
    const router = useRouter();

    const handleStartSession = async () => {
        if (!pendingSessionId) return;
        if (!confirm("Voulez-vous vraiment démarrer cette session ?")) return;

        const result = await startSession(pendingSessionId);
        if (result.success && result.session) {
            router.push(`/tables/${tableId}/session/live/${result.session.id}`);
        }
    };

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Zap size={18} className="text-primary fill-primary/20" />
                    Actions rapides MJ
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {hasActiveSession ? (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 shadow-md h-12 text-sm font-bold"
                            asChild
                        >
                            <Link href={`/tables/${tableId}/session/live/${activeSessionId}`}>
                                <Play size={18} className="mr-2 fill-current" />
                                Rejoindre le Live
                            </Link>
                        </Button>
                    ) : hasPendingSession ? (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 shadow-md h-12 text-sm font-bold"
                            onClick={handleStartSession}
                            disabled={isStartingSession}
                        >
                            {isStartingSession ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Play size={18} className="mr-2 fill-current" />
                            )}
                            Démarrer la session
                        </Button>
                    ) : (
                        <Button className="w-full h-12 text-sm font-bold" asChild>
                            <Link href={`/tables/${tableId}/session/next`}>
                                <Calendar size={18} className="mr-2" />
                                Planifier une session
                            </Link>
                        </Button>
                    )}

                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href={`/tables/${tableId}`}>
                            <ExternalLink size={18} className="mr-2" />
                            Voir la table
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            <Calendar size={18} className="mr-2" />
                            Gérer la session
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href="#members">
                            <UserPlus size={18} className="mr-2" />
                            Gérer les membres
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
