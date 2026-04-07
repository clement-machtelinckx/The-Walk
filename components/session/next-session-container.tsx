"use client";

import { useState, useEffect } from "react";
import { SessionCard } from "./session-card";
import { SessionForm } from "./session-form";
import { NextSessionEmptyState } from "./next-session-empty-state";
import { ResponseBlock } from "./response-block";
import { ResponseSummary } from "./response-summary";
import { PrechatBlock } from "./prechat-block";
import { Loader2, Settings, Play, ExternalLink } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface NextSessionContainerProps {
    tableId: string;
    myRole: string;
}

export function NextSessionContainer({ tableId, myRole }: NextSessionContainerProps) {
    const { nextSessions, isLoadingSession, fetchNextSession, fetchSessionResponses } =
        useSessionStore();
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
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-4">
            {/* 1. Header & Primary Actions */}
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <SessionCard
                    session={session}
                    canEdit={canManage}
                    onEdit={() => setIsEditing(true)}
                />

                {/* MJ Quick Actions */}
                {canManage && (
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant="secondary" size="sm" asChild className="shadow-sm">
                            <Link href={`/tables/${tableId}/admin`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Admin de table
                            </Link>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="border-0 bg-green-600 text-white shadow-sm hover:bg-green-700"
                        >
                            <Link href={`/tables/${tableId}/session/live`}>
                                <Play className="mr-2 h-4 w-4 fill-current" />
                                Démarrer la session live
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* 2. User RSVP (Personal) */}
            <div className="mx-auto w-full max-w-3xl">
                <ResponseBlock sessionId={session.id} />
            </div>

            {/* 3. The Crawl - External Tool */}
            <div className="mx-auto w-full max-w-3xl">
                <Button
                    variant="outline"
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 group h-14 w-full border-2 transition-all"
                    asChild
                >
                    <a href={siteConfig.links.crawl} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center justify-center gap-3">
                            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
                                <ExternalLink className="text-primary h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm leading-none font-bold tracking-tight uppercase">
                                    Ouvrir The Crawl
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                    Interface de jeu interactive
                                </p>
                            </div>
                        </div>
                    </a>
                </Button>
            </div>

            {/* 4. Insights & Preparation */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <ResponseSummary sessionId={session.id} />
                </div>
                <div className="lg:col-span-3">
                    <PrechatBlock sessionId={session.id} />
                </div>
            </div>
        </div>
    );
}
