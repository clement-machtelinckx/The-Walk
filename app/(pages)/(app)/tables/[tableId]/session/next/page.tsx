import { requireAuth } from "@/lib/auth/server";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { TableRepository } from "@/lib/repositories/table-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { PageShell } from "@/components/layout/app-shell";
import { NextSessionContainer } from "@/components/session/next-session-container";
import { SessionToolsDrawer } from "@/components/session/session-tools-drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NextSessionPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const user = await requireAuth();
    const { tableId } = await params;

    const membership = await MembershipService.requireMembership(user.id, tableId);
    const table = await TableRepository.getById(tableId);
    const nextSession = await SessionRepository.getNextSession(tableId);
    const activeSession = await SessionRepository.getActiveSessionByTable(tableId);

    return (
        <PageShell
            title={`Prochaine Session : ${table.name}`}
            description="Informations et planification de votre prochaine rencontre."
            actions={
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/tables/${tableId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la table
                    </Link>
                </Button>
            }
        >
            <SessionToolsDrawer
                isGM={membership.role === "gm"}
                tableId={tableId}
                context="pre-session"
                sessionId={nextSession?.id ?? activeSession?.id}
            />
            <NextSessionContainer tableId={tableId} myRole={membership.role} />
        </PageShell>
    );
}
