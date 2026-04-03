"use client";

import { useState, useEffect, useCallback } from "react";
import { Session } from "@/types/session";
import { SessionCard } from "./session-card";
import { SessionForm } from "./session-form";
import { NextSessionEmptyState } from "./next-session-empty-state";
import { Loader2 } from "lucide-react";

interface NextSessionContainerProps {
    tableId: string;
    myRole: string;
}

export function NextSessionContainer({ tableId, myRole }: NextSessionContainerProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const canManage = myRole === "gm";

    const fetchNextSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions/next`);
            const data = await res.json();
            if (res.ok) {
                setSession(data.session);
            }
        } catch (err) {
            console.error("Failed to fetch next session");
        } finally {
            setIsLoading(false);
        }
    }, [tableId]);

    useEffect(() => {
        fetchNextSession();
    }, [fetchNextSession]);

    const handleSuccess = (newSession: Session) => {
        setSession(newSession);
        setIsEditing(false);
        setIsCreating(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isCreating || (canManage && !session && isEditing)) {
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
        <div className="mx-auto max-w-3xl py-4">
            <SessionCard session={session} canEdit={canManage} onEdit={() => setIsEditing(true)} />
        </div>
    );
}
