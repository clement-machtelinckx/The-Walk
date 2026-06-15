"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils/date";

export type MessageThreadItem = Readonly<{
    id: string;
    content: string;
    createdAt: string;
    isMine: boolean;
    authorName?: string | null;
}>;

type MessageThreadProps = Readonly<{
    messages: MessageThreadItem[];
    isLoading: boolean;
    isSending: boolean;
    emptyMessage: string;
    placeholder: string;
    sendLabel: string;
    onSend: (content: string) => Promise<{ success: boolean; error?: string }>;
    variant?: "main" | "compact";
}>;

export function MessageThread({
    messages,
    isLoading,
    isSending,
    emptyMessage,
    placeholder,
    sendLabel,
    onSend,
    variant = "main",
}: MessageThreadProps) {
    const [content, setContent] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isCompact = variant === "compact";
    const latestMessageId = messages.at(-1)?.id;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [latestMessageId]);

    const handleSend = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!content.trim() || isSending) return;

        setLocalError(null);
        const result = await onSend(content);
        if (result.success) {
            setContent("");
            return;
        }

        setLocalError(result.error || "Impossible d'envoyer le message.");
    };

    return (
        <div className="flex flex-col overflow-hidden">
            <div
                ref={scrollRef}
                className={cn(
                    "overflow-y-auto scroll-smooth",
                    isCompact
                        ? "h-56 space-y-3 p-3 sm:h-64"
                        : "h-[320px] space-y-4 p-4 sm:h-[420px]",
                )}
            >
                {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="text-primary/50 h-6 w-6 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div
                        className={cn(
                            "text-muted-foreground text-center italic",
                            isCompact ? "py-8 text-xs" : "py-10 text-sm",
                        )}
                    >
                        {emptyMessage}
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex flex-col gap-1",
                                isCompact ? "max-w-[88%]" : "max-w-[85%]",
                                message.isMine ? "ml-auto items-end" : "mr-auto items-start",
                            )}
                        >
                            <div
                                className={cn(
                                    "text-muted-foreground flex items-center gap-2 px-1 text-[10px]",
                                    isCompact
                                        ? "font-medium"
                                        : "font-bold tracking-wider uppercase",
                                )}
                            >
                                {!message.isMine && message.authorName && (
                                    <span>{message.authorName}</span>
                                )}
                                <span>{formatShortDate(message.createdAt)}</span>
                            </div>
                            <div
                                className={cn(
                                    "shadow-sm",
                                    isCompact
                                        ? "rounded-md px-3 py-2 text-xs leading-relaxed"
                                        : "rounded-2xl px-4 py-2 text-sm",
                                    message.isMine
                                        ? cn(
                                              "bg-primary text-primary-foreground",
                                              !isCompact && "rounded-tr-none",
                                          )
                                        : cn(
                                              "bg-muted text-foreground border",
                                              !isCompact && "border-border/50 rounded-tl-none",
                                          ),
                                )}
                            >
                                <p className="break-words whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form
                onSubmit={handleSend}
                className={cn("bg-card border-t", isCompact ? "p-3" : "p-4")}
            >
                {localError && (
                    <p className="text-destructive mb-2 text-[11px] font-medium">{localError}</p>
                )}
                <div className="flex items-end gap-2">
                    <Textarea
                        placeholder={placeholder}
                        className={cn(
                            "resize-none",
                            isCompact ? "max-h-24 min-h-11 text-xs" : "max-h-[120px] min-h-[60px]",
                        )}
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                event.currentTarget.form?.requestSubmit();
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        disabled={!content.trim() || isSending}
                        aria-label={sendLabel}
                    >
                        {isSending ? (
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
