"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BellRing,
    ChevronLeft,
    ChevronRight,
    Crosshair,
    Dice5,
    Loader2,
    Pencil,
    Plus,
    RotateCcw,
    Swords,
    Trash2,
    UserPlus,
} from "lucide-react";

import { AvatarCircle } from "@/components/ui/avatar-circle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContextMenuActions, type ContextMenuAction } from "@/components/ui/context-menu-actions";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePolling } from "@/lib/hooks/use-polling";
import { cn } from "@/lib/utils";
import type { InitiativeActionInput } from "@/lib/validators/initiative";
import { useAuthStore } from "@/store/auth-store";
import type { InitiativeEntry, InitiativeSnapshot } from "@/types/initiative";

type InitiativeBlockProps = Readonly<{
    sessionId: string;
    isGM: boolean;
}>;

function entryName(entry: InitiativeEntry) {
    return entry.label || entry.profile?.display_name || "Joueur";
}

function formatModifier(modifier: number) {
    return modifier >= 0 ? `+${modifier}` : String(modifier);
}

export function InitiativeBlock({ sessionId, isGM }: InitiativeBlockProps) {
    const user = useAuthStore((state) => state.user);
    const [initiative, setInitiative] = useState<InitiativeSnapshot | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [myModifier, setMyModifier] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInitiative = useCallback(async () => {
        const response = await fetch(`/api/sessions/${sessionId}/initiative`);
        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Impossible de charger l'initiative.");
            setIsLoading(false);
            return;
        }

        setInitiative(data.initiative);
        setError(null);
        setIsLoading(false);
    }, [sessionId]);

    usePolling(fetchInitiative, { interval: 10000 });

    const runAction = useCallback(
        async (input: InitiativeActionInput) => {
            if (isMutating) return;

            setIsMutating(true);
            setError(null);
            try {
                const response = await fetch(`/api/sessions/${sessionId}/initiative`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                });
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Impossible de mettre à jour l'initiative.");
                    return;
                }

                setInitiative(data.initiative);
            } catch {
                setError("Erreur réseau pendant la mise à jour de l'initiative.");
            } finally {
                setIsMutating(false);
            }
        },
        [isMutating, sessionId],
    );

    const entries = useMemo(() => initiative?.entries || [], [initiative?.entries]);
    const memberEntryIds = useMemo(
        () => new Set(entries.flatMap((entry) => (entry.user_id ? [entry.user_id] : []))),
        [entries],
    );
    const availableMembers = useMemo(
        () =>
            (initiative?.eligible_members || []).filter(
                (member) => !memberEntryIds.has(member.user_id),
            ),
        [initiative?.eligible_members, memberEntryIds],
    );
    const myEntry = entries.find((entry) => entry.user_id === user?.id);
    const hasPendingCustom = entries.some(
        (entry) => entry.participant_type === "custom" && entry.initiative_score === null,
    );
    const hasPendingRequestedMember = entries.some(
        (entry) =>
            entry.participant_type === "member" &&
            entry.initiative_requested_at !== null &&
            entry.initiative_score === null,
    );
    const canRollMyInitiative = Boolean(
        myEntry?.initiative_requested_at && myEntry.initiative_score === null,
    );

    useEffect(() => {
        if (myEntry) setMyModifier(myEntry.initiative_modifier);
    }, [myEntry]);

    const handleAddCustom = () => {
        const label = window.prompt("Nom du participant custom");
        if (!label?.trim()) return;

        const modifierValue = window.prompt("Modificateur d'initiative", "0");
        if (modifierValue === null) return;
        const modifier = Number(modifierValue);

        if (!Number.isInteger(modifier) || modifier < -99 || modifier > 99) {
            setError("Le modificateur doit être un entier entre -99 et 99.");
            return;
        }

        void runAction({ action: "add_custom", label: label.trim(), modifier });
    };

    const handleEditScore = (entry: InitiativeEntry) => {
        const value = window.prompt(
            "Score d'initiative. Laissez vide pour remettre en attente.",
            entry.initiative_score === null ? "" : String(entry.initiative_score),
        );
        if (value === null) return;
        const score = value.trim() === "" ? null : Number(value);

        if (score !== null && (!Number.isInteger(score) || score < -999 || score > 999)) {
            setError("Le score doit être un entier entre -999 et 999.");
            return;
        }

        void runAction({ action: "update_entry", entry_id: entry.id, score });
    };

    const handleEditModifier = (entry: InitiativeEntry) => {
        const value = window.prompt("Modificateur d'initiative", String(entry.initiative_modifier));
        if (value === null) return;
        const modifier = Number(value);

        if (!Number.isInteger(modifier) || modifier < -99 || modifier > 99) {
            setError("Le modificateur doit être un entier entre -99 et 99.");
            return;
        }

        void runAction({ action: "update_entry", entry_id: entry.id, modifier });
    };

    const entryActions = (entry: InitiativeEntry, index: number): ContextMenuAction[] => {
        const isCurrent = initiative?.state?.current_entry_id === entry.id;
        const actions: ContextMenuAction[] = [
            {
                id: "current",
                label: isCurrent ? "Retirer le tour actuel" : "Marquer comme tour actuel",
                icon: Crosshair,
                onSelect: () =>
                    void runAction({
                        action: "set_current",
                        entry_id: isCurrent ? null : entry.id,
                    }),
            },
            {
                id: "score",
                label: "Modifier le score",
                icon: Pencil,
                onSelect: () => handleEditScore(entry),
            },
            {
                id: "modifier",
                label: "Modifier le modificateur",
                icon: Pencil,
                onSelect: () => handleEditModifier(entry),
            },
        ];

        if (entry.participant_type === "custom") {
            actions.push({
                id: "roll",
                label: entry.initiative_score === null ? "Lancer l'initiative" : "Relancer",
                icon: Dice5,
                onSelect: () =>
                    void runAction({
                        action: "roll",
                        entry_id: entry.id,
                    }),
            });
        }

        actions.push(
            {
                id: "up",
                label: "Déplacer à gauche",
                icon: ChevronLeft,
                disabled: index === 0,
                separatorBefore: true,
                onSelect: () =>
                    void runAction({ action: "move", entry_id: entry.id, direction: "up" }),
            },
            {
                id: "down",
                label: "Déplacer à droite",
                icon: ChevronRight,
                disabled: index === entries.length - 1,
                onSelect: () =>
                    void runAction({ action: "move", entry_id: entry.id, direction: "down" }),
            },
            {
                id: "remove",
                label: "Retirer de l'ordre",
                icon: Trash2,
                destructive: true,
                separatorBefore: true,
                onSelect: () => void runAction({ action: "remove", entry_id: entry.id }),
            },
        );

        return actions;
    };

    return (
        <Card className="border-primary/10 bg-primary/5 min-w-0">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                            <Swords className="text-primary h-4 w-4" />
                            Initiative
                        </CardTitle>
                        <p className="text-muted-foreground text-xs">
                            Ordre de tour indicatif, non bloquant.
                        </p>
                    </div>
                    {hasPendingRequestedMember && (
                        <Badge variant="warning" className="gap-1">
                            <BellRing className="size-3" />
                            Initiative demandée
                        </Badge>
                    )}
                </div>

                {isGM && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={() => void runAction({ action: "request" })}
                            disabled={isMutating}
                        >
                            <BellRing />
                            Demander l&apos;initiative
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAddCustom}
                            disabled={isMutating}
                        >
                            <Plus />
                            Participant custom
                        </Button>
                        {hasPendingCustom && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void runAction({ action: "roll_custom_missing" })}
                                disabled={isMutating}
                            >
                                <Dice5 />
                                Lancer les custom en attente
                            </Button>
                        )}
                        {entries.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    if (
                                        confirm("Réinitialiser complètement l'ordre d'initiative ?")
                                    ) {
                                        void runAction({ action: "reset" });
                                    }
                                }}
                                disabled={isMutating}
                            >
                                <RotateCcw />
                                Reset
                            </Button>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isGM && availableMembers.length > 0 && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                            <SelectTrigger className="h-10 min-w-0 flex-1">
                                <SelectValue placeholder="Ajouter un joueur de la table" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMembers.map((member) => (
                                    <SelectItem key={member.user_id} value={member.user_id}>
                                        {member.display_name || "Joueur"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            disabled={!selectedMemberId || isMutating}
                            onClick={() => {
                                void runAction({ action: "add_member", user_id: selectedMemberId });
                                setSelectedMemberId("");
                            }}
                        >
                            <UserPlus />
                            Ajouter
                        </Button>
                    </div>
                )}

                {canRollMyInitiative && myEntry && (
                    <div className="bg-background/70 rounded-md border p-3">
                        <p className="text-sm font-semibold">Votre initiative est demandée</p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <label className="min-w-0 flex-1 space-y-1 text-xs font-medium">
                                Modificateur
                                <Input
                                    type="number"
                                    min={-99}
                                    max={99}
                                    value={myModifier}
                                    onChange={(event) => setMyModifier(Number(event.target.value))}
                                />
                            </label>
                            <Button
                                className="self-end sm:w-auto"
                                disabled={isMutating}
                                onClick={() =>
                                    void runAction({
                                        action: "roll",
                                        entry_id: myEntry.id,
                                        modifier: myModifier,
                                    })
                                }
                            >
                                <Dice5 />
                                Lancer mon initiative
                            </Button>
                        </div>
                    </div>
                )}

                {error && <p className="text-destructive text-xs font-medium">{error}</p>}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="text-primary size-5 animate-spin" />
                    </div>
                ) : entries.length === 0 ? (
                    <p className="text-muted-foreground bg-background/50 rounded-md border border-dashed p-4 text-xs">
                        Aucun participant dans l&apos;ordre d&apos;initiative.
                    </p>
                ) : (
                    <div className="overflow-x-auto pb-2">
                        <ol className="flex min-w-max gap-3">
                            {entries.map((entry, index) => {
                                const isCurrent = initiative?.state?.current_entry_id === entry.id;
                                const isMe = entry.user_id === user?.id;

                                return (
                                    <li
                                        key={entry.id}
                                        className={cn(
                                            "bg-background relative w-40 shrink-0 rounded-lg border p-3 shadow-xs",
                                            isCurrent && "border-primary ring-primary/20 ring-2",
                                            isMe && !isCurrent && "border-primary/40",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <AvatarCircle
                                                avatarKey={entry.profile?.avatar_key}
                                                name={entryName(entry)}
                                                size="lg"
                                            />
                                            {isGM && (
                                                <ContextMenuActions
                                                    actions={entryActions(entry, index)}
                                                    label={`Ouvrir les actions pour ${entryName(entry)}`}
                                                />
                                            )}
                                        </div>
                                        <p className="mt-2 truncate text-sm font-bold">
                                            {entryName(entry)}
                                        </p>
                                        <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                                            {entry.participant_type === "member"
                                                ? "Joueur"
                                                : "Participant custom"}
                                        </p>
                                        <div className="mt-3 flex items-end justify-between gap-2">
                                            <div>
                                                <p className="text-muted-foreground text-[10px] uppercase">
                                                    Score
                                                </p>
                                                <p className="text-primary text-2xl leading-none font-black">
                                                    {entry.initiative_score ?? "—"}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                mod. {formatModifier(entry.initiative_modifier)}
                                            </Badge>
                                        </div>
                                        {isCurrent && (
                                            <Badge className="mt-3 w-full justify-center">
                                                Tour actuel
                                            </Badge>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
