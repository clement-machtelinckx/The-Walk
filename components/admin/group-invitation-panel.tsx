"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Share2, Info, Link as LinkIcon, Loader2 } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import { useSessionStore } from "@/store/session-store";
import { formatShortDate } from "@/lib/utils/date";
import { TableRole } from "@/types/table";

interface GroupInvitationPanelProps {
    tableId: string;
    tableName: string;
}

export function GroupInvitationPanel({ tableId, tableName }: GroupInvitationPanelProps) {
    const { tableGroupInvitations, fetchTableGroupInvitations, createGroupInvitation } =
        useInvitationStore();
    const { nextSessions } = useSessionStore();
    
    const [role, setRole] = useState<TableRole>("player");
    const [duration, setDuration] = useState<string>("168"); // 1 week default
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchTableGroupInvitations(tableId);
    }, [tableId, fetchTableGroupInvitations]);

    const invitations = tableGroupInvitations[tableId] || [];
    const latestInvitation = invitations[0];
    const nextSession = nextSessions[tableId];

    const handleGenerate = async () => {
        setIsSubmitting(true);
        await createGroupInvitation(tableId, role, parseInt(duration));
        setIsSubmitting(false);
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const inviteUrl = latestInvitation 
        ? `${window.location.origin}/group-invitation/${latestInvitation.token}`
        : "";
    
    const roleLabel = latestInvitation
        ? latestInvitation.role === "gm"
            ? "Maître du Jeu (Co-MJ)"
            : latestInvitation.role === "observer"
              ? "Observateur"
              : "Joueur"
        : "";

    let sessionInfo = "";
    if (nextSession) {
        sessionInfo = `\nProchaine session : "${nextSession.title}" le ${formatShortDate(nextSession.scheduled_at)}`;
    }

    const fullMessage = `Salut ! Rejoignez ma table JDR "${tableName}" sur The-Walk via ce lien de groupe.${sessionInfo}\n\nRejoins-nous ici : ${inviteUrl}\n\n(Il vous suffira de créer un compte ou de vous connecter pour accepter l'invitation)`;

    const shortMessage = `Rejoins ma table JDR "${tableName}" sur The-Walk !\nLien d'invitation de groupe : ${inviteUrl}`;

    return (
        <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <LinkIcon size={18} className="text-primary" />
                    Invitation de groupe (Lien public)
                </CardTitle>
                <CardDescription>
                    Générez un lien temporaire que n&apos;importe qui peut utiliser pour rejoindre la table.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôle</label>
                        <Select value={role} onValueChange={(v) => setRole(v as TableRole)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="player">Joueur</SelectItem>
                                <SelectItem value="observer">Observateur</SelectItem>
                                <SelectItem value="gm">Maître du Jeu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Durée</label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24">24 Heures</SelectItem>
                                <SelectItem value="48">48 Heures</SelectItem>
                                <SelectItem value="168">1 Semaine</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button 
                            className="w-full" 
                            onClick={handleGenerate} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                            Générer le lien
                        </Button>
                    </div>
                </div>

                {!latestInvitation ? (
                    <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                        <p className="text-sm text-muted-foreground italic">
                            Aucun lien actif. Générez-en un pour commencer.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">Lien actif ({roleLabel})</p>
                                <p className="text-xs text-muted-foreground italic">
                                    Expire le {new Date(latestInvitation.expires_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <Tabs defaultValue="full" className="w-full">
                            <TabsList className="mb-4 grid w-full grid-cols-2">
                                <TabsTrigger value="full">Message complet</TabsTrigger>
                                <TabsTrigger value="short">Message court</TabsTrigger>
                            </TabsList>

                            <TabsContent value="full" className="space-y-4">
                                <div className="relative rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                                    {fullMessage}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-grow"
                                        onClick={() => copyToClipboard(fullMessage, "full")}
                                    >
                                        {copiedKey === "full" ? <Check size={16} /> : <Copy size={16} />}
                                        <span className="ml-2">Copier le message</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(inviteUrl, "url")}
                                    >
                                        {copiedKey === "url" ? <Check size={16} /> : <Share2 size={16} />}
                                        <span className="ml-2">Lien seul</span>
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="short" className="space-y-4">
                                <div className="relative rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                                    {shortMessage}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-grow"
                                        onClick={() => copyToClipboard(shortMessage, "short")}
                                    >
                                        {copiedKey === "short" ? <Check size={16} /> : <Copy size={16} />}
                                        <span className="ml-2">Copier le message court</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(inviteUrl, "url")}
                                    >
                                        {copiedKey === "url" ? <Check size={16} /> : <Share2 size={16} />}
                                        <span className="ml-2">Lien seul</span>
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <p>
                        Contrairement à l&apos;invitation par email, ce lien peut être utilisé par n&apos;importe qui possédant le lien.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
