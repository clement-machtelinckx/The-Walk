import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, Calendar, Edit, Loader2, Trash2 } from "lucide-react";
import { ContextMenuActions, type ContextMenuAction } from "@/components/ui/context-menu-actions";
import { formatFullDate, isPastDate } from "@/lib/utils/date";
import { SessionDetailsSheet } from "@/components/session/session-details-sheet";
import type { ReactNode } from "react";

type SessionCardProps = Readonly<{
    session: Session;
    canEdit: boolean;
    onEdit?: () => void;
    onCancelSession?: () => void;
    onDeleteSession?: () => void;
    isCancelling?: boolean;
    isDeleting?: boolean;
    rsvp?: ReactNode;
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
    rsvp,
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
        <Card className="border-primary/20 bg-card/50 gap-0 overflow-hidden py-0 shadow-sm">
            <CardHeader className="bg-primary/5 border-primary/10 flex flex-row items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
                <div className="min-w-0 space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                        <Calendar size={12} />
                        Prochaine session
                    </div>
                    <CardTitle className="truncate text-xl font-bold">{session.title}</CardTitle>
                </div>
                <Badge variant={statusConfig.variant} className="shrink-0">
                    {isOverdue ? "Horaire dépassé" : statusConfig.label}
                </Badge>
            </CardHeader>

            <CardContent className="px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                        <Calendar size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Date et heure
                        </p>
                        <p className="truncate text-sm font-bold sm:text-base">
                            {formatFullDate(session.scheduled_at)}
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-muted/20 flex flex-col items-stretch gap-3 border-t px-4 py-3 sm:px-6">
                {rsvp}
                <div className="flex items-center justify-between gap-2">
                    <SessionDetailsSheet session={session} />
                    {canEdit && managementActions.length > 0 && (
                        <ContextMenuActions
                            actions={managementActions}
                            label={`Ouvrir les actions de la session ${session.title}`}
                        />
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
