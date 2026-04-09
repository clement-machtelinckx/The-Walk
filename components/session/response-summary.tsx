"use client";

import { useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, HelpCircle, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponseStatus } from "@/types/session";

interface ResponseSummaryProps {
    sessionId: string;
}

interface PersonDisplay {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
}

export function ResponseSummary({ sessionId }: ResponseSummaryProps) {
    const { responses, fetchSessionResponses } = useSessionStore();
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
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">
                    Récapitulatif de participation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {groups.map((group) => (
                        <div
                            key={group.status}
                            className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                            <span
                                className={cn("mb-1 text-xs font-semibold uppercase", group.color)}
                            >
                                {group.label}
                            </span>
                            <span className="text-2xl font-bold">{group.count}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {groups.map(
                        (group) =>
                            group.people.length > 0 && (
                                <div key={group.status} className="space-y-2">
                                    <div className="flex items-center gap-2 border-b pb-1">
                                        <group.icon className={cn("h-4 w-4", group.color)} />
                                        <h4 className="text-sm font-semibold">{group.label}</h4>
                                        <span className="ml-auto text-xs text-slate-500">
                                            {group.people.length} joueur(s)
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.people.map((person) => (
                                            <Badge
                                                key={person.id}
                                                variant="secondary"
                                                className="border-slate-200 bg-white px-3 py-1 font-normal"
                                            >
                                                {person.display_name || "Anonyme"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ),
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
