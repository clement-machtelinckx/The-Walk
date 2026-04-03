import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/special/empty-state";

interface NextSessionSummaryProps {
    tableId: string;
    session: Session | null;
}

export function NextSessionSummary({ tableId, session }: NextSessionSummaryProps) {
    if (!session) {
        return (
            <Card className="bg-card/50 h-full border-dashed">
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
        <Card className="border-primary/20 bg-card/50 h-full">
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
                        <span className="font-medium">
                            {session.scheduled_at
                                ? format(new Date(session.scheduled_at), "eeee d MMMM", {
                                      locale: fr,
                                  })
                                : "Date non fixée"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-primary" />
                        <span className="font-medium">
                            {session.scheduled_at
                                ? format(new Date(session.scheduled_at), "HH:mm", { locale: fr })
                                : "Heure non fixée"}
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
