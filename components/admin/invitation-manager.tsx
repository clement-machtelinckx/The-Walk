"use client";

import { useState, useEffect } from "react";
import { TableRole } from "@/types/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Copy, Check, Clock } from "lucide-react";
import { RoleBadge } from "@/components/special/role-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useInvitationStore } from "@/store/invitation-store";

interface InvitationManagerProps {
    tableId: string;
}

export function InvitationManager({ tableId }: InvitationManagerProps) {
    const { tableInvitations, isLoading, fetchTableInvitations, createInvitation } =
        useInvitationStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<TableRole>("player");
    const [copiedToken, setCopyToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const invitations = tableInvitations[tableId] || [];

    useEffect(() => {
        fetchTableInvitations(tableId);
    }, [tableId, fetchTableInvitations]);

    const handleCreateInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const result = await createInvitation(tableId, { email, role });

        if (result.success) {
            setEmail("");
        } else {
            setError(result.error || "Erreur lors de la création de l'invitation.");
        }
        setIsSubmitting(false);
    };

    const copyToClipboard = (token: string) => {
        const url = `${window.location.origin}/invitation/${token}`;
        navigator.clipboard.writeText(url);
        setCopyToken(token);
        setTimeout(() => setCopyToken(null), 2000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <UserPlus size={20} className="text-primary" />
                        Inviter un joueur
                    </CardTitle>
                    <CardDescription>
                        Envoyez une invitation par email pour rejoindre votre table.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleCreateInvitation}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <div className="flex-grow">
                            <Input
                                type="email"
                                placeholder="email@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <Select
                                value={role}
                                onValueChange={(v) => setRole(v as TableRole)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="player">Joueur</SelectItem>
                                    <SelectItem value="observer">Observateur</SelectItem>
                                    <SelectItem value="gm">MJ (Co-MJ)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Inviter"
                            )}
                        </Button>
                    </form>
                    {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Invitations envoyées</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && invitations.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="text-muted-foreground animate-spin" />
                        </div>
                    ) : invitations.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm italic">
                            Aucune invitation en attente.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-muted/30 flex items-center justify-between rounded-lg border p-3 text-sm"
                                >
                                    <div className="flex min-w-0 flex-col gap-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-bold">
                                                {invitation.email}
                                            </span>
                                            <RoleBadge role={invitation.role} size="sm" />
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Expire le{" "}
                                                {format(
                                                    new Date(invitation.expires_at!),
                                                    "dd/MM/yyyy",
                                                    { locale: fr },
                                                )}
                                            </span>
                                            <span
                                                className={`font-medium capitalize ${
                                                    invitation.status === "accepted"
                                                        ? "text-primary"
                                                        : invitation.status === "expired"
                                                          ? "text-destructive"
                                                          : ""
                                                }`}
                                            >
                                                • {invitation.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => copyToClipboard(invitation.token)}
                                    >
                                        {copiedToken === invitation.token ? (
                                            <Check size={14} className="text-primary" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                        <span className="ml-2 hidden sm:inline">Lien</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
