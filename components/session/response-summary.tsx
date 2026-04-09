"use client";

import { useCallback, useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, Clock, LucideIcon, ChevronDown, ChevronUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponseStatus } from "@/types/session";

interface ResponseSummaryProps {
    sessionId: string;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

interface PersonDisplay {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
}

/**
 * Récapitulatif de participation (RSVP).
 * Rôle : Information sur qui vient à la session.
 * Peut être rendu repliable pour réduire la densité visuelle.
 */
export function ResponseSummary({ 
    sessionId, 
    collapsible = false,
    defaultExpanded = false 
}: ResponseSummaryProps) {
    const { responses, fetchSessionResponses } = useSessionStore();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const data = responses[sessionId];

    // Polling centralisé pour les réponses (toutes les 30 secondes)
    const fetchFn = useCallback(() => fetchSessionResponses(sessionId), [sessionId, fetchSessionResponses]);
    usePolling(fetchFn, { interval: 30000 });

    if (!data) return null;

    const { summary, responses: activeResponses, non_responders } = data;

    const groups: {
        status: ResponseStatus | "pending";
        label: string;
        count: number;
        icon: LucideIcon;
        color: string;
        people: PersonDisplay[];
    }[] = [
        {
            status: "going",
            label: "Oui",
            count: summary.going,
            icon: Check,
            color: "text-green-600",
            people: activeResponses.filter((r) => r.status === "going").map((r) => r.profiles),
        },
        {
            status: "maybe",
            label: "Peut-être",
            count: summary.maybe,
            icon: HelpCircle,
            color: "text-amber-600",
            people: activeResponses.filter((r) => r.status === "maybe").map((r) => r.profiles),
        },
        {
            status: "declined",
            label: "Non",
            count: summary.declined,
            icon: X,
            color: "text-red-600",
            people: activeResponses.filter((r) => r.status === "declined").map((r) => r.profiles),
        },
        {
            status: "pending",
            label: "En attente",
            count: summary.pending,
            icon: Clock,
            color: "text-slate-400",
            people: non_responders.map((nr) => ({
                id: nr.id,
                display_name: nr.display_name,
                avatar_url: nr.avatar_url,
            })),
        },
    ];

    return (
        <Card className="w-full overflow-hidden border-primary/10">
            <CardHeader 
                className={cn(
                    "pb-3 transition-colors",
                    collapsible && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => collapsible && setIsExpanded(!isExpanded)}
            >
                <CardTitle className="flex items-center justify-between gap-2 text-[10px] font-bold tracking-widest uppercase opacity-70">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-primary" />
                        Participation
                    </div>
                    {collapsible && (
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Résumé toujours visible ou grille compacte */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {groups.map((group) => (
                        <div
                            key={group.status}
                            className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-3"
                        >
                            <span
                                className={cn("mb-1 text-[9px] font-bold uppercase", group.color)}
                            >
                                {group.label}
                            </span>
                            <span className="text-xl font-extrabold">{group.count}</span>
                        </div>
                    ))}
                </div>

                {/* Détails repliables */}
                {(!collapsible || isExpanded) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        {groups.map(
                            (group) =>
                                group.people.length > 0 && (
                                    <div key={group.status} className="space-y-2">
                                        <div className="flex items-center gap-2 border-b pb-1">
                                            <group.icon className={cn("h-3 w-3", group.color)} />
                                            <h4 className="text-[10px] font-bold uppercase tracking-tight">{group.label}</h4>
                                            <span className="ml-auto text-[10px] text-slate-500">
                                                {group.people.length} joueur(s)
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {group.people.map((person) => (
                                                <Badge
                                                    key={person.id}
                                                    variant="secondary"
                                                    className="border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium"
                                                >
                                                    {person.display_name || "Anonyme"}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ),
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
