"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils/date";

interface LivechatBlockProps {
    sessionId: string;
}

/**
 * Bloc de chat en direct pour la session.
 * Rôle : Communication instantanée.
 * Rendu repliable sur mobile pour économiser de l'espace.
 */
export function LivechatBlock({ sessionId }: LivechatBlockProps) {
    const { user } = useAuthStore();
    const {
        livechats,
        fetchLivechatMessages,
        sendLivechatMessage,
        isLoadingLivechat,
        isSendingLiveMessage,
    } = useSessionStore();
    const [content, setContent] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const livechat = livechats[sessionId];
    const messages = useMemo(() => livechat?.data || [], [livechat]);

    // Polling centralisé (toutes les 5 secondes pour le live)
    const fetchFn = useCallback(() => fetchLivechatMessages(sessionId), [sessionId, fetchLivechatMessages]);
    usePolling(fetchFn, { interval: 5000 });

    // Scroll automatique vers le bas lors de nouveaux messages
    useEffect(() => {
        if (scrollRef.current && !isCollapsed) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isCollapsed]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!content.trim() || isSendingLiveMessage) return;

        const res = await sendLivechatMessage(sessionId, content);
        if (res.success) {
            setContent("");
        }
    };

    return (
        <Card className={cn(
            "border-primary/20 flex w-full flex-col shadow-sm transition-all duration-300",
            isCollapsed ? "h-auto" : "h-[500px] md:h-[600px]"
        )}>
            <CardHeader 
                className={cn(
                    "bg-primary/5 cursor-pointer border-b pb-3 transition-colors hover:bg-primary/10",
                    isCollapsed && "border-b-0"
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <CardTitle className="flex items-center justify-between gap-2 text-lg font-bold tracking-tight uppercase">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-primary" />
                        Chat de Session
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </Button>
                </CardTitle>
            </CardHeader>

            {!isCollapsed && (
                <CardContent className="flex flex-grow flex-col overflow-hidden p-0">
                    {/* Liste des messages */}
                    <div
                        ref={scrollRef}
                        className="flex-grow space-y-4 overflow-y-auto scroll-smooth p-4"
                    >
                        {isLoadingLivechat && messages.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="text-primary/50 h-6 w-6 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-muted-foreground py-10 text-center text-sm italic">
                                La session est lancée ! Échangez ici en direct.
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.user_id === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex max-w-[85%] flex-col space-y-1",
                                            isMe ? "ml-auto items-end" : "mr-auto items-start",
                                        )}
                                    >
                                        <div className="text-muted-foreground flex items-center gap-2 px-1 text-[10px] font-bold tracking-wider uppercase">
                                            {!isMe && (
                                                <span>{msg.profiles?.display_name || "Anonyme"}</span>
                                            )}
                                            <span>{formatShortDate(msg.created_at)}</span>
                                        </div>
                                        <div
                                            className={cn(
                                                "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-muted text-foreground border-border/50 rounded-tl-none border",
                                            )}
                                        >
                                            <p className="break-words whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Saisie */}
                    <div className="bg-card border-t p-4">
                        <form onSubmit={handleSend} className="flex items-end gap-2">
                            <Textarea
                                placeholder="Écrire un message..."
                                className="max-h-[120px] min-h-[60px] resize-none"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                disabled={!content.trim() || isSendingLiveMessage}
                            >
                                {isSendingLiveMessage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
