"use client";

import { useEffect } from "react";
import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, MessageSquare, Sword, Dice5, FileText } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { useRouter } from "next/navigation";
import { formatFullDate } from "@/lib/utils/date";
import { PresenceBlock } from "./presence-block";

interface LiveSessionHubProps {
    session: Session;
    tableId: string;
    myRole: string;
}

export function LiveSessionHub({ session, tableId, myRole }: LiveSessionHubProps) {
    const router = useRouter();
    const { endSession, isEndingSession, fetchPresence } = useSessionStore();
    const isGM = myRole === "gm";

    useEffect(() => {
        fetchPresence(session.id);
    }, [session.id, fetchPresence]);

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
                        <Badge className="bg-green-600">LIVE</Badge>
                        <span className="text-muted-foreground text-sm">
                            {formatFullDate(session.started_at)}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{session.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <PresenceBlock sessionId={session.id} isGM={isGM} />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tables/${tableId}`)}
                    >
                        Quitter le live
                    </Button>
                    {isGM && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndSession}
                            disabled={isEndingSession}
                        >
                            {isEndingSession ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                            )}
                            Terminer la session
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <FileText size={16} className="text-primary" />
                            NOTES DE SESSION
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm italic">
                            {session.description || "Aucune description fournie."}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <Sword size={16} className="text-primary" />
                            SUIVI COMBAT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Bientôt disponible
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <Dice5 size={16} className="text-primary" />
                            LANCER DE DÉS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Bientôt disponible
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted/30 rounded-xl border p-10 text-center">
                <MessageSquare className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
                <h3 className="text-lg font-bold">Chat Live</h3>
                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                    Le chat en temps réel sera implémenté dans le prochain ticket. Utilisez le
                    pré-chat pour le moment.
                </p>
            </div>
        </div>
    );
}
