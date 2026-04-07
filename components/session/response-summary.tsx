"use client";

import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, HelpCircle, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionResponseWithProfile, ResponseStatus } from "@/types/session";

interface ResponseSummaryProps {
    sessionId: string;
}

export function ResponseSummary({ sessionId }: ResponseSummaryProps) {
    const { responses } = useSessionStore();
    const data = responses[sessionId];

    if (!data) return null;

    const { summary, responses: allResponses, non_responders } = data;

    const groups: {
        status: ResponseStatus | "pending";
        label: string;
        count: number;
        icon: LucideIcon;
        color: string;
        people: (Partial<SessionResponseWithProfile> & { profiles: any })[];
    }[] = [
        {
            status: "going",
            label: "Oui",
            count: summary.going,
            icon: Check,
            color: "text-green-600",
            people: allResponses.filter((r) => r.status === "going"),
        },
        {
            status: "maybe",
            label: "Peut-être",
            count: summary.maybe,
            icon: HelpCircle,
            color: "text-amber-600",
            people: allResponses.filter((r) => r.status === "maybe"),
        },
        {
            status: "declined",
            label: "Non",
            count: summary.declined,
            icon: X,
            color: "text-red-600",
            people: allResponses.filter((r) => r.status === "declined"),
        },
        {
            status: "pending",
            label: "En attente",
            count: summary.pending,
            icon: Clock,
            color: "text-slate-400",
            people: non_responders.map((nr) => ({ profiles: nr })),
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
                {/* Stats cards */}
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

                {/* Detailed lists */}
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
                                        {group.people.map((p, idx) => (
                                            <Badge
                                                key={p.profiles?.id || idx}

                                                variant="secondary"
                                                className="border-slate-200 bg-white px-3 py-1 font-normal"
                                            >
                                                {p.profiles?.display_name || "Anonyme"}
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
