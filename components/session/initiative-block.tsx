"use client";

import { type FormEvent, useCallback, useMemo, useRef, useState } from "react";
import {
    BellRing,
    Check,
    ChevronDown,
    ChevronUp,
    Crosshair,
    Dice5,
    Loader2,
    Pencil,
    Plus,
    RotateCcw,
    Swords,
    Trash2,
    UserPlus,
    X,
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
import { useAuthStore } from "@/store/auth-store";
import { useInitiativeStore } from "@/store/initiative-store";
import type { InitiativeEntry } from "@/types/initiative";

type InitiativeBlockProps = Readonly<{
    sessionId: string;
    isGM: boolean;
}>;

type EntryEdit = {
    entryId: string;
    field: "score" | "modifier";
    value: string;
};

function entryName(entry: InitiativeEntry) {
    return entry.label || entry.profile?.display_name || "Joueur";
}

function formatModifier(modifier: number) {
    return modifier >= 0 ? `+${modifier}` : String(modifier);
}

export function InitiativeBlock({ sessionId, isGM }: InitiativeBlockProps) {
    const user = useAuthStore((state) => state.user);
    const initiative = useInitiativeStore((state) => state.initiatives[sessionId] || null);
    const isLoading = useInitiativeStore((state) => state.isLoading);
    const isMutating = useInitiativeStore((state) => state.isMutating);
    const storeError = useInitiativeStore((state) => state.error);
    const fetchInitiative = useInitiativeStore((state) => state.fetchInitiative);
    const requestInitiative = useInitiativeStore((state) => state.requestInitiative);
    const addMember = useInitiativeStore((state) => state.addMember);
    const addCustomParticipant = useInitiativeStore((state) => state.addCustomParticipant);
    const rollInitiative = useInitiativeStore((state) => state.rollInitiative);
    const rollCustomMissing = useInitiativeStore((state) => state.rollCustomMissing);
    const updateEntry = useInitiativeStore((state) => state.updateEntry);
    const moveEntry = useInitiativeStore((state) => state.moveEntry);
    const setCurrent = useInitiativeStore((state) => state.setCurrent);
    const removeEntry = useInitiativeStore((state) => state.removeEntry);
    const reset = useInitiativeStore((state) => state.reset);
    const clearStoreError = useInitiativeStore((state) => state.clearError);

    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [myModifierOverride, setMyModifierOverride] = useState<number | null>(null);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customLabel, setCustomLabel] = useState("");
    const [customModifier, setCustomModifier] = useState("0");
    const [entryEdit, setEntryEdit] = useState<EntryEdit | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const customLabelInputRef = useRef<HTMLInputElement>(null);

    const refreshInitiative = useCallback(
        () => fetchInitiative(sessionId),
        [fetchInitiative, sessionId],
    );

    usePolling(refreshInitiative, { interval: 10000, enabled: !isMutating });

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
    const myModifier = myModifierOverride ?? myEntry?.initiative_modifier ?? 0;
    const error = localError || storeError;

    const clearErrors = () => {
        setLocalError(null);
        clearStoreError();
    };

    const handleAddCustom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();

        const label = customLabel.trim();
        const modifier = Number(customModifier);

        if (!label) {
            setLocalError("Le nom du participant est requis.");
            return;
        }
        if (!Number.isInteger(modifier) || modifier < -99 || modifier > 99) {
            setLocalError("Le modificateur doit être un entier entre -99 et 99.");
            return;
        }

        const result = await addCustomParticipant(sessionId, label, modifier);
        if (result.success) {
            setCustomLabel("");
            setCustomModifier("0");
            customLabelInputRef.current?.focus();
        }
    };

    const handleEntryEdit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!entryEdit) return;
        clearErrors();

        if (entryEdit.field === "score") {
            const score = entryEdit.value.trim() === "" ? null : Number(entryEdit.value);
            if (score !== null && (!Number.isInteger(score) || score < -999 || score > 999)) {
                setLocalError("Le score doit être un entier entre -999 et 999.");
                return;
            }

            const result = await updateEntry(sessionId, entryEdit.entryId, { score });
            if (result.success) setEntryEdit(null);
            return;
        }

        const modifier = Number(entryEdit.value);
        if (!Number.isInteger(modifier) || modifier < -99 || modifier > 99) {
            setLocalError("Le modificateur doit être un entier entre -99 et 99.");
            return;
        }

        const result = await updateEntry(sessionId, entryEdit.entryId, { modifier });
        if (result.success) setEntryEdit(null);
    };

    const entryActions = (entry: InitiativeEntry, index: number): ContextMenuAction[] => {
        const isCurrent = initiative?.state?.current_entry_id === entry.id;
        const actions: ContextMenuAction[] = [
            {
                id: "current",
                label: isCurrent ? "Retirer le tour actuel" : "Marquer comme tour actuel",
                icon: Crosshair,
                onSelect: () => void setCurrent(sessionId, isCurrent ? null : entry.id),
            },
            {
                id: "score",
                label: "Modifier le score",
                icon: Pencil,
                onSelect: () =>
                    setEntryEdit({
                        entryId: entry.id,
                        field: "score",
                        value:
                            entry.initiative_score === null ? "" : String(entry.initiative_score),
                    }),
            },
            {
                id: "modifier",
                label: "Modifier le modificateur",
                icon: Pencil,
                onSelect: () =>
                    setEntryEdit({
                        entryId: entry.id,
                        field: "modifier",
                        value: String(entry.initiative_modifier),
                    }),
            },
        ];

        if (entry.participant_type === "custom") {
            actions.push({
                id: "roll",
                label: entry.initiative_score === null ? "Lancer l'initiative" : "Relancer",
                icon: Dice5,
                onSelect: () => void rollInitiative(sessionId, entry.id),
            });
        }

        actions.push(
            {
                id: "up",
                label: "Monter dans l'ordre",
                icon: ChevronUp,
                disabled: index === 0,
                separatorBefore: true,
                onSelect: () => void moveEntry(sessionId, entry.id, "up"),
            },
            {
                id: "down",
                label: "Descendre dans l'ordre",
                icon: ChevronDown,
                disabled: index === entries.length - 1,
                onSelect: () => void moveEntry(sessionId, entry.id, "down"),
            },
            {
                id: "remove",
                label: "Retirer de l'ordre",
                icon: Trash2,
                destructive: true,
                separatorBefore: true,
                onSelect: () => void removeEntry(sessionId, entry.id),
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
                            onClick={() => void requestInitiative(sessionId)}
                            disabled={isMutating}
                        >
                            <BellRing />
                            Demander l&apos;initiative
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                clearErrors();
                                setIsAddingCustom((current) => !current);
                            }}
                            disabled={isMutating}
                        >
                            <Plus />
                            Ajouter
                        </Button>
                        {hasPendingCustom && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void rollCustomMissing(sessionId)}
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
                                        void reset(sessionId);
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
                {isGM && isAddingCustom && (
                    <form
                        onSubmit={handleAddCustom}
                        className="bg-background/70 grid gap-2 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]"
                    >
                        <label className="space-y-1 text-xs font-medium">
                            Nom
                            <Input
                                autoFocus
                                ref={customLabelInputRef}
                                maxLength={80}
                                placeholder="Gobelin 1"
                                value={customLabel}
                                onChange={(event) => setCustomLabel(event.target.value)}
                            />
                        </label>
                        <label className="space-y-1 text-xs font-medium">
                            Modificateur
                            <Input
                                type="number"
                                min={-99}
                                max={99}
                                value={customModifier}
                                onChange={(event) => setCustomModifier(event.target.value)}
                            />
                        </label>
                        <div className="flex items-end gap-1">
                            <Button type="submit" size="sm" disabled={isMutating}>
                                <Check />
                                Ajouter
                            </Button>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Annuler l'ajout"
                                onClick={() => setIsAddingCustom(false)}
                            >
                                <X />
                            </Button>
                        </div>
                    </form>
                )}

                {isGM && availableMembers.length > 0 && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                            <SelectTrigger className="h-9 min-w-0 flex-1">
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
                            size="sm"
                            variant="outline"
                            disabled={!selectedMemberId || isMutating}
                            onClick={async () => {
                                const result = await addMember(sessionId, selectedMemberId);
                                if (result.success) setSelectedMemberId("");
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
                                    onChange={(event) =>
                                        setMyModifierOverride(Number(event.target.value))
                                    }
                                />
                            </label>
                            <Button
                                className="self-end sm:w-auto"
                                disabled={isMutating}
                                onClick={() =>
                                    void rollInitiative(sessionId, myEntry.id, myModifier)
                                }
                            >
                                <Dice5 />
                                Lancer mon initiative
                            </Button>
                        </div>
                    </div>
                )}

                {error && <p className="text-destructive text-xs font-medium">{error}</p>}

                {isLoading && !initiative ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="text-primary size-5 animate-spin" />
                    </div>
                ) : entries.length === 0 ? (
                    <p className="text-muted-foreground bg-background/50 rounded-md border border-dashed p-4 text-xs">
                        Aucun participant dans l&apos;ordre d&apos;initiative.
                    </p>
                ) : (
                    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {entries.map((entry, index) => {
                            const isCurrent = initiative?.state?.current_entry_id === entry.id;
                            const isMe = entry.user_id === user?.id;
                            const isEditing = entryEdit?.entryId === entry.id;

                            return (
                                <li
                                    key={entry.id}
                                    className={cn(
                                        "bg-background min-w-0 rounded-md border p-2.5 shadow-xs",
                                        isCurrent && "border-primary ring-primary/20 ring-2",
                                        isMe && !isCurrent && "border-primary/40",
                                    )}
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <AvatarCircle
                                            avatarKey={entry.profile?.avatar_key}
                                            name={entryName(entry)}
                                            size="md"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <p className="truncate text-sm font-bold">
                                                    {entryName(entry)}
                                                </p>
                                                {isCurrent && (
                                                    <Badge className="shrink-0 px-1.5 py-0 text-[9px]">
                                                        Tour actuel
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                                                {entry.participant_type === "member"
                                                    ? "Joueur"
                                                    : "Custom"}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-primary text-xl leading-none font-black">
                                                    {entry.initiative_score ?? "—"}
                                                </p>
                                                <p className="text-muted-foreground text-[10px]">
                                                    mod. {formatModifier(entry.initiative_modifier)}
                                                </p>
                                            </div>
                                            {isGM && (
                                                <ContextMenuActions
                                                    actions={entryActions(entry, index)}
                                                    label={`Ouvrir les actions pour ${entryName(entry)}`}
                                                    triggerClassName="size-8"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && entryEdit && (
                                        <form
                                            onSubmit={handleEntryEdit}
                                            className="mt-2 flex items-end gap-1 border-t pt-2"
                                        >
                                            <label className="min-w-0 flex-1 space-y-1 text-[11px] font-medium">
                                                {entryEdit.field === "score"
                                                    ? "Score (vide = attente)"
                                                    : "Modificateur"}
                                                <Input
                                                    autoFocus
                                                    type="number"
                                                    min={entryEdit.field === "score" ? -999 : -99}
                                                    max={entryEdit.field === "score" ? 999 : 99}
                                                    value={entryEdit.value}
                                                    onChange={(event) =>
                                                        setEntryEdit({
                                                            ...entryEdit,
                                                            value: event.target.value,
                                                        })
                                                    }
                                                    className="h-8"
                                                />
                                            </label>
                                            <Button
                                                type="submit"
                                                size="icon-sm"
                                                aria-label="Valider la modification"
                                                disabled={isMutating}
                                            >
                                                <Check />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon-sm"
                                                variant="ghost"
                                                aria-label="Annuler la modification"
                                                onClick={() => setEntryEdit(null)}
                                            >
                                                <X />
                                            </Button>
                                        </form>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}
