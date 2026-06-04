"use client";

import { PersonalNoteBlock } from "./personal-note-block";
import { GroupNoteBlock } from "./group-note-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";

type NotesHubProps = Readonly<{
    sessionId: string;
    isGM: boolean;
    showGroupNotes?: boolean;
}>;

/**
 * Hub regroupant les notes personnelles et les notes de groupe.
 * Rôle : Réduire la densité visuelle en utilisant des onglets.
 * Pour le MJ, l'onglet "Groupe" est ouvert par défaut.
 * Pour le Joueur, l'onglet "Perso" est ouvert par défaut.
 */
export function NotesHub({ sessionId, isGM, showGroupNotes = true }: NotesHubProps) {
    if (!showGroupNotes) {
        return <PersonalNoteBlock sessionId={sessionId} />;
    }

    return (
        <Tabs defaultValue={isGM ? "group" : "personal"} className="w-full">
            <TabsList className="bg-muted/50 grid w-full grid-cols-2 p-1">
                <TabsTrigger
                    value="personal"
                    className="flex items-center gap-2 text-xs font-bold tracking-tight uppercase"
                >
                    <User size={14} />
                    Note Perso
                </TabsTrigger>
                <TabsTrigger
                    value="group"
                    className="flex items-center gap-2 text-xs font-bold tracking-tight uppercase"
                >
                    <Users size={14} />
                    Note de Groupe
                </TabsTrigger>
            </TabsList>

            <div className="mt-3">
                <TabsContent value="personal" className="m-0 mt-0">
                    <PersonalNoteBlock sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="group" className="m-0 mt-0">
                    <GroupNoteBlock sessionId={sessionId} isGM={isGM} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
