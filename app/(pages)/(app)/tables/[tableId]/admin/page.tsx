import { requireAuth, requireTableRole } from "@/lib/auth/server";
import { PageShell } from "@/components/layout/app-shell";
import { InvitationManager } from "@/components/admin/invitation-manager";
import { TableRepository } from "@/lib/repositories/table-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Calendar, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { MemberList } from "@/components/table/member-list";
import { NextSessionAdminBlock } from "@/components/admin/next-session-admin-block";
import { GroupInvitationPanel } from "@/components/admin/group-invitation-panel";

export default async function TableAdminPage({ params }: { params: Promise<{ tableId: string }> }) {
    await requireAuth();
    const { tableId } = await params;

    // Ensure user is GM
    await requireTableRole(tableId, "gm");

    const [table, members, nextSession, activeSession] = await Promise.all([
        TableRepository.getById(tableId),
        MembershipService.listMembers(tableId),
        SessionRepository.getNextSession(tableId),
        SessionRepository.getActiveSessionByTable(tableId),
    ]);

    return (
        <PageShell
            title={`Administration : ${table.name}`}
            description="Cockpit de pilotage de la table et des sessions."
            actions={
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/tables/${tableId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la table
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col gap-8 py-4">
                {/* 1. Actions Rapides MJ */}
                <AdminQuickActions
                    tableId={tableId}
                    hasActiveSession={!!activeSession}
                    hasPendingSession={!!nextSession}
                    activeSessionId={activeSession?.id}
                    pendingSessionId={nextSession?.id}
                />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Sessions & RSVPs */}
                    <div className="space-y-8 lg:col-span-7">
                        <section id="session">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                <Calendar size={20} className="text-primary" />
                                Pilotage Session
                            </h2>
                            <NextSessionAdminBlock tableId={tableId} />
                        </section>
                    </div>

                    {/* Right Column: Members & Invitations */}
                    <div className="space-y-8 lg:col-span-5">
                        <section id="members">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                <Users size={20} className="text-primary" />
                                Gestion des membres
                            </h2>
                            <MemberList tableId={tableId} members={members} myRole="gm" />
                        </section>

                        <section id="invitations">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                <UserPlus size={20} className="text-primary" />
                                Invitations ciblées (par email)
                            </h2>
                            <InvitationManager tableId={tableId} />
                        </section>

                        <section id="group-invitations">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                <LinkIcon size={20} className="text-primary" />
                                Invitations de groupe (Lien public)
                            </h2>
                            <GroupInvitationPanel tableId={tableId} tableName={table.name} />
                        </section>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
