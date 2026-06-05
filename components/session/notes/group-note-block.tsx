"use client";

import { useEffect, useState, useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2, Clock3, Loader2, RefreshCw, Save, Users } from "lucide-react";

type GroupNoteBlockProps = Readonly<{
    sessionId: string;
    isGM: boolean;
}>;

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "conflict" | "error";

function formatUpdatedAt(value: string | null) {
    if (!value) return null;

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function GroupNoteBlock({ sessionId }: GroupNoteBlockProps) {
    const { groupNotes, fetchGroupNote, saveGroupNote, isLoadingGroupNote, isSavingGroupNote } =
        useSessionStore();

    const note = groupNotes[sessionId];
    const [localContent, setLocalContent] = useState("");
    const [baseContent, setBaseContent] = useState("");
    const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [message, setMessage] = useState<string | null>(null);

    const hasLocalChanges = localContent !== baseContent;
    const formattedUpdatedAt = formatUpdatedAt(baseUpdatedAt);

    const fetchFn = useCallback(async () => {
        await fetchGroupNote(sessionId);
    }, [sessionId, fetchGroupNote]);
    usePolling(fetchFn, {
        interval: 10000,
        enabled: !hasLocalChanges && saveStatus !== "conflict",
        immediate: false,
    });

    useEffect(() => {
        fetchGroupNote(sessionId);
    }, [sessionId, fetchGroupNote]);

    useEffect(() => {
        if (!note) return;

        if (hasLocalChanges) return;

        // Synchronise la copie locale uniquement quand l'utilisateur n'a pas de brouillon.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalContent(note.content);
        setBaseContent(note.content);
        setBaseUpdatedAt(note.updated_at);
    }, [note, hasLocalChanges]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(e.target.value);
        if (saveStatus !== "conflict" && saveStatus !== "saving") {
            setSaveStatus("dirty");
            setMessage(null);
        }
    };

    const handleSave = async () => {
        if (!hasLocalChanges || saveStatus === "saving") return;

        setSaveStatus("saving");
        setMessage(null);

        const result = await saveGroupNote(sessionId, localContent, baseUpdatedAt);

        if (result.success && result.note) {
            setBaseContent(result.note.content);
            setLocalContent(result.note.content);
            setBaseUpdatedAt(result.note.updated_at);
            setSaveStatus("saved");
            setMessage("Note de groupe enregistrée.");
            return;
        }

        if (result.code === "CONFLICT") {
            setSaveStatus("conflict");
            setMessage("La note a changé. Rechargez avant de réessayer.");
            return;
        }

        setSaveStatus("error");
        setMessage(result.error || "La note n'a pas pu être enregistrée.");
    };

    const handleReload = async () => {
        const remoteNote = await fetchGroupNote(sessionId);
        if (remoteNote === undefined) {
            setSaveStatus("error");
            setMessage("Impossible de recharger la note pour le moment.");
            return;
        }

        const content = remoteNote?.content ?? "";
        setLocalContent(content);
        setBaseContent(content);
        setBaseUpdatedAt(remoteNote?.updated_at ?? null);
        setSaveStatus("idle");
        setMessage(null);
    };

    const status = (() => {
        if (isSavingGroupNote || saveStatus === "saving") {
            return (
                <>
                    <Loader2 size={10} className="animate-spin" />
                    Enregistrement...
                </>
            );
        }

        if (saveStatus === "conflict") {
            return (
                <>
                    <AlertTriangle size={10} className="text-amber-600" />
                    Conflit détecté
                </>
            );
        }

        if (saveStatus === "error") {
            return (
                <>
                    <AlertTriangle size={10} className="text-destructive" />
                    Non enregistré
                </>
            );
        }

        if (hasLocalChanges || saveStatus === "dirty") {
            return (
                <>
                    <Clock3 size={10} />
                    Modifié localement
                </>
            );
        }

        if (saveStatus === "saved") {
            return (
                <>
                    <CheckCircle2 size={10} className="text-green-600" />
                    Enregistré
                </>
            );
        }

        return formattedUpdatedAt ? `Mis à jour ${formattedUpdatedAt}` : "Lecture partagée";
    })();

    return (
        <Card className="bg-card/50 flex h-full flex-col shadow-sm">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <Users size={14} className="text-primary" />
                        NOTE DE GROUPE
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-medium">
                        {status}
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-xs">
                        {formattedUpdatedAt
                            ? `Dernière mise à jour : ${formattedUpdatedAt}`
                            : "Aucune version enregistrée pour le moment."}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={handleReload}
                            disabled={isLoadingGroupNote || saveStatus === "saving"}
                        >
                            {isLoadingGroupNote ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <RefreshCw size={14} />
                            )}
                            Recharger
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={handleSave}
                            disabled={
                                !hasLocalChanges ||
                                saveStatus === "saving" ||
                                saveStatus === "conflict"
                            }
                        >
                            {saveStatus === "saving" ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            Enregistrer
                        </Button>
                    </div>
                </div>
                {message ? (
                    <p
                        className={
                            saveStatus === "conflict" || saveStatus === "error"
                                ? "text-xs font-medium text-amber-700"
                                : "text-xs font-medium text-green-700"
                        }
                    >
                        {message}
                    </p>
                ) : null}
                <p className="text-muted-foreground text-xs">
                    Si plusieurs personnes utilisent cette note, rechargez avant de modifier.
                </p>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                {isLoadingGroupNote && !note ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="text-primary/50 h-4 w-4 animate-spin" />
                    </div>
                ) : (
                    <Textarea
                        placeholder="Prenez les notes partagées ici. Enregistrez pour publier vos changements."
                        className="h-full min-h-[180px] resize-none border-none bg-transparent p-0 focus-visible:ring-0"
                        value={localContent}
                        onChange={handleChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}
