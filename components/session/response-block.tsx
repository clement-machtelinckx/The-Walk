"use client";

import { useSessionStore } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserResponseStatus } from "@/lib/validators/session";

type ResponseBlockProps = Readonly<{
    sessionId: string;
}>;

export function ResponseBlock({ sessionId }: ResponseBlockProps) {
    const { user } = useAuthStore();
    const { responses, respondToSession, isResponding } = useSessionStore();

    const summary = responses[sessionId];
    const myResponse = summary?.responses.find((r) => r.user_id === user?.id);
    const currentStatus = myResponse?.status || "pending";

    const handleRespond = async (status: UserResponseStatus) => {
        if (status === currentStatus || isResponding) return;
        await respondToSession(sessionId, { status });
    };

    const options: {
        status: UserResponseStatus;
        label: string;
        icon: LucideIcon;
        color: string;
        activeColor: string;
    }[] = [
        {
            status: "going",
            label: "Présent",
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
            label: "Absent",
            icon: X,
            color: "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
            activeColor: "bg-red-600 text-white border-red-600 hover:bg-red-700",
        },
    ];

    return (
        <div className="space-y-2">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Ta participation
            </p>
            <div className="grid grid-cols-3 gap-2">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isActive = currentStatus === option.status;
                    const isThisLoading = isResponding && isActive;

                    return (
                        <Button
                            key={option.status}
                            variant="outline"
                            size="sm"
                            aria-pressed={isActive}
                            className={cn(
                                "min-w-0 gap-1 px-2 text-xs transition-all",
                                isActive ? option.activeColor : option.color,
                            )}
                            onClick={() => handleRespond(option.status)}
                            disabled={isResponding}
                        >
                            {isThisLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Icon className="h-3.5 w-3.5" />
                            )}
                            <span className="truncate">{option.label}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
