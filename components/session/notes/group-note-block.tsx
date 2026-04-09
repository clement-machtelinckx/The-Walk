"use client";

import { useEffect, useState, useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import { usePolling } from "@/lib/hooks/use-polling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, Save, CheckCircle2 } from "lucide-react";
import { debounce } from "@/lib/utils/debounce";

interface GroupNoteBlockProps {
    sessionId: string;
    isGM: boolean;
}

export function GroupNoteBlock({ sessionId, isGM }: GroupNoteBlockProps) {
    const {
        groupNotes,
        fetchGroupNote,
        saveGroupNote,
        isLoadingGroupNote,
        isSavingGroupNote,
    } = useSessionStore();

    const note = groupNotes[sessionId];
    const [localContent, setLocalContent] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Polling centralisé pour les joueurs (toutes les 10s)
    const fetchFn = useCallback(() => fetchGroupNote(sessionId), [sessionId, fetchGroupNote]);
    usePolling(fetchFn, { 
        interval: 10000,
        enabled: !isGM, // Seulement si ce n'est pas le MJ
        immediate: false // Le premier chargement est géré par le useEffect ci-dessous
    });

    // Chargement initial pour tous (MJ inclus)
    useEffect(() => {
        fetchGroupNote(sessionId);
    }, [sessionId, fetchGroupNote]);

    // Synchro locale
    useEffect(() => {
        if (note) {
            setLocalContent(note.content);
        }
    }, [note]);

    // Autosave avec debounce (MJ seulement)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(async (content: string) => {
            if (content === note?.content) return;
            const res = await saveGroupNote(sessionId, content);
            if (res.success) {
                setLastSaved(new Date());
            }
        }, 1000),
        [sessionId, saveGroupNote, isGM, note?.content]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isGM) return;
        const val = e.target.value;
        setLocalContent(val);
        debouncedSave(val);
    };

    return (
        <Card className="bg-card/50 flex h-full flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <Users size={14} className="text-primary" />
                    NOTE DE GROUPE
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                    {isGM ? (
                        isSavingGroupNote ? (
                            <>
                                <Loader2 size={10} className="animate-spin" />
                                Sauvegarde...
                            </>
                        ) : lastSaved ? (
                            <>
                                <CheckCircle2 size={10} className="text-green-600" />
                                Enregistré
                            </>
                        ) : (
                            <>
                                <Save size={10} />
                                Auto-save (MJ)
                            </>
                        )
                    ) : (
                        "Lecture seule"
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                {isLoadingGroupNote && !note ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
                    </div>
                ) : (
                    <Textarea
                        placeholder={
                            isGM 
                            ? "Prenez les notes partagées ici... Elles sont conservées de session en session." 
                            : "Aucune note de groupe pour le moment."
                        }
                        className="h-full min-h-[150px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 disabled:opacity-100"
                        value={localContent}
                        onChange={handleChange}
                        readOnly={!isGM}
                    />
                )}
            </CardContent>
        </Card>
    );
}
