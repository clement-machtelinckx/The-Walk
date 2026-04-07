"use client";

import { useEffect, useState, useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Save, CheckCircle2 } from "lucide-react";
import { debounce } from "@/lib/utils/debounce";

interface PersonalNoteBlockProps {
    sessionId: string;
}

export function PersonalNoteBlock({ sessionId }: PersonalNoteBlockProps) {
    const {
        personalNotes,
        fetchPersonalNote,
        savePersonalNote,
        isLoadingPersonalNote,
        isSavingPersonalNote,
    } = useSessionStore();

    const note = personalNotes[sessionId];
    const [localContent, setLocalContent] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Chargement initial
    useEffect(() => {
        fetchPersonalNote(sessionId);
    }, [sessionId, fetchPersonalNote]);

    // Synchro locale
    useEffect(() => {
        if (note) {
            setLocalContent(note.content);
        }
    }, [note]);

    // Autosave avec debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(async (content: string) => {
            if (content === note?.content) return;
            const res = await savePersonalNote(sessionId, content);
            if (res.success) {
                setLastSaved(new Date());
            }
        }, 1000),
        [sessionId, savePersonalNote, note?.content]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalContent(val);
        debouncedSave(val);
    };

    return (
        <Card className="bg-card/50 flex h-full flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <User size={14} className="text-primary" />
                    MA NOTE PERSO
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                    {isSavingPersonalNote ? (
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
                            Auto-save
                        </>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                {isLoadingPersonalNote && !note ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
                    </div>
                ) : (
                    <Textarea
                        placeholder="Prenez vos notes personnelles ici... Elles sont conservées de session en session."
                        className="h-full min-h-[150px] resize-none border-none bg-transparent p-0 focus-visible:ring-0"
                        value={localContent}
                        onChange={handleChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}
