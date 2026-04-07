"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, HelpCircle, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponseStatus } from "@/types/session";

interface ResponseBlockProps {
    sessionId: string;
}

export function ResponseBlock({ sessionId }: ResponseBlockProps) {
    const { user } = useAuthStore();
    const { responses, respondToSession } = useSessionStore();
    const [localIsLoading, setLocalIsLoading] = useState(false);

    const summary = responses[sessionId];
    const myResponse = summary?.responses.find((r) => r.user_id === user?.id);
    const currentStatus = myResponse?.status || "pending";

    const handleRespond = async (status: ResponseStatus) => {
        if (status === currentStatus || localIsLoading) return;

        setLocalIsLoading(true);
        try {
            await respondToSession(sessionId, { status });
        } finally {
            setLocalIsLoading(false);
        }
    };

    const options: {
        status: ResponseStatus;
        label: string;
        icon: LucideIcon;
        color: string;
        activeColor: string;
    }[] = [
        {
            status: "going",
            label: "Oui",
            icon: Check,
            color: "text-green-600 border-green-200 bg-green-50 hover:bg-green-100",
            activeColor: "bg-green-600 text-white border-green-600 hover:bg-green-700",
        },
        {
            status: "maybe",
            label: "Peut-être",
            icon: HelpCircle,
            color: "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100",
            activeColor: "bg-amber-600 text-white border-amber-600 hover:bg-amber-700",
        },
        {
            status: "declined",
            label: "Non",
            icon: X,
            color: "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
            activeColor: "bg-red-600 text-white border-red-600 hover:bg-red-700",
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Ta participation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3">
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isActive = currentStatus === option.status;

                        return (
                            <Button
                                key={option.status}
                                variant="outline"
                                className={cn(
                                    "flex h-auto flex-col items-center justify-center gap-2 border-2 px-2 py-4 transition-all",
                                    isActive ? option.activeColor : option.color,
                                )}
                                onClick={() => handleRespond(option.status)}
                                disabled={localIsLoading}
                            >
                                {localIsLoading && isActive ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                                <span className="text-sm font-semibold">{option.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
