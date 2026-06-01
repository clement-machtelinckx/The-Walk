"use client";

import { useCallback, useMemo, useState } from "react";
import { Dice5, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePolling } from "@/lib/hooks/use-polling";
import { ALLOWED_DICE_TYPES } from "@/lib/validators/dice";
import { DiceRollLog } from "@/types/dice";
import { cn } from "@/lib/utils";

interface DiceLogBlockProps {
    sessionId: string;
}

function formatFormula(roll: Pick<DiceRollLog, "quantity" | "dice_type" | "modifier">) {
    const base = `${roll.quantity > 1 ? roll.quantity : ""}d${roll.dice_type}`;
    if (roll.modifier > 0) return `${base} + ${roll.modifier}`;
    if (roll.modifier < 0) return `${base} - ${Math.abs(roll.modifier)}`;
    return base;
}

function formatTime(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function DiceLogBlock({ sessionId }: DiceLogBlockProps) {
    const [diceType, setDiceType] = useState("20");
    const [quantity, setQuantity] = useState(1);
    const [modifier, setModifier] = useState(0);
    const [rolls, setRolls] = useState<DiceRollLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRolling, setIsRolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formulaPreview = useMemo(
        () =>
            formatFormula({
                quantity,
                dice_type: Number(diceType),
                modifier,
            }),
        [diceType, modifier, quantity],
    );

    const fetchRolls = useCallback(async () => {
        const response = await fetch(`/api/sessions/${sessionId}/dice`);
        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Impossible de charger les lancers.");
            return;
        }

        setRolls(data.rolls || []);
        setIsLoading(false);
        setError(null);
    }, [sessionId]);

    usePolling(fetchRolls, { interval: 10000 });

    const handleRoll = async () => {
        if (isRolling) return;

        setIsRolling(true);
        setError(null);

        try {
            const response = await fetch(`/api/sessions/${sessionId}/dice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dice_type: Number(diceType),
                    quantity,
                    modifier,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Le lancer a échoué.");
                return;
            }

            setRolls((current) => [
                data.roll,
                ...current.filter((roll) => roll.id !== data.roll.id),
            ]);
        } catch {
            setError("Erreur réseau pendant le lancer.");
        } finally {
            setIsRolling(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-muted/30 space-y-3 rounded-md border p-3">
                <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-xs font-medium">
                        Dé
                        <Select value={diceType} onValueChange={setDiceType}>
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ALLOWED_DICE_TYPES.map((value) => (
                                    <SelectItem key={value} value={String(value)}>
                                        d{value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </label>

                    <label className="space-y-1 text-xs font-medium">
                        Quantité
                        <Input
                            type="number"
                            min={1}
                            max={20}
                            value={quantity}
                            onChange={(event) => setQuantity(Number(event.target.value))}
                            className="h-10"
                        />
                    </label>
                </div>

                <label className="space-y-1 text-xs font-medium">
                    Modificateur
                    <Input
                        type="number"
                        min={-999}
                        max={999}
                        value={modifier}
                        onChange={(event) => setModifier(Number(event.target.value))}
                        className="h-10"
                    />
                </label>

                <Button onClick={handleRoll} disabled={isRolling} className="w-full gap-2">
                    {isRolling ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Dice5 className="size-4" />
                    )}
                    Lancer {formulaPreview}
                </Button>

                {error && <p className="text-destructive text-xs">{error}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase">Journal</h4>
                    {isLoading && <Loader2 className="text-muted-foreground size-3 animate-spin" />}
                </div>

                {rolls.length === 0 && !isLoading ? (
                    <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                        Aucun lancer pour cette session.
                    </p>
                ) : (
                    <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                        {rolls.map((roll) => (
                            <article
                                key={roll.id}
                                className="bg-background rounded-md border p-3 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold">
                                            {roll.profiles?.display_name || "Anonyme"}
                                        </p>
                                        <p className="text-muted-foreground text-[11px]">
                                            {formatTime(roll.created_at)} · {formatFormula(roll)}
                                        </p>
                                    </div>
                                    <div className="text-primary text-xl font-black">
                                        {roll.total}
                                    </div>
                                </div>
                                <p
                                    className={cn(
                                        "text-muted-foreground mt-2 text-[11px]",
                                        roll.rolls.length > 8 && "break-all",
                                    )}
                                >
                                    Résultats: {roll.rolls.join(", ")}
                                    {roll.modifier !== 0 && ` · mod. ${roll.modifier}`}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
