"use client";

import { useState, useCallback, useEffect } from "react";
import type React from "react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, Loader2, Check, Clock, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceStatus, PresenceSummary, RollCallMember } from "@/types/session";

type PresenceBlockProps = Readonly<{
    sessionId: string;
    isGM: boolean;
}>;

const STATUS_ITEMS: Array<{
    key: keyof Omit<PresenceSummary, "total">;
    label: string;
    shortLabel: string;
    icon: typeof Check;
    className: string;
}> = [
    {
        key: "present",
        label: "Présents",
        shortLabel: "P",
        icon: Check,
        className: "text-green-600",
    },
    {
        key: "late",
        label: "Retards",
        shortLabel: "R",
        icon: Clock,
        className: "text-amber-600",
    },
    {
        key: "absent",
        label: "Absents",
        shortLabel: "A",
        icon: X,
        className: "text-red-600",
    },
];

function PresenceSummaryInline({ summary }: { summary: PresenceSummary }) {
    return (
        <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="text-foreground shrink-0 font-bold">
                {summary.total} joueur{summary.total > 1 ? "s" : ""}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
                {STATUS_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <span
                            key={item.key}
                            className={cn(
                                "bg-background/70 flex h-7 min-w-8 items-center justify-center gap-1 rounded-md border px-1.5 font-bold",
                                item.className,
                            )}
                            title={`${item.label} : ${summary[item.key]}`}
                        >
                            <Icon className="h-3 w-3" />
                            <span>{summary[item.key]}</span>
                            <span className="sr-only">{item.label}</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function getPresenceStatusLabel(summary: PresenceSummary) {
    if (summary.absent > 0) {
        return `${summary.absent} absent${summary.absent > 1 ? "s" : ""}`;
    }

    if (summary.late > 0) {
        return `${summary.late} retard${summary.late > 1 ? "s" : ""}`;
    }

    return "Tous présents";
}

export function PresenceRollCallDialog({
    sessionId,
    trigger,
}: {
    sessionId: string;
    trigger: React.ReactNode;
}) {
    const { presenceData, fetchPresence, savePresence, isLoadingPresence, isSavingPresence } =
        useSessionStore();
    const [isOpen, setIsOpen] = useState(false);
    const [localPresences, setLocalPresences] = useState<RollCallMember[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);

    const data = presenceData[sessionId];
    const rollCall = data?.rollCall || [];

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setLocalError(null);
            setLocalPresences(rollCall);
        } else {
            setLocalError(null);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        let isCurrent = true;

        fetchPresence(sessionId).then((freshData) => {
            if (!isCurrent) return;
            setLocalPresences(freshData?.rollCall || []);
        });

        return () => {
            isCurrent = false;
        };
    }, [fetchPresence, isOpen, sessionId]);

    const handleStatusChange = (userId: string, status: PresenceStatus) => {
        setLocalPresences((prev) => prev.map((p) => (p.user_id === userId ? { ...p, status } : p)));
    };

    const handleSave = async () => {
        setLocalError(null);
        const payload = {
            presences: localPresences.map((p) => ({
                user_id: p.user_id,
                status: p.status,
            })),
        };
        const res = await savePresence(sessionId, payload);
        if (res.success) {
            setIsOpen(false);
        } else {
            setLocalError(res.error || "Une erreur est survenue lors de l'enregistrement.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-[425px]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="text-primary" />
                        Appel de session
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-grow space-y-6 overflow-y-auto px-6 py-2">
                    {localError && (
                        <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-md border p-3 text-xs font-medium">
                            <AlertCircle size={14} />
                            {localError}
                        </div>
                    )}
                    {isLoadingPresence && localPresences.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="text-primary/50 h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        localPresences.map((member) => (
                            <div
                                key={member.user_id}
                                className="space-y-3 border-b pb-4 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold">
                                        {(member.display_name || "??")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm leading-none font-bold">
                                            {member.display_name || "Anonyme"}
                                        </p>
                                        {member.rsvp_status === "going" && (
                                            <p className="mt-1 text-[10px] font-medium text-green-600">
                                                A répondu &quot;Oui&quot; au RSVP
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <RadioGroup
                                    value={member.status}
                                    onValueChange={(val) =>
                                        handleStatusChange(member.user_id, val as PresenceStatus)
                                    }
                                    className="grid grid-cols-3 gap-2"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="present"
                                            id={`present-${member.user_id}`}
                                            className="sr-only"
                                        />
                                        <Label
                                            htmlFor={`present-${member.user_id}`}
                                            className={cn(
                                                "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 p-2 text-center text-[10px] font-bold tracking-tight uppercase transition-all",
                                                member.status === "present"
                                                    ? "border-green-600 bg-green-50 text-green-700"
                                                    : "bg-muted/50 hover:bg-muted border-transparent",
                                            )}
                                        >
                                            Présent
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="late"
                                            id={`late-${member.user_id}`}
                                            className="sr-only"
                                        />
                                        <Label
                                            htmlFor={`late-${member.user_id}`}
                                            className={cn(
                                                "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 p-2 text-center text-[10px] font-bold tracking-tight uppercase transition-all",
                                                member.status === "late"
                                                    ? "border-amber-600 bg-amber-50 text-amber-700"
                                                    : "bg-muted/50 hover:bg-muted border-transparent",
                                            )}
                                        >
                                            En retard
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="absent"
                                            id={`absent-${member.user_id}`}
                                            className="sr-only"
                                        />
                                        <Label
                                            htmlFor={`absent-${member.user_id}`}
                                            className={cn(
                                                "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 p-2 text-center text-[10px] font-bold tracking-tight uppercase transition-all",
                                                member.status === "absent"
                                                    ? "border-red-600 bg-red-50 text-red-700"
                                                    : "bg-muted/50 hover:bg-muted border-transparent",
                                            )}
                                        >
                                            Absent
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        className="w-full"
                        onClick={handleSave}
                        disabled={isSavingPresence || localPresences.length === 0}
                    >
                        {isSavingPresence ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        Enregistrer l&apos;appel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function PresenceBlock({ sessionId, isGM }: PresenceBlockProps) {
    const { presenceData, fetchPresence } = useSessionStore();

    const data = presenceData[sessionId];
    const summary = data?.summary;

    const fetchFn = useCallback(
        () => fetchPresence(sessionId).then(() => undefined),
        [sessionId, fetchPresence],
    );
    usePolling(fetchFn, { interval: 20000 });

    if (!summary) {
        return isGM ? (
            <PresenceRollCallDialog
                sessionId={sessionId}
                trigger={
                    <Button variant="outline" size="sm" className="border-primary/20 h-8 gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Appel
                    </Button>
                }
            />
        ) : null;
    }

    const statusLabel = getPresenceStatusLabel(summary);

    return (
        <div className="bg-muted/25 flex max-w-full flex-wrap items-center gap-2 rounded-md border px-2 py-1.5">
            <PresenceSummaryInline summary={summary} />
            <span className="text-muted-foreground hidden text-[10px] font-semibold whitespace-nowrap uppercase sm:inline">
                {statusLabel}
            </span>
            {isGM && (
                <PresenceRollCallDialog
                    sessionId={sessionId}
                    trigger={
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/20 h-7 gap-1.5 px-2 text-xs"
                        >
                            <Users className="h-3.5 w-3.5" />
                            Appel
                        </Button>
                    }
                />
            )}
        </div>
    );
}
