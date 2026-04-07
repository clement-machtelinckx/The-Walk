"use client";

import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import { SessionCard } from "./session-card";
import { SessionForm } from "./session-form";
import { NextSessionEmptyState } from "./next-session-empty-state";
import { ResponseBlock } from "./response-block";
import { ResponseSummary } from "./response-summary";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "@/store/session-store";

interface NextSessionContainerProps {
    tableId: string;
    myRole: string;
}

export function NextSessionContainer({ tableId, myRole }: NextSessionContainerProps) {
    const { nextSessions, isLoadingSession, fetchNextSession, fetchSessionResponses } = useSessionStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const canManage = myRole === "gm";

    const session = nextSessions[tableId];

    useEffect(() => {
        fetchNextSession(tableId);
    }, [tableId, fetchNextSession]);

    useEffect(() => {
        if (session?.id) {
            fetchSessionResponses(session.id);
        }
    }, [session?.id, fetchSessionResponses]);

    const handleSuccess = () => {
        setIsEditing(false);
        setIsCreating(false);
    };

    if (isLoadingSession && session === undefined) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="mx-auto max-w-2xl py-4">
                <h2 className="text-primary/80 mb-6 text-2xl font-bold italic">
                    Planifier une nouvelle session
                </h2>
                <SessionForm
                    tableId={tableId}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </div>
        );
    }

    if (isEditing && session) {
        return (
            <div className="mx-auto max-w-2xl py-4">
                <h2 className="text-primary/80 mb-6 text-2xl font-bold italic">
                    Modifier la session
                </h2>
                <SessionForm
                    tableId={tableId}
                    initialData={session}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    if (!session) {
        return <NextSessionEmptyState canCreate={canManage} onCreate={() => setIsCreating(true)} />;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 py-4">
            <SessionCard session={session} canEdit={canManage} onEdit={() => setIsEditing(true)} />
            
            <div className="grid grid-cols-1 gap-6">
                <ResponseBlock sessionId={session.id} />
                <ResponseSummary sessionId={session.id} />
            </div>
        </div>
    );
}
