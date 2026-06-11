"use client";

import { useCallback, useMemo } from "react";
import { useSessionStore } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { MessageThread } from "@/components/session/message-thread";

type TableDiscussionBlockProps = Readonly<{
    tableId: string;
    sessionId?: string;
    context?: "table" | "live";
}>;

export function TableDiscussionBlock({
    tableId,
    sessionId,
    context = "table",
}: TableDiscussionBlockProps) {
    const { user } = useAuthStore();
    const {
        discussions,
        fetchDiscussionMessages,
        sendDiscussionMessage,
        isLoadingDiscussion,
        isSendingDiscussionMessage,
    } = useSessionStore();

    const discussion = discussions[tableId];
    const messages = useMemo(
        () =>
            (discussion?.data || []).map((message) => ({
                id: message.id,
                content: message.content,
                createdAt: message.created_at,
                isMine: message.user_id === user?.id,
                authorName: message.profiles?.display_name || "Anonyme",
            })),
        [discussion?.data, user?.id],
    );

    const fetchMessages = useCallback(() => {
        return fetchDiscussionMessages(tableId);
    }, [fetchDiscussionMessages, tableId]);

    usePolling(fetchMessages, {
        interval: context === "live" ? 5000 : 10000,
        enabled: Boolean(tableId),
    });

    return (
        <Card className="border-primary/20 w-full gap-0 overflow-hidden py-0 shadow-sm">
            <CardHeader className="bg-primary/5 flex flex-col items-start justify-between gap-4 border-b px-4 py-4 sm:flex-row sm:px-6">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="text-primary h-5 w-5" />
                        Discussion de table
                    </CardTitle>
                    <CardDescription className="max-w-2xl leading-relaxed">
                        {context === "live"
                            ? "Le fil principal de la table continue pendant le live."
                            : "Le fil principal pour échanger avec toute la table."}
                    </CardDescription>
                </div>
                <Badge variant={context === "live" ? "success" : "outline"} className="shrink-0">
                    {context === "live" ? "Live en cours" : "Fil principal"}
                </Badge>
            </CardHeader>

            <CardContent className="p-0">
                <MessageThread
                    messages={messages}
                    isLoading={isLoadingDiscussion}
                    isSending={isSendingDiscussionMessage}
                    emptyMessage="Aucun message pour le moment. Ce fil accompagne la table avant et pendant le live."
                    placeholder="Écrire à la table..."
                    sendLabel="Envoyer le message à la table"
                    onSend={(content) => sendDiscussionMessage(tableId, content, sessionId)}
                />
            </CardContent>
        </Card>
    );
}
