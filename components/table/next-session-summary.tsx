import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/special/empty-state";
import { formatFullDate } from "@/lib/utils/date";

interface NextSessionSummaryProps {
    tableId: string;
    session: Session | null;
    activeSession?: Session | null;
}

export function NextSessionSummary({ tableId, session, activeSession }: NextSessionSummaryProps) {
    // Priorité à la session active
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
                    <EmptyState
                        title="Aucune session planifiée"
                        description="Préparez votre prochaine rencontre dès maintenant."
                        variant="compact"
                    >
                        <Button variant="link" className="text-primary mt-2" asChild>
                            <Link href={`/tables/${tableId}/session/next`}>
                                Planifier une session
                            </Link>
                        </Button>
                    </EmptyState>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-card/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Calendar size={18} className="text-primary" />
                    Prochaine Session
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="line-clamp-2 text-xl font-bold">{session.title}</h3>
                    {session.description && (
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                            {session.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-primary" />
                        <span className="text-primary/80 font-bold">
                            {formatFullDate(session.scheduled_at)}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                    <Link href={`/tables/${tableId}/session/next`}>
                        Voir le détail
                        <ArrowRight size={16} className="ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
