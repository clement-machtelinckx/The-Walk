"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/session-store";
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
import { PresenceStatus, RollCallMember } from "@/types/session";

interface PresenceBlockProps {
    sessionId: string;
    isGM: boolean;
}

export function PresenceBlock({ sessionId, isGM }: PresenceBlockProps) {
    const {
        presenceData,
        fetchPresence,
        savePresence,
        isLoadingPresence,
        isSavingPresence,
    } = useSessionStore();
    const [isOpen, setIsOpen] = useState(false);
    const [localPresences, setLocalPresences] = useState<RollCallMember[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);

    const data = presenceData[sessionId];
    const rollCall = data?.rollCall || [];
    const summary = data?.summary;

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setLocalError(null);
            fetchPresence(sessionId);
        }
    };

    // Synchroniser localPresences avec rollCall quand les données arrivent
    const [lastFetchedSessionId, setLastFetchedSessionId] = useState<string | null>(null);

    if (rollCall.length > 0 && lastFetchedSessionId !== sessionId) {
        setLocalPresences(rollCall);
        setLastFetchedSessionId(sessionId);
    }

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

    if (!isGM) {
        // Pour les joueurs, on affiche juste un petit résumé si les données existent
        if (!summary) return null;
        return (
            <div className="bg-muted/30 flex items-center gap-4 rounded-lg border px-4 py-2 text-xs">
                <span className="text-muted-foreground font-bold tracking-wider uppercase">
                    Présences :
                </span>
                <div className="flex gap-3">
                    <span className="flex items-center gap-1 font-medium text-green-600">
                        <Check size={12} /> {summary.present}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                        <Clock size={12} /> {summary.late}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-red-600">
                        <X size={12} /> {summary.absent}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary/20 gap-2">
                    <Users size={16} />
                    Faire l&apos;appel
                    {summary && (
                        <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            {summary.present}/{summary.total}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-[425px]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="text-primary" />
                        Appel de session
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-grow space-y-6 overflow-y-auto px-6 py-2">
                    {localError && (
                        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border border-destructive/20 p-3 text-xs font-medium">
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
