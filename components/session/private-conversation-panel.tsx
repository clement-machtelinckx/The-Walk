"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePolling } from "@/lib/hooks/use-polling";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils/date";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";
import { Loader2, Send } from "lucide-react";

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
    const [content, setContent] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const conversationKey = `${tableId}:${recipientUserId}`;
    const conversation = privateMessages[conversationKey];
    const messages = useMemo(() => conversation?.data || [], [conversation?.data]);
    const isSelfConversation = user?.id === recipientUserId;

    const fetchFn = useCallback(() => {
        if (isSelfConversation) return Promise.resolve();
        return fetchPrivateMessages(tableId, recipientUserId);
    }, [fetchPrivateMessages, isSelfConversation, recipientUserId, tableId]);

    usePolling(fetchFn, {
        interval: 8000,
        enabled: Boolean(tableId && recipientUserId && !isSelfConversation),
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();
        if (!content.trim() || isSendingPrivateMessage || isSelfConversation) return;

        setLocalError(null);
        const result = await sendPrivateMessage(tableId, recipientUserId, content, sessionId);
        if (result.success) {
            setContent("");
        } else {
            setLocalError(result.error || "Erreur lors de l'envoi du message privé.");
        }
    };

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
        <div className="rounded-md border">
            <div className="bg-muted/25 border-b p-3">
                <p className="text-xs font-bold tracking-wide uppercase">MP de table</p>
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                    Conversation avec {recipientName}
                </p>
            </div>

            <div
                ref={scrollRef}
                className="h-56 space-y-3 overflow-y-auto scroll-smooth p-3 sm:h-64"
            >
                {isLoadingPrivateMessages && messages.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="text-primary/50 h-5 w-5 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs italic">
                        Aucun MP pour le moment.
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMe = message.sender_user_id === user?.id;

                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex max-w-[88%] flex-col gap-1",
                                    isMe ? "ml-auto items-end" : "mr-auto items-start",
                                )}
                            >
                                <span className="text-muted-foreground px-1 text-[10px] font-medium">
                                    {formatShortDate(message.created_at)}
                                </span>
                                <div
                                    className={cn(
                                        "rounded-md px-3 py-2 text-xs leading-relaxed shadow-sm",
                                        isMe
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground border",
                                    )}
                                >
                                    <p className="break-words whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="bg-card border-t p-3">
                {localError && (
                    <p className="text-destructive mb-2 text-[11px] font-medium">{localError}</p>
                )}
                <div className="flex items-end gap-2">
                    <Textarea
                        placeholder="Écrire un MP..."
                        className="max-h-24 min-h-11 resize-none text-xs"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        disabled={!content.trim() || isSendingPrivateMessage}
                    >
                        {isSendingPrivateMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
