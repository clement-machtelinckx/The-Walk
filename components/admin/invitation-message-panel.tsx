"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, MessageSquare, Share2, Info } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import { useSessionStore } from "@/store/session-store";
import { formatShortDate } from "@/lib/utils/date";

interface InvitationMessagePanelProps {
    tableId: string;
    tableName: string;
}

export function InvitationMessagePanel({ tableId, tableName }: InvitationMessagePanelProps) {
    const { tableInvitations } = useInvitationStore();
    const { nextSessions } = useSessionStore();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const invitations = tableInvitations[tableId] || [];
    const pendingInvitations = invitations.filter((inv) => inv.status === "pending");
    const latestInvitation = pendingInvitations[0];
    const nextSession = nextSessions[tableId];

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (!latestInvitation) {
        return (
            <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Info className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground italic">
                        Créez d&apos;abord une invitation pour générer un message de partage.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const inviteUrl = `${window.location.origin}/invitation/${latestInvitation.token}`;
    const roleLabel =
        latestInvitation.role === "gm"
            ? "Maître du Jeu (Co-MJ)"
            : latestInvitation.role === "observer"
              ? "Observateur"
              : "Joueur";

    // Build messages
    let sessionInfo = "";
    if (nextSession) {
        sessionInfo = `\nProchaine session : "${nextSession.title}" le ${formatShortDate(nextSession.scheduled_at)}`;
    }

    const fullMessage = `Salut ! Je t'invite à rejoindre ma table JDR "${tableName}" sur The-Walk.${sessionInfo}\n\nTon rôle : ${roleLabel}\n\nRejoins-nous ici : ${inviteUrl}\n\n(Il te suffira de créer un compte ou de te connecter pour accepter l'invitation)`;

    const shortMessage = `Rejoins ma table JDR "${tableName}" sur The-Walk !\nInvitation (${roleLabel}) : ${inviteUrl}`;

    return (
        <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Share2 size={18} className="text-primary" />
                    Partager l&apos;invitation
                </CardTitle>
                <CardDescription>
                    Copiez un message prêt à l&apos;envoi pour vos joueurs (Discord, WhatsApp, SMS).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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

                <div className="mt-6 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <p>
                        L&apos;invitation est liée à l&apos;email saisi. Le joueur devra utiliser
                        cet email pour rejoindre la table.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
