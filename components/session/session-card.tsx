import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, Calendar, Edit, FileText, Loader2, Trash2 } from "lucide-react";
import { ContextMenuActions, type ContextMenuAction } from "@/components/ui/context-menu-actions";
import { formatFullDate, isPastDate } from "@/lib/utils/date";

type SessionCardProps = Readonly<{
    session: Session;
    canEdit: boolean;
    onEdit?: () => void;
    onCancelSession?: () => void;
    onDeleteSession?: () => void;
    isCancelling?: boolean;
    isDeleting?: boolean;
}>;

const statusConfigs = {
    scheduled: { label: "Planifiée", variant: "default" as const },
    active: { label: "En cours", variant: "success" as const },
    completed: { label: "Terminée", variant: "secondary" as const },
    cancelled: { label: "Annulée", variant: "destructive" as const },
};

export function SessionCard({
    session,
    canEdit,
    onEdit,
    onCancelSession,
    onDeleteSession,
    isCancelling,
    isDeleting,
}: SessionCardProps) {
    const statusConfig = statusConfigs[session.status];
    const canManageScheduled = canEdit && session.status === "scheduled";
    const isOverdue = session.status === "scheduled" && isPastDate(session.scheduled_at);
    const isManaging = Boolean(isCancelling || isDeleting);
    const managementActions: ContextMenuAction[] = [];

    if (onEdit) {
        managementActions.push({
            id: "edit",
            label: "Modifier la session",
            icon: Edit,
            onSelect: onEdit,
            disabled: isManaging,
        });
    }

    if (canManageScheduled && onCancelSession) {
        managementActions.push({
            id: "cancel",
            label: isCancelling ? "Annulation en cours..." : "Annuler la session",
            icon: isCancelling ? Loader2 : Ban,
            iconClassName: isCancelling ? "animate-spin" : undefined,
            onSelect: onCancelSession,
            disabled: isManaging,
            separatorBefore: managementActions.length > 0,
        });
    }

    if (canManageScheduled && onDeleteSession) {
        managementActions.push({
            id: "delete",
            label: isDeleting ? "Suppression en cours..." : "Supprimer la session",
            icon: isDeleting ? Loader2 : Trash2,
            iconClassName: isDeleting ? "animate-spin" : undefined,
            onSelect: onDeleteSession,
            disabled: isManaging,
            destructive: true,
        });
    }

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
                <Badge variant={statusConfig.variant}>
                    {isOverdue ? "Horaire dépassé" : statusConfig.label}
                </Badge>
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
                            Description
                        </div>
                        <div className="bg-background border-primary/5 text-muted-foreground rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {session.description}
                        </div>
                    </div>
                )}
            </CardContent>

            {canEdit && managementActions.length > 0 && (
                <CardFooter className="bg-muted/20 flex justify-end border-t py-2">
                    <ContextMenuActions
                        actions={managementActions}
                        label={`Ouvrir les actions de la session ${session.title}`}
                    />
                </CardFooter>
            )}
        </Card>
    );
}
