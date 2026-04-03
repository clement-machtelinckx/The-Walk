import { requireAuth } from "@/lib/auth/server";
import { TableService } from "@/lib/services/tables/table-service";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { PageShell } from "@/components/layout/app-shell";
import { TableHeader } from "@/components/table/table-header";
import { MemberList } from "@/components/table/member-list";
import { NextSessionSummary } from "@/components/table/next-session-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = await params;
    return {
        title: `Table ${tableId}`,
    };
}

export default async function TableDetailPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const user = await requireAuth();
    const { tableId } = await params;

    const details = await TableService.getTableDetails(user.id, tableId);
    const members = await MembershipService.listMembers(tableId);

    return (
        <PageShell>
            <div className="space-y-8 py-4">
                <TableHeader
                    tableId={tableId}
                    name={details.table.name}
                    description={details.table.description}
                    myRole={details.myRole}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        {/* Summary / Main Feed Placeholder */}
                        <NextSessionSummary tableId={tableId} session={details.nextSession} />

                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Activity size={18} className="text-primary" />
                                    Activité récente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-muted-foreground text-sm italic">
                                    Bientôt disponible : le flux d&apos;activité de votre table.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <MemberList tableId={tableId} members={members} myRole={details.myRole} />

                        {/* Quick Stats / Info Placeholder */}
                        <Card className="bg-card/50 space-y-3 p-4 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                    Date de création
                                </span>
                                <span className="text-xs font-medium">
                                    {new Date(details.table.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                    Identifiant Table
                                </span>
                                <span className="bg-muted ml-2 truncate rounded px-1 font-mono text-[10px]">
                                    {tableId}
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
