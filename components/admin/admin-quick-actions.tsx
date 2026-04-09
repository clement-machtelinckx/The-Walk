"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Calendar, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";

interface AdminQuickActionsProps {
    tableId: string;
}

/**
 * Bloc d'actions rapides pour le MJ dans l'espace Admin.
 * Rôle : Navigation structurelle uniquement.
 * N'est PAS un cockpit de contrôle de session (pas de bouton Start/Join direct).
 */
export function AdminQuickActions({
    tableId,
}: AdminQuickActionsProps) {
    return (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Zap size={18} className="text-primary fill-primary/20" />
                    Actions rapides MJ
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href={`/tables/${tableId}`}>
                            <ExternalLink size={18} className="mr-2" />
                            Retour à l&apos;accueil table
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href={`/tables/${tableId}/session/next`}>
                            <Calendar size={18} className="mr-2" />
                            Gérer la préparation
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full h-12 text-sm font-medium" asChild>
                        <Link href="#members">
                            <UserPlus size={18} className="mr-2" />
                            Gérer les membres
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
