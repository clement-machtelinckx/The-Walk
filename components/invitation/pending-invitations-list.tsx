"use client";

import { useState, useEffect } from "react";
import { InvitationWithTable } from "@/lib/services/invitations/invitation-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { RoleBadge } from "@/components/special/role-badge";
import Link from "next/link";

export function PendingInvitationsList() {
    const [invitations, setInvitations] = useState<InvitationWithTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvitations = async () => {
        try {
            const res = await fetch("/api/invitations");
            const data = await res.json();
            if (res.ok) {
                setInvitations(data.invitations);
            } else {
                setError(data.error || "Erreur lors de la récupération des invitations");
            }
        } catch (err) {
            setError("Erreur réseau");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>
        );
    }

    if (invitations.length === 0) {
        return null; // Don't show anything if no invitations
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail size={18} className="text-primary" />
                    Invitations en attente ({invitations.length})
                </CardTitle>
                <CardDescription>On vous a invité à rejoindre ces tables de jeu.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invitations.map((invitation) => (
                        <div
                            key={invitation.id}
                            className="bg-card flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center"
                        >
                            <div className="space-y-1">
                                <h4 className="text-primary font-bold">{invitation.tables.name}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Rôle :</span>
                                    <RoleBadge role={invitation.role} size="sm" />
                                </div>
                            </div>
                            <Button asChild size="sm">
                                <Link href={`/invitation/${invitation.token}`}>
                                    Voir l&apos;invitation
                                    <ArrowRight size={14} className="ml-2" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
