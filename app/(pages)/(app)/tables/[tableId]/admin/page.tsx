import { requireAuth, requireTableRole } from "@/lib/auth/server";
import { PageShell } from "@/components/layout/app-shell";
import { InvitationManager } from "@/components/admin/invitation-manager";
import { TableRepository } from "@/lib/repositories/table-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Calendar, Link as LinkIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { MemberList } from "@/components/table/member-list";
import { NextSessionAdminBlock } from "@/components/admin/next-session-admin-block";
import { GroupInvitationPanel } from "@/components/admin/group-invitation-panel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
            description="Gestion structurelle de la table."
            actions={
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/tables/${tableId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la table
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col gap-6 py-2 md:py-4">
                {/* 1. Actions Rapides MJ (Plus compactes) */}
                <AdminQuickActions tableId={tableId} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Core Management */}
                    <div className="space-y-6 lg:col-span-7">
                        <section id="session">
                            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-70">
                                <Calendar size={16} className="text-primary" />
                                État de la session
                            </h2>
                            <NextSessionAdminBlock tableId={tableId} />
                        </section>

                        <section id="members">
                            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-70">
                                <Users size={16} className="text-primary" />
                                Membres de la table
                            </h2>
                            <MemberList tableId={tableId} members={members} myRole="gm" />
                        </section>
                    </div>

                    {/* Right Column: Invitations & Secondary (Repliable) */}
                    <div className="space-y-6 lg:col-span-5">
                        <section id="access-management">
                            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest uppercase opacity-70">
                                <Settings2 size={16} className="text-primary" />
                                Accès & Invitations
                            </h2>
                            
                            <Accordion type="multiple" defaultValue={["invitations"]} className="w-full space-y-4">
                                <AccordionItem value="invitations" className="border rounded-xl bg-card px-4">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <UserPlus size={18} className="text-primary" />
                                            Invitations ciblées (Email)
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6">
                                        <InvitationManager tableId={tableId} />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="group-invitations" className="border rounded-xl bg-card px-4">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <LinkIcon size={18} className="text-primary" />
                                            Lien d&apos;invitation public
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6">
                                        <GroupInvitationPanel tableId={tableId} tableName={table.name} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
