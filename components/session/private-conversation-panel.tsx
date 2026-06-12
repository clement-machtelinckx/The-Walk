"use client";

import { useCallback, useMemo } from "react";
import { usePolling } from "@/lib/hooks/use-polling";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";
import { MessageThread } from "@/components/session/message-thread";

type PrivateConversationPanelProps = Readonly<{
    tableId: string;
    sessionId?: string;
    recipientUserId: string;
    recipientName: string;
}>;

export function PrivateConversationPanel({
    tableId,
    sessionId,
    recipientUserId,
    recipientName,
}: PrivateConversationPanelProps) {
    const { user } = useAuthStore();
    const {
        privateMessages,
        fetchPrivateMessages,
        sendPrivateMessage,
        isLoadingPrivateMessages,
        isSendingPrivateMessage,
    } = useSessionStore();
    const conversationKey = `${tableId}:${recipientUserId}`;
    const conversation = privateMessages[conversationKey];
    const isSelfConversation = user?.id === recipientUserId;
    const messages = useMemo(
        () =>
            (conversation?.data || []).map((message) => ({
                id: message.id,
                content: message.content,
                createdAt: message.created_at,
                isMine: message.sender_user_id === user?.id,
            })),
        [conversation?.data, user?.id],
    );

    const fetchMessages = useCallback(() => {
        if (isSelfConversation) return Promise.resolve();
        return fetchPrivateMessages(tableId, recipientUserId);
    }, [fetchPrivateMessages, isSelfConversation, recipientUserId, tableId]);

    usePolling(fetchMessages, {
        interval: 8000,
        enabled: Boolean(tableId && recipientUserId && !isSelfConversation),
    });

    if (isSelfConversation) {
        return (
            <div className="bg-muted/30 rounded-md border border-dashed p-3">
                <p className="text-xs font-bold">Conversation privée</p>
                <p className="text-muted-foreground mt-1 text-[11px]">
                    Sélectionnez un autre membre pour ouvrir un MP.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="bg-muted/25 border-b p-3">
                <p className="text-xs font-bold tracking-wide uppercase">MP de table</p>
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                    Conversation avec {recipientName}
                </p>
            </div>

            <MessageThread
                messages={messages}
                isLoading={isLoadingPrivateMessages}
                isSending={isSendingPrivateMessage}
                emptyMessage="Aucun MP pour le moment."
                placeholder="Écrire un MP..."
                sendLabel={`Envoyer un message privé à ${recipientName}`}
                onSend={(content) =>
                    sendPrivateMessage(tableId, recipientUserId, content, sessionId)
                }
                variant="compact"
            />
        </div>
    );
}
