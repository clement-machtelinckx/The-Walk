import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFullDate } from "@/lib/utils/date";

interface SessionCardProps {
    session: Session;
    canEdit: boolean;
    onEdit?: () => void;
}

const statusConfigs = {
    scheduled: { label: "Planifiée", variant: "default" as const },
    active: { label: "En cours", variant: "success" as const },
    completed: { label: "Terminée", variant: "secondary" as const },
    cancelled: { label: "Annulée", variant: "destructive" as const },
};

export function SessionCard({ session, canEdit, onEdit }: SessionCardProps) {
    const statusConfig = statusConfigs[session.status];

    return (
        <Card className="border-primary/20 bg-card/50 overflow-hidden shadow-sm">
            <CardHeader className="bg-primary/5 border-primary/10 flex flex-row items-center justify-between border-b py-4">
                <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                        <Calendar size={12} />
                        Prochaine Session
                    </div>
                    <CardTitle className="text-2xl font-bold">{session.title}</CardTitle>
                </div>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="bg-muted/50 flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Date et Heure
                        </p>
                        <p className="text-lg font-bold">{formatFullDate(session.scheduled_at)}</p>
                    </div>
                </div>

                {session.description && (
                    <div className="space-y-2">
                        <div className="text-primary flex items-center gap-2 text-sm font-bold italic">
                            <FileText size={16} />
                            Notes de session
                        </div>
                        <div className="bg-background border-primary/5 text-muted-foreground rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {session.description}
                        </div>
                    </div>
                )}
            </CardContent>

            {canEdit && (
                <CardFooter className="bg-muted/20 border-t py-3">
                    <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier la session
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
