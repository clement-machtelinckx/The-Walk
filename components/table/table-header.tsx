"use client";

import { useState, useEffect } from "react";
import { TableRole } from "@/types/table";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, Play, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/special/role-badge";
import { useRouter } from "next/navigation";
import { useTableStore } from "@/store/table-store";
import { useSessionStore } from "@/store/session-store";

interface TableHeaderProps {
    tableId: string;
    name: string;
    description: string | null;
    myRole: TableRole;
}

export function TableHeader({ tableId, name, description, myRole }: TableHeaderProps) {
    const router = useRouter();
    const { leaveTable } = useTableStore();
    const {
        activeSessions,
        nextSessions,
        fetchActiveSession,
        fetchNextSession,
        startSession,
        isStartingSession,
    } = useSessionStore();
    const [isLeaving, setIsLeaving] = useState(false);

    const activeSession = activeSessions[tableId];
    const nextSession = nextSessions[tableId];

    useEffect(() => {
        fetchActiveSession(tableId);
        fetchNextSession(tableId);
    }, [tableId, fetchActiveSession, fetchNextSession]);

    const handleLeaveTable = async () => {
        const confirmMessage =
            myRole === "gm"
                ? "Êtes-vous sûr de vouloir quitter cette table ? En tant que MJ, assurez-vous qu'il reste un autre MJ actif."
                : "Êtes-vous sûr de vouloir quitter cette table ?";

        if (!confirm(confirmMessage)) return;

        setIsLeaving(true);
        const result = await leaveTable(tableId);

        if (result.success) {
            router.push("/tables");
            router.refresh();
        } else {
            alert(result.error || "Une erreur est survenue.");
            setIsLeaving(false);
        }
    };

    const handleStartLive = async () => {
        if (!nextSession?.id) return;
        if (!confirm("Voulez-vous démarrer cette session et rejoindre le Live ?")) return;

        const res = await startSession(nextSession.id);
        if (res.success && res.session) {
            router.push(`/tables/${tableId}/session/live/${res.session.id}`);
        }
    };

    return (
        <div className="space-y-4 border-b pb-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-primary/80 text-3xl font-bold tracking-tight italic">
                            {name}
                        </h1>
                        <RoleBadge role={myRole} />
                    </div>
                    {description && (
                        <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {myRole === "gm" && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/tables/${tableId}/admin`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Gestion
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Sessions
                        </Link>
                    </Button>

                    {/* Bouton LIVE dynamique */}
                    {activeSession ? (
                        <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                            <Link href={`/tables/${tableId}/session/live/${activeSession.id}`}>
                                <Play className="mr-2 h-4 w-4 fill-current" />
                                LIVE
                            </Link>
                        </Button>
                    ) : myRole === "gm" && nextSession ? (
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={handleStartLive}
                            disabled={isStartingSession}
                        >
                            {isStartingSession ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4 fill-current" />
                            )}
                            LANCER LIVE
                        </Button>
                    ) : null}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={handleLeaveTable}
                        disabled={isLeaving}
                    >
                        {isLeaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Quitter
                    </Button>
                </div>
            </div>
        </div>
    );
}
